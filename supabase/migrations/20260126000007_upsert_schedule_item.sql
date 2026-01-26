create or replace function public.upsert_schedule_item(
  p_id uuid default null,                 -- null이면 insert, 값 있으면 update
  p_trip_day_id uuid default null,         -- insert일 때 필수
  p_place_id uuid default null,            -- insert일 때 필수 (update 때도 교체 가능하게 허용)
  p_time time default null,                -- null 허용
  p_duration_minutes integer default null, -- null 허용, >0은 테이블 constraint가 검증
  p_notes text default null                -- null 허용
)
returns table (id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_trip_id uuid;
  v_trip_day_id uuid;
  v_next_order_index integer;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  -- =========================
  -- UPDATE (p_id != null)
  -- =========================
  if p_id is not null then
    -- item의 day를 알아내고, 그 day가 속한 trip에 대해 권한 체크
    select td.trip_id, si.trip_day_id
      into v_trip_id, v_trip_day_id
    from public.schedule_items si
    join public.trip_days td on td.id = si.trip_day_id
    where si.id = p_id;

    if v_trip_id is null then
      raise exception 'NOT_FOUND';
    end if;

    perform public.assert_trip_editor(v_trip_id);

    update public.schedule_items
       set place_id = coalesce(p_place_id, place_id),
           time = p_time, -- null도 “설정”으로 허용(시간 제거)
           duration_minutes = p_duration_minutes,
           notes = p_notes,
           updated_at = now(),
           updated_by = v_uid
     where id = p_id;

    id := p_id;
    return next;
  end if;

  -- =========================
  -- INSERT (p_id == null)
  -- =========================
  if p_trip_day_id is null or p_place_id is null then
    raise exception 'BAD_REQUEST';
  end if;

  -- day row를 잠그면 order_index 레이스가 줄어듦 (MVP에서 이 정도면 충분)
  select trip_id into v_trip_id
  from public.trip_days
  where id = p_trip_day_id
  for update;

  if v_trip_id is null then
    raise exception 'BAD_REQUEST';
  end if;

  perform public.assert_trip_editor(v_trip_id);

  select coalesce(max(order_index), -1) + 1
    into v_next_order_index
  from public.schedule_items
  where trip_day_id = p_trip_day_id;

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
    p_place_id,
    p_time,
    p_duration_minutes,
    p_notes,
    v_next_order_index,
    v_uid
  )
  returning schedule_items.id into id;

  return next;
end;
$$;

grant execute on function public.upsert_schedule_item(
  uuid, uuid, uuid, time, integer, text
) to authenticated;
