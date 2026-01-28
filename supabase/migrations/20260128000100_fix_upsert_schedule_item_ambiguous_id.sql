create or replace function public.upsert_schedule_item(
  p_id uuid default null,
  p_trip_day_id uuid default null,
  p_place_id uuid default null,
  p_time time default null,
  p_duration_minutes integer default null,
  p_notes text default null
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
    -- item의 day를 찾고, 그 day가 속한 trip의 편집 권한 체크
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
           time = p_time,
           duration_minutes = p_duration_minutes,
           notes = p_notes,
           updated_at = now(),
           updated_by = v_uid
     where schedule_items.id = p_id;

    id := p_id;
    return next;
  end if;

  -- =========================
  -- INSERT (p_id == null)
  -- =========================
  if p_trip_day_id is null or p_place_id is null then
    raise exception 'BAD_REQUEST';
  end if;

  -- day row를 잠그면 order_index 레이스 줄어듦 (MVP에서만 이정도면 충분)
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

create or replace function public.delete_schedule_item(
  p_id uuid
)
returns table (id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_trip_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  -- item이 속한 trip 찾기
  select td.trip_id
    into v_trip_id
  from public.schedule_items si
  join public.trip_days td on td.id = si.trip_day_id
  where si.id = p_id;

  if v_trip_id is null then
    raise exception 'NOT_FOUND';
  end if;

  -- owner/editor 권한 체크
  perform public.assert_trip_editor(v_trip_id);

  delete from public.schedule_items
  where schedule_items.id = p_id;

  id := p_id;
  return next;
end;
$$;

grant execute on function public.delete_schedule_item(uuid) to authenticated;
