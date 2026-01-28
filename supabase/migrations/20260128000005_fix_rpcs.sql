DROP FUNCTION list_bookmarked_trips(integer,timestamp with time zone,uuid);
create or replace function public.list_bookmarked_trips(
  p_limit integer default 10,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null
)
returns table(
  id uuid,
  title text,
  summary text,
  cover_image_url text,
  start_date date,
  end_date date,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  author_avatar_url text,
  like_count bigint,
  bookmark_count bigint,
  member_count bigint,
  regions text[],
  themes text[],
  is_bookmarked boolean,
  is_liked boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_limit int := greatest(1, least(coalesce(p_limit, 10), 50));
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  return query
  with ra as (
    select tr.trip_id, array_agg(reg.name order by tr.created_at) as regions
    from public.trip_regions tr
    join public.regions reg on reg.id = tr.region_id
    group by tr.trip_id
  ),
  ta as (
    select tt.trip_id, array_agg(thm.name order by tt.created_at) as themes
    from public.trip_themes tt
    join public.themes thm on thm.id = tt.theme_id
    group by tt.trip_id
  ),
  lc as (
    select trip_id, count(*)::bigint as cnt
    from public.trip_likes
    group by trip_id
  ),
  bc as (
    select trip_id, count(*)::bigint as cnt
    from public.trip_bookmarks
    group by trip_id
  ),
  mc as (
    select trip_id, count(*)::bigint as cnt
    from public.trip_members
    group by trip_id
  )
  select
    t.id,
    t.title,
    t.summary,
    t.cover_image_url,
    t.start_date,
    t.end_date,
    tb.created_at as created_at, -- ✅ 커서/정렬 기준 (북마크한 시각)
    p.id as author_id,
    coalesce(p.full_name, p.username) as author_name,
    p.avatar_url as author_avatar_url,
    coalesce(lc.cnt, 0)::bigint as like_count,
    coalesce(bc.cnt, 0)::bigint as bookmark_count,
    coalesce(mc.cnt, 0)::bigint as member_count,
    coalesce(ra.regions, array[]::text[]) as regions,
    coalesce(ta.themes, array[]::text[]) as themes,
    true as is_bookmarked,
    exists (
      select 1 from public.trip_likes tl
      where tl.trip_id = t.id and tl.user_id = v_uid
    ) as is_liked
  from public.trip_bookmarks tb
  join public.trips t on t.id = tb.trip_id
  join public.profiles p on p.id = t.created_by
  left join ra on ra.trip_id = t.id
  left join ta on ta.trip_id = t.id
  left join lc on lc.trip_id = t.id
  left join bc on bc.trip_id = t.id
  left join mc on mc.trip_id = t.id
  where tb.user_id = v_uid
    and (
      p_cursor_created_at is null
      or p_cursor_id is null
      or (tb.created_at, t.id) < (p_cursor_created_at, p_cursor_id)
    )
  order by tb.created_at desc, t.id desc
  limit v_limit;
end;
$$;

grant execute on function public.list_bookmarked_trips(integer,timestamptz,uuid) to authenticated;

DROP FUNCTION list_my_trips(integer,timestamp with time zone,uuid);
create or replace function public.list_my_trips(
  p_limit integer default 10,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null
)
returns table(
  id uuid,
  title text,
  summary text,
  cover_image_url text,
  start_date date,
  end_date date,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  author_avatar_url text,
  like_count bigint,
  bookmark_count bigint,
  member_count bigint,
  regions text[],
  themes text[],
  is_bookmarked boolean,
  is_liked boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_limit int := greatest(1, least(coalesce(p_limit, 10), 50));
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED';
  end if;

  return query
  with ra as (
    select tr.trip_id, array_agg(reg.name order by tr.created_at) as regions
    from public.trip_regions tr
    join public.regions reg on reg.id = tr.region_id
    group by tr.trip_id
  ),
  ta as (
    select tt.trip_id, array_agg(thm.name order by tt.created_at) as themes
    from public.trip_themes tt
    join public.themes thm on thm.id = tt.theme_id
    group by tt.trip_id
  ),
  lc as (
    select trip_id, count(*)::bigint as cnt
    from public.trip_likes
    group by trip_id
  ),
  bc as (
    select trip_id, count(*)::bigint as cnt
    from public.trip_bookmarks
    group by trip_id
  ),
  mc as (
    select trip_id, count(*)::bigint as cnt
    from public.trip_members
    group by trip_id
  )
  select
    t.id,
    t.title,
    t.summary,
    t.cover_image_url,
    t.start_date,
    t.end_date,
    t.created_at,
    p.id as author_id,
    coalesce(p.full_name, p.username) as author_name,
    p.avatar_url as author_avatar_url,
    coalesce(lc.cnt, 0)::bigint as like_count,
    coalesce(bc.cnt, 0)::bigint as bookmark_count,
    coalesce(mc.cnt, 0)::bigint as member_count,
    coalesce(ra.regions, array[]::text[]) as regions,
    coalesce(ta.themes, array[]::text[]) as themes,
    exists (
      select 1 from public.trip_bookmarks tb
      where tb.trip_id = t.id and tb.user_id = v_uid
    ) as is_bookmarked,
    exists (
      select 1 from public.trip_likes tl
      where tl.trip_id = t.id and tl.user_id = v_uid
    ) as is_liked
  from public.trips t
  join public.profiles p on p.id = t.created_by
  left join ra on ra.trip_id = t.id
  left join ta on ta.trip_id = t.id
  left join lc on lc.trip_id = t.id
  left join bc on bc.trip_id = t.id
  left join mc on mc.trip_id = t.id
  where t.created_by = v_uid
    and (
      p_cursor_created_at is null
      or p_cursor_id is null
      or (t.created_at, t.id) < (p_cursor_created_at, p_cursor_id)
    )
  order by t.created_at desc, t.id desc
  limit v_limit;
end;
$$;

grant execute on function public.list_my_trips(integer,timestamptz,uuid) to authenticated;
