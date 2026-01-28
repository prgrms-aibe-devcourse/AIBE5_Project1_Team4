-- 북마크 페이지 RPC: get_user_bookmarked_trips
-- 목표: 초기 UI 동기화를 위해 is_liked / is_bookmarked 반환

create or replace function public.get_user_bookmarked_trips(
  p_user_id uuid,
  p_limit integer default 12,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_region text default '전체',
  p_theme text default '전체',
  p_days integer default null,
  p_sort text default 'latest'
)
returns table (
  id uuid,
  title text,
  summary text,
  cover_image_url text,
  start_date date,
  end_date date,
  created_at timestamptz,
  is_public boolean,
  author_id uuid,
  author_name text,
  author_avatar_url text,
  like_count bigint,
  bookmark_count bigint,
  member_count bigint,
  regions text[],
  themes text[],
  is_liked boolean,
  is_bookmarked boolean
)
language plpgsql
security definer
as $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.summary,
    t.cover_image_url,
    t.start_date,
    t.end_date,
    t.created_at,
    (t.visibility = 'public') as is_public,

    -- JS 매핑 호환 (author_name 등)
    p.id AS author_id,
    p.full_name AS author_name,
    p.avatar_url AS author_avatar_url,

    -- 카운트 (SECURITY DEFINER 덕분에 에러 없이 작동)
    (SELECT count(*) FROM trip_likes WHERE trip_likes.trip_id = t.id)::bigint AS like_count,
    (SELECT count(*) FROM trip_bookmarks WHERE trip_bookmarks.trip_id = t.id)::bigint AS bookmark_count,
    (SELECT count(*) FROM trip_members WHERE trip_members.trip_id = t.id)::bigint AS member_count,

    -- (현재 구현 유지)
    ARRAY[]::text[] AS regions,
    ARRAY[]::text[] AS themes,

    -- 추가: 초기 UI 동기화용 상태값
    EXISTS (
      SELECT 1
      FROM trip_likes tl
      WHERE tl.trip_id = t.id
        AND tl.user_id = p_user_id
    ) AS is_liked,
    TRUE AS is_bookmarked

  FROM trip_bookmarks tb
  JOIN trips t ON tb.trip_id = t.id
  JOIN profiles p ON t.created_by = p.id
  WHERE tb.user_id = p_user_id

    -- 1. 지역 필터 구현
    AND (p_region = '전체' OR EXISTS (
      SELECT 1 FROM trip_regions tr
      JOIN regions r ON tr.region_id = r.id
      WHERE tr.trip_id = t.id AND r.name = p_region
    ))

    -- 2. 테마 필터 구현
    AND (p_theme = '전체' OR EXISTS (
      SELECT 1 FROM trip_themes tt
      JOIN themes th ON tt.theme_id = th.id
      WHERE tt.trip_id = t.id AND th.name = p_theme
    ))

    -- 3. 기간 필터 구현 (최근 n일)
    AND (p_days IS NULL OR t.created_at >= (now() - (p_days || ' days')::interval))

    -- 4. 커서 기반 페이지네이션 (북마크 생성 최신순)
    AND (
      p_cursor_created_at IS NULL
      OR (tb.created_at < p_cursor_created_at)
      OR (tb.created_at = p_cursor_created_at AND t.id < p_cursor_id)
    )

  ORDER BY tb.created_at DESC, t.id DESC
  LIMIT p_limit;
END;
$$;
