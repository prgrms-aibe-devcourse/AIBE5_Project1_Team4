-- 좋아요 토글 RPC: 있으면 삭제 / 없으면 삽입 + 최신 카운트 반환
create or replace function public.toggle_trip_like(p_trip_id uuid)
returns table(is_liked boolean, like_count bigint)
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1
    from public.trip_likes
    where trip_id = p_trip_id and user_id = v_uid
  ) then
    delete from public.trip_likes
    where trip_id = p_trip_id and user_id = v_uid;
    is_liked := false;
  else
    insert into public.trip_likes(trip_id, user_id, created_at)
    values (p_trip_id, v_uid, now());
    is_liked := true;
  end if;

  select count(*) into like_count
  from public.trip_likes
  where trip_id = p_trip_id;

  return next;
end;
$$;

grant execute on function public.toggle_trip_like(uuid) to authenticated;
