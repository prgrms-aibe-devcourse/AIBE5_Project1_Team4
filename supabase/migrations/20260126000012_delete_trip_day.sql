create or replace function public.rpc_delete_trip_day(
  p_trip_id uuid,
  p_date date
)
returns table (trip_id uuid, deleted_date date)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_trip public.trips%rowtype;
  v_deleted_count int;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;

  perform public.assert_trip_editor(p_trip_id);

  select * into v_trip
  from public.trips
  where id = p_trip_id;

  if v_trip.id is null then raise exception 'NOT_FOUND'; end if;

  if p_date < v_trip.start_date or p_date > v_trip.end_date then
    raise exception 'BAD_REQUEST';
  end if;

  -- 최소 1일 유지
  if v_trip.start_date = v_trip.end_date then
    raise exception 'CONFLICT';
  end if;

  delete from public.trip_days
   where trip_id = p_trip_id
     and date = p_date;

  get diagnostics v_deleted_count = row_count;
  if v_deleted_count = 0 then
    raise exception 'NOT_FOUND';
  end if;

  -- 뒤쪽 날짜 당김 (-1은 유니크 충돌 없음)
  update public.trip_days
     set date = date - 1,
         updated_by = v_uid
   where trip_id = p_trip_id
     and date > p_date;

  -- trips 기간도 -1
  update public.trips
     set end_date = end_date - 1,
         updated_by = v_uid
   where id = p_trip_id;

  trip_id := p_trip_id;
  deleted_date := p_date;
  return next;
end;
$$;

grant execute on function public.rpc_delete_trip_day(uuid, date) to authenticated;
