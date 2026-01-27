create or replace function public.create_trip_draft()
returns table (trip_id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_trip_id uuid;
  v_today date;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  v_today := (now() at time zone 'Asia/Seoul')::date;

  insert into public.trips (title, start_date, end_date, visibility, created_by, updated_by)
  values ('새 여행 1', v_today, v_today, 'private', v_uid, v_uid)
  returning id into v_trip_id;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, v_uid, 'owner')
  on conflict do nothing;

  insert into public.trip_days (trip_id, date, updated_by)
  values (v_trip_id, v_today, v_uid);

  trip_id := v_trip_id;
  return next;
end;
$$;

grant execute on function public.create_trip_draft() to authenticated;
