create or replace function public.assert_trip_editor(p_trip_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_uid uuid;
  v_ok boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = p_trip_id
      and tm.user_id = v_uid
      and tm.role in ('owner','editor')
  ) into v_ok;

  if not v_ok then
    raise exception 'FORBIDDEN';
  end if;
end;
$$;

grant execute on function public.assert_trip_editor(uuid) to authenticated;
