-- Improved trip search with multi-word matching
-- "오사카 가족" -> matches "오사카 3일 가족여행"

-- Drop existing function if exists
DROP FUNCTION IF EXISTS list_public_trips(int, text, timestamptz, uuid);

-- Create improved search function with region and theme
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
  region text,
  theme text
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
      r.name as region,
      th.name as theme
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
    LEFT JOIN LATERAL (
      SELECT reg.name FROM trip_regions tr
      JOIN regions reg ON reg.id = tr.region_id
      WHERE tr.trip_id = t.id
      LIMIT 1
    ) r ON true
    LEFT JOIN LATERAL (
      SELECT thm.name FROM trip_themes tt
      JOIN themes thm ON thm.id = tt.theme_id
      WHERE tt.trip_id = t.id
      LIMIT 1
    ) th ON true
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

-- Add index for faster text search
CREATE INDEX IF NOT EXISTS idx_trips_title_lower ON trips (lower(title));
CREATE INDEX IF NOT EXISTS idx_trips_summary_lower ON trips (lower(summary)) WHERE summary IS NOT NULL;
