-- =====================================================
-- Trip Planner - Review System Migration
-- =====================================================
-- 리뷰 기능 분리:
--   - trip_reviews: Trip에 대한 리뷰
--   - place_reviews: Place에 대한 리뷰
--
-- 요구사항:
--   - Trip 리뷰: public trip은 로그인 유저 모두, unlisted/private은 멤버만
--   - Place 리뷰: 로그인 유저 모두
--   - 유저당 대상별 1개 리뷰 (upsert)
--   - 내 리뷰 우선 정렬
-- =====================================================

-- =====================================================
-- STEP 1: 기존 reviews 테이블 정리
-- =====================================================

-- 기존 reviews 테이블의 RLS 정책 삭제
DROP POLICY IF EXISTS reviews_select_policy ON reviews;
DROP POLICY IF EXISTS reviews_insert_policy ON reviews;
DROP POLICY IF EXISTS reviews_update_policy ON reviews;
DROP POLICY IF EXISTS reviews_delete_policy ON reviews;

-- 기존 reviews 트리거 삭제
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

-- 기존 reviews 테이블 삭제 (데이터 마이그레이션 필요시 별도 처리)
DROP TABLE IF EXISTS reviews CASCADE;

-- =====================================================
-- STEP 2: Helper Functions
-- =====================================================

-- Function: can_write_trip_review
-- Trip 리뷰 작성 가능 여부 확인
-- - public trip: 로그인한 유저라면 누구나
-- - unlisted/private: 멤버만
CREATE OR REPLACE FUNCTION can_write_trip_review(p_trip_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_visibility text;
BEGIN
  -- 로그인 필수
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Trip visibility 확인
  SELECT visibility INTO v_visibility
  FROM trips
  WHERE id = p_trip_id;

  -- Trip이 존재하지 않으면 false
  IF v_visibility IS NULL THEN
    RETURN false;
  END IF;

  -- public trip: 누구나 작성 가능
  IF v_visibility = 'public' THEN
    RETURN true;
  END IF;

  -- unlisted/private: 멤버만 작성 가능
  RETURN is_trip_member(p_trip_id);
END;
$$;

-- Function: can_read_trip_review
-- Trip 리뷰 읽기 가능 여부 확인
-- - public trip: 누구나
-- - unlisted/private: 멤버만
CREATE OR REPLACE FUNCTION can_read_trip_review(p_trip_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_visibility text;
BEGIN
  -- Trip visibility 확인
  SELECT visibility INTO v_visibility
  FROM trips
  WHERE id = p_trip_id;

  -- Trip이 존재하지 않으면 false
  IF v_visibility IS NULL THEN
    RETURN false;
  END IF;

  -- public trip: 누구나 읽기 가능
  IF v_visibility = 'public' THEN
    RETURN true;
  END IF;

  -- unlisted/private: 멤버만 읽기 가능
  RETURN is_trip_member(p_trip_id);
END;
$$;

-- =====================================================
-- STEP 3: trip_reviews 테이블
-- =====================================================

CREATE TABLE trip_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- 유저당 Trip별 1개 리뷰
  CONSTRAINT uq_trip_review_author UNIQUE (trip_id, author_id),
  -- rating 범위 제한
  CONSTRAINT chk_trip_review_rating CHECK (rating >= 1 AND rating <= 5)
);

-- 인덱스
CREATE INDEX idx_trip_reviews_trip_id ON trip_reviews(trip_id);
CREATE INDEX idx_trip_reviews_author_id ON trip_reviews(author_id);
CREATE INDEX idx_trip_reviews_created_at ON trip_reviews(created_at DESC);
CREATE INDEX idx_trip_reviews_rating ON trip_reviews(rating);
-- 내 리뷰 우선 정렬을 위한 복합 인덱스
CREATE INDEX idx_trip_reviews_sort ON trip_reviews(trip_id, updated_at DESC);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER update_trip_reviews_updated_at
  BEFORE UPDATE ON trip_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: place_reviews 테이블
-- =====================================================

CREATE TABLE place_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- 유저당 Place별 1개 리뷰
  CONSTRAINT uq_place_review_author UNIQUE (place_id, author_id),
  -- rating 범위 제한
  CONSTRAINT chk_place_review_rating CHECK (rating >= 1 AND rating <= 5)
);

-- 인덱스
CREATE INDEX idx_place_reviews_place_id ON place_reviews(place_id);
CREATE INDEX idx_place_reviews_author_id ON place_reviews(author_id);
CREATE INDEX idx_place_reviews_created_at ON place_reviews(created_at DESC);
CREATE INDEX idx_place_reviews_rating ON place_reviews(rating);
-- 내 리뷰 우선 정렬을 위한 복합 인덱스
CREATE INDEX idx_place_reviews_sort ON place_reviews(place_id, updated_at DESC);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER update_place_reviews_updated_at
  BEFORE UPDATE ON place_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: RLS 활성화
-- =====================================================

ALTER TABLE trip_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: trip_reviews RLS 정책
-- =====================================================

-- SELECT: can_read_trip_review = true
CREATE POLICY trip_reviews_select_policy ON trip_reviews
  FOR SELECT
  USING (can_read_trip_review(trip_id));

-- INSERT: author_id = auth.uid() AND can_write_trip_review(trip_id)
CREATE POLICY trip_reviews_insert_policy ON trip_reviews
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    can_write_trip_review(trip_id)
  );

-- UPDATE: author_id = auth.uid()
CREATE POLICY trip_reviews_update_policy ON trip_reviews
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- DELETE: author_id = auth.uid()
CREATE POLICY trip_reviews_delete_policy ON trip_reviews
  FOR DELETE
  USING (author_id = auth.uid());

-- =====================================================
-- STEP 7: place_reviews RLS 정책
-- =====================================================

-- SELECT: public (누구나 읽기 가능)
CREATE POLICY place_reviews_select_policy ON place_reviews
  FOR SELECT
  USING (true);

-- INSERT: author_id = auth.uid() (로그인한 유저만)
CREATE POLICY place_reviews_insert_policy ON place_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid()
  );

-- UPDATE: author_id = auth.uid()
CREATE POLICY place_reviews_update_policy ON place_reviews
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- DELETE: author_id = auth.uid()
CREATE POLICY place_reviews_delete_policy ON place_reviews
  FOR DELETE
  USING (author_id = auth.uid());

-- =====================================================
-- STEP 8: 집계 뷰 - trip_review_stats
-- =====================================================

CREATE OR REPLACE VIEW trip_review_stats AS
SELECT
  trip_id,
  COUNT(*)::integer AS review_count,
  ROUND(AVG(rating)::numeric, 2) AS avg_rating
FROM trip_reviews
GROUP BY trip_id;

-- =====================================================
-- STEP 9: 집계 뷰 - place_review_stats
-- =====================================================

CREATE OR REPLACE VIEW place_review_stats AS
SELECT
  place_id,
  COUNT(*)::integer AS review_count,
  ROUND(AVG(rating)::numeric, 2) AS avg_rating
FROM place_reviews
GROUP BY place_id;

-- =====================================================
-- STEP 10: RPC - list_trip_reviews
-- "내 리뷰 우선" 정렬
-- =====================================================

CREATE OR REPLACE FUNCTION list_trip_reviews(
  p_trip_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  trip_id uuid,
  author_id uuid,
  rating integer,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  -- 작성자 프로필 정보
  author_username text,
  author_full_name text,
  author_avatar_url text,
  -- 내 리뷰 여부
  is_mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_current_user uuid;
BEGIN
  v_current_user := auth.uid();

  -- 읽기 권한 확인
  IF NOT can_read_trip_review(p_trip_id) THEN
    RAISE EXCEPTION 'Access denied: cannot read reviews for this trip';
  END IF;

  RETURN QUERY
  SELECT
    tr.id,
    tr.trip_id,
    tr.author_id,
    tr.rating,
    tr.content,
    tr.created_at,
    tr.updated_at,
    p.username AS author_username,
    p.full_name AS author_full_name,
    p.avatar_url AS author_avatar_url,
    (tr.author_id = v_current_user) AS is_mine
  FROM trip_reviews tr
  JOIN profiles p ON p.id = tr.author_id
  WHERE tr.trip_id = p_trip_id
  ORDER BY
    -- 내 리뷰 우선
    (CASE WHEN tr.author_id = v_current_user THEN 0 ELSE 1 END),
    -- 그 다음 최신순
    tr.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- STEP 11: RPC - list_place_reviews
-- "내 리뷰 우선" 정렬
-- =====================================================

CREATE OR REPLACE FUNCTION list_place_reviews(
  p_place_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  place_id uuid,
  author_id uuid,
  rating integer,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  -- 작성자 프로필 정보
  author_username text,
  author_full_name text,
  author_avatar_url text,
  -- 내 리뷰 여부
  is_mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_current_user uuid;
BEGIN
  v_current_user := auth.uid();

  RETURN QUERY
  SELECT
    pr.id,
    pr.place_id,
    pr.author_id,
    pr.rating,
    pr.content,
    pr.created_at,
    pr.updated_at,
    p.username AS author_username,
    p.full_name AS author_full_name,
    p.avatar_url AS author_avatar_url,
    (pr.author_id = v_current_user) AS is_mine
  FROM place_reviews pr
  JOIN profiles p ON p.id = pr.author_id
  WHERE pr.place_id = p_place_id
  ORDER BY
    -- 내 리뷰 우선
    (CASE WHEN pr.author_id = v_current_user THEN 0 ELSE 1 END),
    -- 그 다음 최신순
    pr.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- STEP 12: RPC - get_trip_review_stats (단일 조회)
-- =====================================================

CREATE OR REPLACE FUNCTION get_trip_review_stats(p_trip_id uuid)
RETURNS TABLE (
  review_count integer,
  avg_rating numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer AS review_count,
    ROUND(AVG(rating)::numeric, 2) AS avg_rating
  FROM trip_reviews
  WHERE trip_id = p_trip_id;
END;
$$;

-- =====================================================
-- STEP 13: RPC - get_place_review_stats (단일 조회)
-- =====================================================

CREATE OR REPLACE FUNCTION get_place_review_stats(p_place_id uuid)
RETURNS TABLE (
  review_count integer,
  avg_rating numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer AS review_count,
    ROUND(AVG(rating)::numeric, 2) AS avg_rating
  FROM place_reviews
  WHERE place_id = p_place_id;
END;
$$;

-- =====================================================
-- STEP 14: RPC - upsert_trip_review
-- 리뷰 생성 또는 수정 (덮어쓰기 UX)
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_trip_review(
  p_trip_id uuid,
  p_rating integer,
  p_content text DEFAULT NULL
)
RETURNS trip_reviews
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result trip_reviews;
BEGIN
  v_user_id := auth.uid();

  -- 로그인 확인
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 작성 권한 확인
  IF NOT can_write_trip_review(p_trip_id) THEN
    RAISE EXCEPTION 'Access denied: cannot write review for this trip';
  END IF;

  -- rating 범위 확인
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Upsert
  INSERT INTO trip_reviews (trip_id, author_id, rating, content)
  VALUES (p_trip_id, v_user_id, p_rating, p_content)
  ON CONFLICT (trip_id, author_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    content = EXCLUDED.content,
    updated_at = now()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================================================
-- STEP 15: RPC - upsert_place_review
-- 리뷰 생성 또는 수정 (덮어쓰기 UX)
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_place_review(
  p_place_id uuid,
  p_rating integer,
  p_content text DEFAULT NULL
)
RETURNS place_reviews
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result place_reviews;
BEGIN
  v_user_id := auth.uid();

  -- 로그인 확인
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- rating 범위 확인
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Place 존재 확인
  IF NOT EXISTS (SELECT 1 FROM places WHERE id = p_place_id) THEN
    RAISE EXCEPTION 'Place not found';
  END IF;

  -- Upsert
  INSERT INTO place_reviews (place_id, author_id, rating, content)
  VALUES (p_place_id, v_user_id, p_rating, p_content)
  ON CONFLICT (place_id, author_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    content = EXCLUDED.content,
    updated_at = now()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================================================
-- STEP 16: RPC - delete_trip_review
-- =====================================================

CREATE OR REPLACE FUNCTION delete_trip_review(p_trip_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_deleted_count integer;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  DELETE FROM trip_reviews
  WHERE trip_id = p_trip_id
    AND author_id = v_user_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count > 0;
END;
$$;

-- =====================================================
-- STEP 17: RPC - delete_place_review
-- =====================================================

CREATE OR REPLACE FUNCTION delete_place_review(p_place_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_deleted_count integer;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  DELETE FROM place_reviews
  WHERE place_id = p_place_id
    AND author_id = v_user_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count > 0;
END;
$$;

-- =====================================================
-- STEP 18: RPC - get_my_trip_review
-- 내 리뷰만 조회 (편집 폼용)
-- =====================================================

CREATE OR REPLACE FUNCTION get_my_trip_review(p_trip_id uuid)
RETURNS trip_reviews
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_result trip_reviews;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_result
  FROM trip_reviews
  WHERE trip_id = p_trip_id
    AND author_id = v_user_id;

  RETURN v_result;
END;
$$;

-- =====================================================
-- STEP 19: RPC - get_my_place_review
-- 내 리뷰만 조회 (편집 폼용)
-- =====================================================

CREATE OR REPLACE FUNCTION get_my_place_review(p_place_id uuid)
RETURNS place_reviews
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_result place_reviews;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_result
  FROM place_reviews
  WHERE place_id = p_place_id
    AND author_id = v_user_id;

  RETURN v_result;
END;
$$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE trip_reviews IS '여행 리뷰 - Trip에 대한 리뷰. 유저당 Trip별 1개.';
COMMENT ON TABLE place_reviews IS '장소 리뷰 - Place에 대한 리뷰. 유저당 Place별 1개.';
COMMENT ON FUNCTION can_write_trip_review IS 'Trip 리뷰 작성 권한 확인. public=누구나, unlisted/private=멤버만.';
COMMENT ON FUNCTION can_read_trip_review IS 'Trip 리뷰 읽기 권한 확인. public=누구나, unlisted/private=멤버만.';
COMMENT ON FUNCTION list_trip_reviews IS 'Trip 리뷰 목록 조회. 내 리뷰 우선, 최신순 정렬.';
COMMENT ON FUNCTION list_place_reviews IS 'Place 리뷰 목록 조회. 내 리뷰 우선, 최신순 정렬.';
COMMENT ON FUNCTION upsert_trip_review IS 'Trip 리뷰 생성/수정 (덮어쓰기).';
COMMENT ON FUNCTION upsert_place_review IS 'Place 리뷰 생성/수정 (덮어쓰기).';
COMMENT ON VIEW trip_review_stats IS 'Trip별 리뷰 통계 (개수, 평균 평점).';
COMMENT ON VIEW place_review_stats IS 'Place별 리뷰 통계 (개수, 평균 평점).';
