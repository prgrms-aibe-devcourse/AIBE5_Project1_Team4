-- Get filter options with trip counts, sorted by count descending
-- Count based on "first" region/theme per trip (same logic as list_public_trips)

-- Regions with trip count (first region per trip only)
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
  WITH trip_first_region AS (
    SELECT DISTINCT ON (t.id)
      t.id as trip_id,
      r.id as region_id
    FROM trips t
    JOIN trip_regions tr ON tr.trip_id = t.id
    JOIN regions r ON r.id = tr.region_id
    WHERE t.visibility = 'public'
    ORDER BY t.id, tr.created_at
  )
  SELECT
    r.name,
    r.slug,
    COUNT(tfr.trip_id) as trip_count
  FROM regions r
  LEFT JOIN trip_first_region tfr ON tfr.region_id = r.id
  GROUP BY r.id, r.name, r.slug
  ORDER BY trip_count DESC, r.name ASC;
$$;

-- Themes with trip count (first theme per trip only)
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
  WITH trip_first_theme AS (
    SELECT DISTINCT ON (t.id)
      t.id as trip_id,
      th.id as theme_id
    FROM trips t
    JOIN trip_themes tt ON tt.trip_id = t.id
    JOIN themes th ON th.id = tt.theme_id
    WHERE t.visibility = 'public'
    ORDER BY t.id, tt.created_at
  )
  SELECT
    th.name,
    th.slug,
    COUNT(tft.trip_id) as trip_count
  FROM themes th
  LEFT JOIN trip_first_theme tft ON tft.theme_id = th.id
  GROUP BY th.id, th.name, th.slug
  ORDER BY trip_count DESC, th.name ASC;
$$;
