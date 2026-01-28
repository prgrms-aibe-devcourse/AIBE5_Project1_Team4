-- =====================================================
-- places / schedule_items RLS 강화
-- =====================================================
-- 기존 정책: authenticated 유저가 직접 insert/update 가능
-- 변경 후:  모든 쓰기는 service-role (Edge Function → RPC) 경유만 허용
--
-- 이유:
--   - places 쓰기: add_schedule_item_with_place RPC가 SECURITY DEFINER로 처리
--   - schedule_items 쓰기: upsert_schedule_item / add_schedule_item_with_place가 처리
--   - 클라이언트(anon key)에서 직접 insert/update/delete 불필요
--   - SELECT는 기존 정책 유지 (trip member만 볼 수 있음)
-- =====================================================

-- =========================
-- places: insert/update 정책 제거
-- =========================
-- 기존: authenticated 유저가 직접 insert/update 가능
-- 변경: service-role만 가능 (RLS는 service-role을 bypass하므로 정책 제거만 하면 됨)

DROP POLICY IF EXISTS places_insert_policy ON places;
DROP POLICY IF EXISTS places_update_policy ON places;

-- places SELECT는 유지 (누구나 조회 가능)
-- places_select_policy: USING (true) → 변경 없음

-- =========================
-- schedule_items: insert/update/delete 정책을 제거하고 SELECT만 유지
-- =========================
-- 기존: can_edit_trip()으로 직접 insert/update/delete 허용
-- 변경: 모든 쓰기는 RPC(SECURITY DEFINER) 경유
--       → 클라이언트 직접 쓰기 차단

DROP POLICY IF EXISTS schedule_items_insert_policy ON schedule_items;
DROP POLICY IF EXISTS schedule_items_update_policy ON schedule_items;
DROP POLICY IF EXISTS schedule_items_delete_policy ON schedule_items;

-- schedule_items SELECT는 유지
-- schedule_items_select_policy: trip member만 조회 가능 → 변경 없음

-- =====================================================
-- COMMENT
-- =====================================================
COMMENT ON TABLE places IS
  'places 테이블은 SELECT만 RLS 허용. '
  'INSERT/UPDATE는 service-role 전용 (add_schedule_item_with_place RPC 경유). '
  'service-role은 RLS를 bypass하므로 별도 정책 불필요.';

COMMENT ON TABLE schedule_items IS
  'schedule_items 테이블은 SELECT만 RLS 허용 (trip member 기준). '
  'INSERT/UPDATE/DELETE는 RPC(SECURITY DEFINER) 경유만 허용. '
  'upsert_schedule_item, add_schedule_item_with_place, delete_schedule_item 등.';
