-- =====================================================
-- rpc_trip_detail_summary + rpc_trip_members + rpc_trip_detail_schedule
-- =====================================================
-- SECURITY DEFINER로 변경하여 RLS 재귀(42P17) 방지
-- 내부에서 직접 권한 체크 수행
-- =====================================================

-- =====================================================
-- 1. rpc_trip_detail_summary
-- =====================================================
DROP FUNCTION IF EXISTS public.rpc_trip_detail_summary(uuid);

CREATE FUNCTION public.rpc_trip_detail_summary(p_trip_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_result jsonb;
BEGIN
  -- 권한 체크: public trip이거나 멤버인 경우만 허용
  IF NOT EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = p_trip_id
    AND (
      t.visibility = 'public'
      OR EXISTS (
        SELECT 1 FROM public.trip_members tm
        WHERE tm.trip_id = p_trip_id AND tm.user_id = v_uid
      )
    )
  ) THEN
    RAISE EXCEPTION 'trip_not_found' USING errcode = 'P0001';
  END IF;

  SELECT jsonb_build_object(
    'trip', jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'summary', t.summary,
      'coverUrl', t.cover_image_url,
      'startDate', t.start_date,
      'endDate', t.end_date,
      'visibility', t.visibility,
      'createdAt', t.created_at
    ),
    'author', jsonb_build_object(
      'id', a.id,
      'displayName', coalesce(a.full_name, a.username),
      'avatarUrl', a.avatar_url
    ),
    'counts', jsonb_build_object(
      'likeCount', (SELECT count(*) FROM public.trip_likes tl WHERE tl.trip_id = t.id),
      'bookmarkCount', (SELECT count(*) FROM public.trip_bookmarks tb WHERE tb.trip_id = t.id)
    ),
    'viewer', jsonb_build_object(
      'role', (SELECT tm.role FROM public.trip_members tm WHERE tm.trip_id = t.id AND tm.user_id = v_uid),
      'isLiked', (v_uid IS NOT NULL) AND EXISTS (
        SELECT 1 FROM public.trip_likes tl WHERE tl.trip_id = t.id AND tl.user_id = v_uid
      ),
      'isBookmarked', (v_uid IS NOT NULL) AND EXISTS (
        SELECT 1 FROM public.trip_bookmarks tb WHERE tb.trip_id = t.id AND tb.user_id = v_uid
      )
    )
  )
  INTO v_result
  FROM public.trips t
  JOIN public.profiles a ON a.id = t.created_by
  WHERE t.id = p_trip_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'trip_not_found' USING errcode = 'P0001';
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_trip_detail_summary(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.rpc_trip_detail_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_trip_detail_summary(uuid) TO anon;

-- =====================================================
-- 2. rpc_trip_members
-- =====================================================
DROP FUNCTION IF EXISTS public.rpc_trip_members(uuid);

CREATE FUNCTION public.rpc_trip_members(p_trip_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF p_trip_id IS NULL THEN
    RAISE EXCEPTION 'bad_request' USING errcode = 'P0001';
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING errcode = 'P0001';
  END IF;

  -- 권한 체크: 해당 trip의 멤버만 조회 가능
  IF NOT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = p_trip_id
      AND tm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'not_found' USING errcode = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'tripId', p_trip_id,
    'members', coalesce(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'userId', tm.user_id,
            'role', lower(trim(tm.role::text)),
            'displayName', coalesce(p.full_name, p.username),
            'isSelf', (tm.user_id = v_user_id)
          )
          ORDER BY
            CASE WHEN lower(trim(tm.role::text)) = 'owner' THEN 0 ELSE 1 END,
            coalesce(p.full_name, p.username)
        )
        FROM public.trip_members tm
        LEFT JOIN public.profiles p ON p.id = tm.user_id
        WHERE tm.trip_id = p_trip_id
      ),
      '[]'::jsonb
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_trip_members(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.rpc_trip_members(uuid) TO authenticated;

-- =====================================================
-- 3. rpc_trip_detail_schedule
-- =====================================================
-- 기존: SECURITY INVOKER + language sql + 권한 체크 없음
-- 변경: SECURITY DEFINER + language plpgsql + 권한 체크 추가
-- schedule_items RLS가 can_view_trip()을 참조 → 재귀 위험
DROP FUNCTION IF EXISTS public.rpc_trip_detail_schedule(uuid);

CREATE FUNCTION public.rpc_trip_detail_schedule(p_trip_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_result jsonb;
BEGIN
  -- 권한 체크: public trip이거나 멤버인 경우만 허용
  IF NOT EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = p_trip_id
    AND (
      t.visibility = 'public'
      OR EXISTS (
        SELECT 1 FROM public.trip_members tm
        WHERE tm.trip_id = p_trip_id AND tm.user_id = v_uid
      )
    )
  ) THEN
    RAISE EXCEPTION 'trip_not_found' USING errcode = 'P0001';
  END IF;

  -- 스케줄 데이터 조회 (RLS 우회 — SECURITY DEFINER이므로 위에서 권한 이미 검증)
  WITH d AS (
    SELECT
      td.id AS trip_day_id,
      td.date,
      td.notes
    FROM public.trip_days td
    WHERE td.trip_id = p_trip_id
    ORDER BY td.date ASC
  ),
  i AS (
    SELECT
      si.id AS item_id,
      si.trip_day_id,
      si.time,
      si.duration_minutes,
      si.notes,
      si.order_index,
      si.place_id,
      p.name AS place_name,
      p.latitude AS lat,
      p.longitude AS lng
    FROM public.schedule_items si
    JOIN public.places p ON p.id = si.place_id
    WHERE si.trip_day_id IN (SELECT trip_day_id FROM d)
  )
  SELECT jsonb_build_object(
    'days',
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'dayId', d.trip_day_id,
          'date', d.date,
          'notes', d.notes,
          'items', (
            SELECT coalesce(
              jsonb_agg(
                jsonb_build_object(
                  'itemId', i.item_id,
                  'time', i.time,
                  'durationMinutes', i.duration_minutes,
                  'notes', i.notes,
                  'orderIndex', i.order_index,
                  'place', jsonb_build_object(
                    'id', i.place_id,
                    'name', i.place_name,
                    'lat', i.lat,
                    'lng', i.lng
                  )
                )
                ORDER BY i.time ASC NULLS LAST, i.order_index ASC
              ),
              '[]'::jsonb
            )
            FROM i
            WHERE i.trip_day_id = d.trip_day_id
          )
        )
        ORDER BY d.date ASC
      ),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM d;

  RETURN coalesce(v_result, jsonb_build_object('days', '[]'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_trip_detail_schedule(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.rpc_trip_detail_schedule(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_trip_detail_schedule(uuid) TO anon;

-- =====================================================
-- PostgREST 스키마 캐시 갱신
-- =====================================================
NOTIFY pgrst, 'reload schema';
