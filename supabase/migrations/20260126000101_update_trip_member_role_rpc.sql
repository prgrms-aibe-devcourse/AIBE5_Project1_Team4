-- 20260126000101_update_trip_member_role_rpc.sql
-- Update trip member role (owner/editor) with ownership transfer handling.

create or replace function public.rpc_update_trip_member_role(
  p_trip_id uuid,
  p_member_id uuid,
  p_role text
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_role text := lower(trim(p_role));
  v_member_role text;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  if v_role not in ('owner', 'editor') then
    raise exception 'invalid_role' using errcode = 'P0001';
  end if;

  if not is_trip_owner(p_trip_id) then
    raise exception 'not_trip_owner' using errcode = 'P0001';
  end if;

  select role
    into v_member_role
  from public.trip_members
  where trip_id = p_trip_id
    and user_id = p_member_id;

  if v_member_role is null then
    raise exception 'member_not_found' using errcode = 'P0001';
  end if;

  if v_role = 'editor' and v_member_role = 'owner' then
    raise exception 'cannot_demote_owner' using errcode = 'P0001';
  end if;

  if v_role = 'owner' then
    update public.trip_members
    set role = 'editor'
    where trip_id = p_trip_id
      and role = 'owner'
      and user_id <> p_member_id;

    update public.trip_members
    set role = 'owner'
    where trip_id = p_trip_id
      and user_id = p_member_id;
  else
    update public.trip_members
    set role = 'editor'
    where trip_id = p_trip_id
      and user_id = p_member_id;
  end if;

  return jsonb_build_object(
    'tripId', p_trip_id,
    'memberId', p_member_id,
    'role', v_role,
    'members', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'userId', tm.user_id,
            'role', tm.role
          )
          order by case when tm.role = 'owner' then 0 else 1 end, tm.user_id
        ),
        '[]'::jsonb
      )
      from public.trip_members tm
      where tm.trip_id = p_trip_id
    )
  );
end;
$$;
