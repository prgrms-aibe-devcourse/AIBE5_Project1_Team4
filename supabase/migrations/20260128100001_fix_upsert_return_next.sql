-- =============================================================
-- upsert_schedule_item: RETURN NEXT 후 함수 미종료 버그 수정
-- =============================================================
-- 원인: RETURNS TABLE 함수에서 RETURN NEXT는 결과셋에 row를 추가할 뿐
--       함수를 종료하지 않음 → UPDATE 후 INSERT 브랜치로 fall-through
--       → 매 UPDATE마다 중복 INSERT 발생
-- 수정: UPDATE 브랜치 끝에 RETURN; 추가하여 함수 즉시 종료
-- =============================================================

-- 기존 함수 DROP 후 재생성 (반환 타입 통일: out_id)
DROP FUNCTION IF EXISTS public.upsert_schedule_item(uuid, uuid, uuid, time, integer, text);

CREATE FUNCTION public.upsert_schedule_item(
  p_id uuid DEFAULT NULL,
  p_trip_day_id uuid DEFAULT NULL,
  p_place_id uuid DEFAULT NULL,
  p_time time DEFAULT NULL,
  p_duration_minutes integer DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS TABLE (out_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_trip_id uuid;
  v_trip_day_id uuid;
  v_next_order_index integer;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- =========================
  -- UPDATE (p_id != null)
  -- =========================
  IF p_id IS NOT NULL THEN
    SELECT td.trip_id, si.trip_day_id
      INTO v_trip_id, v_trip_day_id
    FROM public.schedule_items si
    JOIN public.trip_days td ON td.id = si.trip_day_id
    WHERE si.id = p_id;

    IF v_trip_id IS NULL THEN
      RAISE EXCEPTION 'NOT_FOUND';
    END IF;

    PERFORM public.assert_trip_editor(v_trip_id);

    UPDATE public.schedule_items si
       SET place_id         = COALESCE(p_place_id, si.place_id),
           time             = p_time,
           duration_minutes = p_duration_minutes,
           notes            = p_notes,
           updated_at       = now(),
           updated_by       = v_uid
     WHERE si.id = p_id;

    out_id := p_id;
    RETURN NEXT;
    RETURN;  -- ★ 함수 종료 (INSERT 브랜치로 fall-through 방지)
  END IF;

  -- =========================
  -- INSERT (p_id == null)
  -- =========================
  IF p_trip_day_id IS NULL OR p_place_id IS NULL THEN
    RAISE EXCEPTION 'BAD_REQUEST';
  END IF;

  SELECT td.trip_id
    INTO v_trip_id
  FROM public.trip_days td
  WHERE td.id = p_trip_day_id
  FOR UPDATE;

  IF v_trip_id IS NULL THEN
    RAISE EXCEPTION 'BAD_REQUEST';
  END IF;

  PERFORM public.assert_trip_editor(v_trip_id);

  SELECT COALESCE(MAX(si.order_index), -1) + 1
    INTO v_next_order_index
  FROM public.schedule_items si
  WHERE si.trip_day_id = p_trip_day_id;

  INSERT INTO public.schedule_items (
    trip_day_id, place_id, time, duration_minutes, notes, order_index, updated_by
  ) VALUES (
    p_trip_day_id, p_place_id, p_time, p_duration_minutes, p_notes, v_next_order_index, v_uid
  )
  RETURNING public.schedule_items.id INTO out_id;

  RETURN NEXT;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_schedule_item(uuid, uuid, uuid, time, integer, text)
  TO authenticated;

-- =============================================================
-- delete_schedule_item: 동일 패턴 수정
-- =============================================================
DROP FUNCTION IF EXISTS public.delete_schedule_item(uuid);

CREATE FUNCTION public.delete_schedule_item(p_id uuid)
RETURNS TABLE (out_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_trip_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT td.trip_id
    INTO v_trip_id
  FROM public.schedule_items si
  JOIN public.trip_days td ON td.id = si.trip_day_id
  WHERE si.id = p_id;

  IF v_trip_id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;

  PERFORM public.assert_trip_editor(v_trip_id);

  DELETE FROM public.schedule_items si
  WHERE si.id = p_id;

  out_id := p_id;
  RETURN NEXT;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_schedule_item(uuid) TO authenticated;

-- =============================================================
-- 중복 데이터 정리
-- =============================================================
-- 같은 trip_day_id + place_id 조합에서 나중에 생긴 row 삭제
DELETE FROM public.schedule_items
WHERE id IN (
  SELECT si.id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY trip_day_id, place_id
             ORDER BY created_at ASC, order_index ASC
           ) AS rn
    FROM public.schedule_items
  ) si
  WHERE si.rn > 1
);

NOTIFY pgrst, 'reload schema';
