-- Return ALL regions and themes as arrays instead of just the first one
-- This fixes filter count mismatch issue

-- Drop existing function
DROP FUNCTION IF EXISTS list_public_trips(int, text, timestamptz, uuid);

-- Create function returning arrays for regions and themes
CREATE OR REPLACE FUNCTION list_public_trips(
  p_limit int DEFAULT 20,
  p_q text DEFAULT NULL,
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
  search_words text[];
  word text;
  search_condition text := 'TRUE';
BEGIN
  -- Parse search query into words
  IF p_q IS NOT NULL AND trim(p_q) <> '' THEN
    search_words := string_to_array(lower(trim(p_q)), ' ');
    search_condition := '';

    -- Build condition: each word must be in title OR summary
    FOREACH word IN ARRAY search_words
    LOOP
      IF word <> '' THEN
        IF search_condition <> '' THEN
          search_condition := search_condition || ' AND ';
        END IF;
        search_condition := search_condition || format(
          '(lower(t.title) LIKE %L OR lower(COALESCE(t.summary, '''')) LIKE %L)',
          '%' || word || '%',
          '%' || word || '%'
        );
      END IF;
    END LOOP;

    IF search_condition = '' THEN
      search_condition := 'TRUE';
    END IF;
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
    WHERE t.visibility = ''public''
      AND %s
      AND (
        ($1 IS NULL AND $2 IS NULL)
        OR (t.created_at, t.id) < ($1, $2)
      )
    ORDER BY t.created_at DESC, t.id DESC
    LIMIT $3
  ', search_condition)
  USING p_cursor_created_at, p_cursor_id, p_limit;
END;
$$;

-- Update filter options to count ALL regions/themes per trip (not just first)
-- Drop and recreate to update the counting logic

DROP FUNCTION IF EXISTS get_region_filter_options();
CREATE OR REPLACE FUNCTION get_region_filter_options()
RETURNS TABLE (
  name text,
  slug text,
  trip_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    r.name,
    r.slug,
    COUNT(DISTINCT tr.trip_id) as trip_count
  FROM regions r
  LEFT JOIN trip_regions tr ON tr.region_id = r.id
  LEFT JOIN trips t ON t.id = tr.trip_id AND t.visibility = 'public'
  GROUP BY r.id, r.name, r.slug
  ORDER BY trip_count DESC, r.name ASC;
$$;

DROP FUNCTION IF EXISTS get_theme_filter_options();
CREATE OR REPLACE FUNCTION get_theme_filter_options()
RETURNS TABLE (
  name text,
  slug text,
  trip_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    th.name,
    th.slug,
    COUNT(DISTINCT tt.trip_id) as trip_count
  FROM themes th
  LEFT JOIN trip_themes tt ON tt.theme_id = th.id
  LEFT JOIN trips t ON t.id = tt.trip_id AND t.visibility = 'public'
  GROUP BY th.id, th.name, th.slug
  ORDER BY trip_count DESC, th.name ASC;
$$;
