-- Create RPC function to get user's liked trips
-- Similar to list_public_trips but filters by trip_likes for current user

DROP FUNCTION IF EXISTS public.list_liked_trips(int, timestamptz, uuid);

CREATE OR REPLACE FUNCTION list_liked_trips(
  p_limit int DEFAULT 20,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL
)
RETURNS TABLE (
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
  themes text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  cursor_condition text;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Set cursor condition for pagination
  IF p_cursor_created_at IS NOT NULL AND p_cursor_id IS NOT NULL THEN
    cursor_condition := format('(tl.created_at, tl.trip_id) < (%L, %L)', p_cursor_created_at, p_cursor_id);
  ELSE
    cursor_condition := 'TRUE';
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT
      t.id,
      t.title,
      t.summary,
      t.cover_image_url,
      t.start_date,
      t.end_date,
      t.created_at,
      p.id as author_id,
      COALESCE(p.full_name, p.username) as author_name,
      p.avatar_url as author_avatar_url,
      COALESCE(lc.cnt, 0) as like_count,
      COALESCE(bc.cnt, 0) as bookmark_count,
      COALESCE(mc.cnt, 0) as member_count,
      COALESCE(ra.regions, ARRAY[]::text[]) as regions,
      COALESCE(ta.themes, ARRAY[]::text[]) as themes
    FROM trip_likes tl
    JOIN trips t ON t.id = tl.trip_id
    JOIN profiles p ON p.id = t.created_by
    LEFT JOIN (
      SELECT trip_id, COUNT(*) as cnt FROM trip_likes GROUP BY trip_id
    ) lc ON lc.trip_id = t.id
    LEFT JOIN (
      SELECT trip_id, COUNT(*) as cnt FROM trip_bookmarks GROUP BY trip_id
    ) bc ON bc.trip_id = t.id
    LEFT JOIN (
      SELECT trip_id, COUNT(*) as cnt FROM trip_members GROUP BY trip_id
    ) mc ON mc.trip_id = t.id
    LEFT JOIN (
      SELECT tr.trip_id, array_agg(reg.name ORDER BY tr.created_at) as regions
      FROM trip_regions tr
      JOIN regions reg ON reg.id = tr.region_id
      GROUP BY tr.trip_id
    ) ra ON ra.trip_id = t.id
    LEFT JOIN (
      SELECT tt.trip_id, array_agg(thm.name ORDER BY tt.created_at) as themes
      FROM trip_themes tt
      JOIN themes thm ON thm.id = tt.theme_id
      GROUP BY tt.trip_id
    ) ta ON ta.trip_id = t.id
    WHERE tl.user_id = $1
      AND %s
    ORDER BY tl.created_at DESC, tl.trip_id DESC
    LIMIT $2
  ', cursor_condition)
  USING v_user_id, p_limit;
END;
$$;

-- Create index for better pagination performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_trip_likes_user_created_at 
  ON public.trip_likes(user_id, created_at DESC, trip_id DESC);
