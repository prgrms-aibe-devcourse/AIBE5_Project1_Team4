-- Expand search to include title, regions, and themes
-- Match if ANY of title/region/theme contains the search word

DROP FUNCTION IF EXISTS list_public_trips(int, text, timestamptz, uuid, text);

CREATE OR REPLACE FUNCTION list_public_trips(
  p_limit int DEFAULT 20,
  p_q text DEFAULT NULL,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL,
  p_sort text DEFAULT 'latest'
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
  word_condition text;
  order_clause text;
  cursor_condition text;
BEGIN
  -- Parse search query into words
  IF p_q IS NOT NULL AND trim(p_q) <> '' THEN
    search_words := string_to_array(lower(trim(p_q)), ' ');
    search_condition := '';

    -- Each word must match in title OR summary OR any region OR any theme
    FOREACH word IN ARRAY search_words
    LOOP
      IF word <> '' THEN
        IF search_condition <> '' THEN
          search_condition := search_condition || ' AND ';
        END IF;

        -- Word matches if found in title, summary, regions array, or themes array
        word_condition := format(
          '(lower(t.title) LIKE %L OR lower(COALESCE(t.summary, '''')) LIKE %L OR EXISTS (SELECT 1 FROM unnest(COALESCE(ra.regions, ARRAY[]::text[])) r WHERE lower(r) LIKE %L) OR EXISTS (SELECT 1 FROM unnest(COALESCE(ta.themes, ARRAY[]::text[])) th WHERE lower(th) LIKE %L))',
          '%' || word || '%',
          '%' || word || '%',
          '%' || word || '%',
          '%' || word || '%'
        );
        search_condition := search_condition || word_condition;
      END IF;
    END LOOP;

    IF search_condition = '' THEN
      search_condition := 'TRUE';
    END IF;
  END IF;

  -- Set order clause based on sort parameter
  IF p_sort = 'popular' THEN
    order_clause := 'COALESCE(lc.cnt, 0) DESC, t.created_at DESC, t.id DESC';
    cursor_condition := 'TRUE';
  ELSE
    order_clause := 't.created_at DESC, t.id DESC';
    IF p_cursor_created_at IS NOT NULL AND p_cursor_id IS NOT NULL THEN
      cursor_condition := format('(t.created_at, t.id) < (%L, %L)', p_cursor_created_at, p_cursor_id);
    ELSE
      cursor_condition := 'TRUE';
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
      AND %s
    ORDER BY %s
    LIMIT $1
  ', search_condition, cursor_condition, order_clause)
  USING p_limit;
END;
$$;
