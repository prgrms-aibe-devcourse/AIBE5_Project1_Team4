create or replace function public.rpc_trip_detail_summary(p_trip_id uuid)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  select jsonb_build_object(
    'trip', jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'summary', t.summary,
      'coverUrl', t.cover_image_url,
      'startDate', t.start_date,
      'endDate', t.end_date,
      'visibility', t.visibility,
      'createdAt', t.created_at
    ),
    'author', jsonb_build_object(
      'id', a.id,
      'displayName', coalesce(a.full_name, a.username),
      'avatarUrl', a.avatar_url
    ),
    'counts', jsonb_build_object(
      'likeCount', (select count(*) from public.trip_likes tl where tl.trip_id = t.id),
      'bookmarkCount', (select count(*) from public.trip_bookmarks tb where tb.trip_id = t.id)
    ),
    'viewer', jsonb_build_object(
      'role', (select tm.role from public.trip_members tm where tm.trip_id = t.id and tm.user_id = v_uid),
      'isLiked', (v_uid is not null) and exists (
        select 1 from public.trip_likes tl where tl.trip_id = t.id and tl.user_id = v_uid
      ),
      'isBookmarked', (v_uid is not null) and exists (
        select 1 from public.trip_bookmarks tb where tb.trip_id = t.id and tb.user_id = v_uid
      )
    )
  )
  into v_result
  from public.trips t
  join public.profiles a on a.id = t.created_by
  where t.id = p_trip_id;

  if v_result is null then
    raise exception 'trip_not_found' using errcode = 'P0001';
  end if;

  return v_result;
end;
$$;
