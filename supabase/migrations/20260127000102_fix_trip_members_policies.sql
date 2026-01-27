-- Use non-RLS helper functions inside trip_members policies to avoid recursion
create or replace function public.is_trip_member_norls(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
  );
$$;

alter function public.is_trip_member_norls(uuid) set row_security = off;

create or replace function public.is_trip_owner_norls(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

alter function public.is_trip_owner_norls(uuid) set row_security = off;

drop policy if exists trip_members_select_policy on public.trip_members;
create policy trip_members_select_policy on public.trip_members
  for select
  using (public.is_trip_member_norls(trip_id));

drop policy if exists trip_members_insert_policy on public.trip_members;
create policy trip_members_insert_policy on public.trip_members
  for insert
  with check (
    public.is_trip_owner_norls(trip_id) or
    user_id = auth.uid()
  );

drop policy if exists trip_members_update_policy on public.trip_members;
create policy trip_members_update_policy on public.trip_members
  for update
  using (public.is_trip_owner_norls(trip_id))
  with check (public.is_trip_owner_norls(trip_id));

drop policy if exists trip_members_delete_policy on public.trip_members;
create policy trip_members_delete_policy on public.trip_members
  for delete
  using (
    public.is_trip_owner_norls(trip_id) or
    user_id = auth.uid()
  );
