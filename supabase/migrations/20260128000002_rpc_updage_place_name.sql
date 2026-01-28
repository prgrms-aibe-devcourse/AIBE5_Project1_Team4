create or replace function public.rpc_update_place_name(
  p_place_id uuid,
  p_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'unauthorized'; end if;

  -- 여기서 권한 체크를 어떻게 할지 결정해야 함:
  -- 1) 아무 trip에서든 place를 업데이트하면 전역 영향이라 위험
  -- 2) "내가 속한 trip의 schedule_items에서 쓰는 place만" 허용 같은 룰 필요

  update public.places p
     set name = p_name,
         updated_at = now()
   where p.id = p_place_id;

  if not found then raise exception 'not_found'; end if;
  return p_place_id;
end;
$$;

revoke all on function public.rpc_update_place_name(uuid, text) from public;
grant execute on function public.rpc_update_place_name(uuid, text) to authenticated;
