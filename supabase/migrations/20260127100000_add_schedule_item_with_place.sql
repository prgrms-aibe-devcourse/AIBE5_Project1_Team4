-- =====================================================
-- add_schedule_item_with_place
-- =====================================================
-- "장소 검색 → 일정에 추가" 트랜잭션 함수
--
-- 동작:
--   1. p_user_id가 해당 trip_day의 trip에 대해 editor/owner인지 확인
--   2. places에 upsert (UNIQUE(provider, provider_place_id) 기준)
--   3. schedule_items에 insert (order_index 자동 계산)
--   4. 생성된 schedule_item을 반환
--
-- 호출자:
--   - Edge Function (add-schedule-item)에서 service-role client로 호출
--   - 따라서 auth.uid()가 없으므로 p_user_id를 명시적으로 받음
--
-- 동시성 안전:
--   - trip_days row를 FOR UPDATE로 잠금 → order_index 레이스 방지
--   - places upsert는 ON CONFLICT으로 동시 삽입 안전
-- =====================================================

create or replace function public.add_schedule_item_with_place(
  p_user_id uuid,
  p_trip_day_id uuid,
  -- place 정보 (jsonb 대신 명시적 파라미터로 타입 안전성 확보)
  p_provider text,
  p_provider_place_id text,
  p_place_name text,
  p_place_category text default null,
  p_place_address text default null,
  p_place_road_address text default null,
  p_place_phone text default null,
  p_place_latitude numeric default null,
  p_place_longitude numeric default null,
  p_place_raw_data jsonb default null,
  -- schedule_item 정보
  p_time time default null,
  p_duration_minutes integer default null,
  p_notes text default null
)
returns table (
  schedule_item_id uuid,
  place_id uuid,
  order_index integer
)
language plpgsql
security definer
as $$
declare
  v_trip_id uuid;
  v_place_id uuid;
  v_is_editor boolean;
  v_next_order integer;
  v_item_id uuid;
begin
  -- =====================================================
  -- STEP 1: 입력 검증
  -- =====================================================
  if p_user_id is null then
    raise exception 'UNAUTHORIZED: user_id is required';
  end if;

  if p_trip_day_id is null then
    raise exception 'BAD_REQUEST: trip_day_id is required';
  end if;

  if p_provider is null or p_provider_place_id is null or p_place_name is null then
    raise exception 'BAD_REQUEST: provider, provider_place_id, name are required';
  end if;

  -- =====================================================
  -- STEP 2: trip_day 존재 확인 + row lock (동시성 안전)
  -- =====================================================
  select td.trip_id
    into v_trip_id
  from public.trip_days td
  where td.id = p_trip_day_id
  for update;

  if v_trip_id is null then
    raise exception 'NOT_FOUND: trip_day not found';
  end if;

  -- =====================================================
  -- STEP 3: 권한 확인 (editor/owner만 가능)
  -- =====================================================
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = v_trip_id
      and tm.user_id = p_user_id
      and tm.role in ('owner', 'editor')
  ) into v_is_editor;

  if not v_is_editor then
    raise exception 'FORBIDDEN: user is not an editor of this trip';
  end if;

  -- =====================================================
  -- STEP 4: places upsert
  -- ON CONFLICT → 기존 row의 id를 가져옴
  -- 동시 삽입 시에도 안전 (UNIQUE 제약 + ON CONFLICT)
  -- =====================================================
  insert into public.places (
    provider,
    provider_place_id,
    name,
    category,
    address,
    road_address,
    phone,
    latitude,
    longitude,
    raw_data
  ) values (
    p_provider,
    p_provider_place_id,
    p_place_name,
    p_place_category,
    p_place_address,
    p_place_road_address,
    p_place_phone,
    p_place_latitude,
    p_place_longitude,
    p_place_raw_data
  )
  on conflict (provider, provider_place_id)
  do update set
    name = excluded.name,
    category = excluded.category,
    address = excluded.address,
    road_address = excluded.road_address,
    phone = excluded.phone,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    raw_data = excluded.raw_data,
    updated_at = now()
  returning id into v_place_id;

  -- =====================================================
  -- STEP 5: order_index 계산 (row lock으로 레이스 방지됨)
  -- =====================================================
  select coalesce(max(si.order_index), -1) + 1
    into v_next_order
  from public.schedule_items si
  where si.trip_day_id = p_trip_day_id;

  -- =====================================================
  -- STEP 6: schedule_items insert
  -- =====================================================
  insert into public.schedule_items (
    trip_day_id,
    place_id,
    time,
    duration_minutes,
    notes,
    order_index,
    updated_by
  ) values (
    p_trip_day_id,
    v_place_id,
    p_time,
    p_duration_minutes,
    p_notes,
    v_next_order,
    p_user_id
  )
  returning id into v_item_id;

  -- =====================================================
  -- STEP 7: 결과 반환
  -- =====================================================
  schedule_item_id := v_item_id;
  place_id := v_place_id;
  order_index := v_next_order;
  return next;
end;
$$;

-- service-role에서만 호출하므로 일반 유저에게는 권한 불필요
-- 하지만 안전을 위해 authenticated에게도 grant (RPC 내부에서 권한 검증함)
revoke execute on function public.add_schedule_item_with_place(
  uuid, uuid,
  text, text, text, text, text, text, text,
  numeric, numeric, jsonb,
  time, integer, text
) from public, anon;

grant execute on function public.add_schedule_item_with_place(
  uuid, uuid,
  text, text, text, text, text, text, text,
  numeric, numeric, jsonb,
  time, integer, text
) to service_role;

-- =====================================================
-- COMMENT
-- =====================================================
comment on function public.add_schedule_item_with_place is
  '장소 검색 결과를 places에 upsert하고 schedule_items에 추가하는 트랜잭션 함수. '
  'service-role 전용. Edge Function(add-schedule-item)에서 호출.';
