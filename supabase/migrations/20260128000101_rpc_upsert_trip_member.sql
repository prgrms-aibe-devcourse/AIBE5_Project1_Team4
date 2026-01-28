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

  if not (public.is_trip_owner_norls(p_trip_id) or p_user_id = v_uid) then
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

revoke all on function public.rpc_upsert_trip_member(uuid, uuid, text) from public;
grant execute on function public.rpc_upsert_trip_member(uuid, uuid, text) to authenticated;
