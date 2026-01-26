create or replace function public.rpc_insert_trip_day_after(
  p_trip_id uuid,
  p_after_date date
)
returns table (trip_id uuid, inserted_date date)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_trip public.trips%rowtype;
  v_target date;
  v_shift int := 10000; -- 임시 이동용(충분히 큰 값)
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;

  perform public.assert_trip_editor(p_trip_id);

  select * into v_trip
  from public.trips
  where id = p_trip_id;

  if v_trip.id is null then raise exception 'NOT_FOUND'; end if;

  if p_after_date < v_trip.start_date or p_after_date > v_trip.end_date then
    raise exception 'BAD_REQUEST';
  end if;

  v_target := p_after_date + 1;

  -- 1) 영향을 받는 rows를 임시로 멀리 이동 (유니크 충돌 회피)
  update public.trip_days
     set date = date + v_shift,
         updated_by = v_uid
   where trip_id = p_trip_id
     and date >= v_target;

  -- 2) 다시 +1일 이동 (최종 값으로)
  update public.trip_days
     set date = (date - v_shift) + 1,
         updated_by = v_uid
   where trip_id = p_trip_id
     and date >= v_target + v_shift;

  -- 새 day 삽입
  insert into public.trip_days (trip_id, date, updated_by)
  values (p_trip_id, v_target, v_uid);

  -- trips 기간도 +1
  update public.trips
     set end_date = end_date + 1,
         updated_by = v_uid
   where id = p_trip_id;

  trip_id := p_trip_id;
  inserted_date := v_target;
  return next;
end;
$$;

grant execute on function public.rpc_insert_trip_day_after(uuid, date) to authenticated;
