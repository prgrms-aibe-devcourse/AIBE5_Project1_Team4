create or replace function public.upsert_schedule_item(
  p_id uuid default null,
  p_trip_day_id uuid default null,
  p_place_id uuid default null,
  p_time time default null,
  p_duration_minutes integer default null,
  p_notes text default null
)
returns table (out_id uuid)
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
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;

  if p_id is not null then
    select td.trip_id, si.trip_day_id
      into v_trip_id, v_trip_day_id
    from public.schedule_items si
    join public.trip_days td on td.id = si.trip_day_id
    where si.id = p_id;

    if v_trip_id is null then raise exception 'NOT_FOUND'; end if;

    perform public.assert_trip_editor(v_trip_id);

    update public.schedule_items si
       set place_id = coalesce(p_place_id, si.place_id),
           time = p_time,
           duration_minutes = p_duration_minutes,
           notes = p_notes,
           updated_at = now(),
           updated_by = v_uid
     where si.id = p_id;

    out_id := p_id;
    return next;
  end if;

  if p_trip_day_id is null or p_place_id is null then
    raise exception 'BAD_REQUEST';
  end if;

  select td.trip_id into v_trip_id
  from public.trip_days td
  where td.id = p_trip_day_id
  for update;

  if v_trip_id is null then raise exception 'BAD_REQUEST'; end if;

  perform public.assert_trip_editor(v_trip_id);

  select coalesce(max(si.order_index), -1) + 1
    into v_next_order_index
  from public.schedule_items si
  where si.trip_day_id = p_trip_day_id;

  insert into public.schedule_items (
    trip_day_id, place_id, time, duration_minutes, notes, order_index, updated_by
  ) values (
    p_trip_day_id, p_place_id, p_time, p_duration_minutes, p_notes, v_next_order_index, v_uid
  )
  returning public.schedule_items.id into out_id;

  return next;
end;
$$;

create or replace function public.delete_schedule_item(p_id uuid)
returns table (out_id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_trip_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;

  select td.trip_id
    into v_trip_id
  from public.schedule_items si
  join public.trip_days td on td.id = si.trip_day_id
  where si.id = p_id;

  if v_trip_id is null then raise exception 'NOT_FOUND'; end if;

  perform public.assert_trip_editor(v_trip_id);

  delete from public.schedule_items si
  where si.id = p_id;

  out_id := p_id;
  return next;
end;
$$;

create or replace function public.rpc_upsert_trip_member(
  p_trip_id uuid,
  p_user_id uuid,
  p_role text default 'editor'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  if not (public.is_trip_owner(p_trip_id) or p_user_id = v_uid) then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (p_trip_id, p_user_id, p_role)
  on conflict (trip_id, user_id) do nothing;

  return jsonb_build_object(
    'tripId', p_trip_id,
    'userId', p_user_id
  );
end;
$$;