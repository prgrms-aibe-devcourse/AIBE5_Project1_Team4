create or replace function public.delete_trip(
  p_trip_id uuid
)
returns table (trip_id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_created_by uuid;
  v_has_owner boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select created_by into v_created_by
  from public.trips
  where id = p_trip_id;

  if v_created_by is null then
    raise exception 'NOT_FOUND';
  end if;

  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = p_trip_id
      and tm.role = 'owner'
  ) into v_has_owner;

  if not v_has_owner and v_created_by = v_uid then
    insert into public.trip_members (trip_id, user_id, role)
    values (p_trip_id, v_uid, 'owner')
    on conflict do nothing;
  end if;

  if not public.is_trip_owner(p_trip_id) then
    raise exception 'FORBIDDEN';
  end if;

  delete from public.trips
   where id = p_trip_id;

  if not found then
    raise exception 'NOT_FOUND';
  end if;

  trip_id := p_trip_id;
  return next;
end;
$$;

grant execute on function public.delete_trip(uuid) to authenticated;
