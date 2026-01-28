-- Fix RPC function get_user_created_trips
-- Previous version had syntax error with format() function and NULL handling
-- This version uses parameterized queries instead of format() with %s

DROP FUNCTION IF EXISTS public.get_user_created_trips(uuid, int, timestamptz, uuid, text, text, text, int);

CREATE OR REPLACE FUNCTION get_user_created_trips(
  p_user_id uuid,
  p_limit int DEFAULT 12,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL,
  p_sort text DEFAULT 'latest',
  p_region text DEFAULT '전체',
  p_theme text DEFAULT '전체',
  p_days int DEFAULT NULL
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
  cursor_condition text;
  sort_clause text;
BEGIN
  -- Set cursor condition for pagination
  IF p_cursor_created_at IS NOT NULL AND p_cursor_id IS NOT NULL THEN
    cursor_condition := format('(t.created_at, t.id) < (%L, %L)', p_cursor_created_at, p_cursor_id);
  ELSE
    cursor_condition := 'TRUE';
  END IF;

  -- Set sort clause based on p_sort parameter
  sort_clause := CASE
    WHEN p_sort = 'popular' THEN 'COALESCE(lc.cnt, 0) DESC, t.created_at DESC, t.id DESC'
    ELSE 't.created_at DESC, t.id DESC'  -- default to 'latest'
  END;

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
    FROM trips t
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
    WHERE t.created_by = $1
      AND %s
      AND ($2 = ''전체'' OR EXISTS (
        SELECT 1 FROM trip_regions tr
        JOIN regions reg ON reg.id = tr.region_id
        WHERE tr.trip_id = t.id AND reg.name = $2
      ))
      AND ($3 = ''전체'' OR EXISTS (
        SELECT 1 FROM trip_themes tt
        JOIN themes thm ON thm.id = tt.theme_id
        WHERE tt.trip_id = t.id AND thm.name = $3
      ))
      AND ($4::int IS NULL OR t.created_at >= NOW() - make_interval(days => $4::int))
    ORDER BY %s
    LIMIT $5
  ', cursor_condition, sort_clause)
  USING p_user_id, p_region, p_theme, p_days, p_limit;
END;
$$;

-- Create index for better pagination performance
CREATE INDEX IF NOT EXISTS idx_trips_created_by_created_at 
  ON public.trips(created_by, created_at DESC, id DESC);
