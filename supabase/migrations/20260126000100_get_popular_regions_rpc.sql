-- 20260126000100_get_popular_regions_rpc.sql
-- 인기 여행지(지역) 리스트 조회 RPC
-- 최근 N일 동안 받은 좋아요 수를 지역 score로 집계

CREATE OR REPLACE FUNCTION public.get_popular_regions(
  days integer DEFAULT 30,              -- 최근 기준 일수
  page_size integer DEFAULT 20,          -- 페이지 사이즈
  cursor_score bigint DEFAULT NULL,      -- keyset pagination용 score 커서
  cursor_region_id uuid DEFAULT NULL     -- keyset pagination용 region 커서
)
RETURNS TABLE (
  region_id uuid,
  region_name text,
  score bigint,
  trip_count bigint
)
LANGUAGE sql
STABLE
AS $$
  -- 1. 지역별 점수/여행 수 집계
  WITH region_scores AS (
    SELECT
      r.id AS region_id,
      r.name AS region_name,

      -- 최근 N일간 받은 좋아요 수 (없으면 0)
      COUNT(l.*)::bigint AS score,

      -- 해당 지역에 매핑된 public trip 수
      COUNT(DISTINCT t.id)::bigint AS trip_count
    FROM public.regions r

    -- 지역 ↔ 여행 매핑
    LEFT JOIN public.trip_regions tr
      ON tr.region_id = r.id

    -- 공개된 여행만 집계 대상
    LEFT JOIN public.trips t
      ON t.id = tr.trip_id
     AND t.visibility = 'public'

    -- 최근 N일 좋아요만 점수로 사용
    LEFT JOIN public.trip_likes l
      ON l.trip_id = t.id
     AND l.created_at >= now() - (days || ' days')::interval

    GROUP BY r.id, r.name
  )

  -- 2. 페이지네이션 + 정렬
  SELECT *
  FROM region_scores
  WHERE
    -- public trip이 1개 이상 있는 지역만 노출
    trip_count > 0
    AND (
      -- 첫 페이지
      (cursor_score IS NULL AND cursor_region_id IS NULL)
      -- 다음 페이지 (keyset pagination)
      OR (score, region_id) < (cursor_score, cursor_region_id)
    )
  ORDER BY score DESC, region_id DESC
  LIMIT page_size;
$$;

-- anon / authenticated 모두 호출 가능
GRANT EXECUTE ON FUNCTION public.get_popular_regions(integer, integer, bigint, uuid)
TO anon, authenticated;
