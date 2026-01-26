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
  where id = p_id;

  id := p_id;
  return next;
end;
$$;

grant execute on function public.delete_schedule_item(uuid) to authenticated;
