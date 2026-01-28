create or replace function public.adjust_trip_dates(
  p_trip_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (out_trip_id uuid)
language plpgsql
security definer
as $$
#variable_conflict use_column
declare
  v_uid uuid;
  d date;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  perform public.assert_trip_editor(p_trip_id);

  if p_start_date is null
     or p_end_date is null
     or p_start_date > p_end_date then
    raise exception 'INVALID_DATE_RANGE';
  end if;

  update public.trips t
     set start_date = p_start_date,
         end_date   = p_end_date,
         updated_by = v_uid
   where t.id = p_trip_id;

  delete from public.trip_days td
   where td.trip_id = p_trip_id
     and (td.date < p_start_date or td.date > p_end_date);

  d := p_start_date;
  while d <= p_end_date loop
    insert into public.trip_days (trip_id, date, updated_by)
    values (p_trip_id, d, v_uid)
    on conflict (trip_id, date) do nothing;

    d := d + 1;  -- date 증가
  end loop;

  out_trip_id := p_trip_id;
  return next;
end;
$$;

grant execute on function public.adjust_trip_dates(uuid, date, date) to authenticated;
