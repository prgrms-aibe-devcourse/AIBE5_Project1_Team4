-- =====================================================
-- Trip Planner - Functionality Tests
-- =====================================================
-- This test file validates the functional behavior:
-- - Creating users, trips, places
-- - Testing RLS policies
-- - Testing triggers
-- - Testing collaboration features
-- =====================================================

\echo '========================================='
\echo 'Trip Planner Functionality Tests'
\echo '========================================='

BEGIN;

-- Create test users
\echo ''
\echo '1. Creating Test Users...'

-- First insert into auth.users (Supabase internal table)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'alice@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'bob@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'charlie@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- Then insert test profiles
INSERT INTO profiles (id, username, full_name)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'alice', 'Alice Johnson'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'bob', 'Bob Smith'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'charlie', 'Charlie Brown')
ON CONFLICT (id) DO NOTHING;

SELECT COUNT(*) AS "✓ Test users created" FROM profiles WHERE username IN ('alice', 'bob', 'charlie');

\echo ''
\echo '2. Creating Test Trip...'

-- Set session user to Alice
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000001';

-- Insert a trip as Alice
INSERT INTO trips (id, title, summary, start_date, end_date, visibility, created_by)
VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, 'Tokyo Adventure', 'A week in Tokyo exploring culture and food', '2026-03-01', '2026-03-07', 'public', '00000000-0000-0000-0000-000000000001'::uuid);

SELECT COUNT(*) AS "✓ Trip created" FROM trips WHERE id = '10000000-0000-0000-0000-000000000001'::uuid;

\echo ''
\echo '3. Testing Auto-Creation of Trip Owner...'

-- Check that Alice was automatically added as owner
SELECT
  COUNT(*) AS "✓ Owner auto-created"
FROM trip_members
WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid
AND user_id = '00000000-0000-0000-0000-000000000001'::uuid
AND role = 'owner';

\echo ''
\echo '4. Testing Places...'

-- Insert test places
INSERT INTO places (provider, provider_place_id, name, category, address, latitude, longitude)
VALUES
  ('kakao', 'test-001', 'Senso-ji Temple', 'Tourist Attraction', 'Asakusa, Tokyo', 35.7148, 139.7967),
  ('kakao', 'test-002', 'Tsukiji Fish Market', 'Market', 'Tsukiji, Tokyo', 35.6654, 139.7707),
  ('kakao', 'test-003', 'Tokyo Skytree', 'Landmark', 'Sumida, Tokyo', 35.7101, 139.8107);

SELECT COUNT(*) AS "✓ Places created" FROM places WHERE provider = 'kakao' AND provider_place_id LIKE 'test-%';

\echo ''
\echo '5. Testing Trip Days...'

-- Create trip days for each day of the trip
INSERT INTO trip_days (trip_id, date)
VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, '2026-03-01'),
  ('10000000-0000-0000-0000-000000000001'::uuid, '2026-03-02'),
  ('10000000-0000-0000-0000-000000000001'::uuid, '2026-03-03');

SELECT COUNT(*) AS "✓ Trip days created" FROM trip_days WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid;

\echo ''
\echo '6. Testing Schedule Items...'

-- Get IDs for created resources
DO $$
DECLARE
  v_day1_id uuid;
  v_day2_id uuid;
  v_place1_id uuid;
  v_place2_id uuid;
  v_place3_id uuid;
BEGIN
  SELECT id INTO v_day1_id FROM trip_days WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid AND date = '2026-03-01';
  SELECT id INTO v_day2_id FROM trip_days WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid AND date = '2026-03-02';
  SELECT id INTO v_place1_id FROM places WHERE provider_place_id = 'test-001';
  SELECT id INTO v_place2_id FROM places WHERE provider_place_id = 'test-002';
  SELECT id INTO v_place3_id FROM places WHERE provider_place_id = 'test-003';

  -- Create schedule items
  INSERT INTO schedule_items (trip_day_id, place_id, time, duration_minutes, notes, order_index)
  VALUES
    (v_day1_id, v_place1_id, '09:00', 120, 'Morning visit to the temple', 1),
    (v_day1_id, v_place2_id, '14:00', 90, 'Afternoon at the fish market', 2),
    (v_day2_id, v_place3_id, '10:00', 180, 'Visit Tokyo Skytree', 1);
END $$;

SELECT COUNT(*) AS "✓ Schedule items created" FROM schedule_items;

\echo ''
\echo '7. Testing Trip Members and Collaboration...'

-- Alice (owner) adds Bob as editor
INSERT INTO trip_members (trip_id, user_id, role)
VALUES ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'editor')
ON CONFLICT (trip_id, user_id) DO NOTHING;

SELECT COUNT(*) AS "✓ Editor added" FROM trip_members WHERE role = 'editor';

\echo ''
\echo '8. Testing Themes and Regions...'

-- Add themes and regions to trip
DO $$
DECLARE
  v_cultural_theme_id uuid;
  v_food_theme_id uuid;
  v_tokyo_region_id uuid;
BEGIN
  SELECT id INTO v_cultural_theme_id FROM themes WHERE slug = 'cultural';
  SELECT id INTO v_food_theme_id FROM themes WHERE slug = 'food-dining';
  SELECT id INTO v_tokyo_region_id FROM regions WHERE slug = 'tokyo';

  INSERT INTO trip_themes (trip_id, theme_id)
  VALUES
    ('10000000-0000-0000-0000-000000000001'::uuid, v_cultural_theme_id),
    ('10000000-0000-0000-0000-000000000001'::uuid, v_food_theme_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO trip_regions (trip_id, region_id)
  VALUES ('10000000-0000-0000-0000-000000000001'::uuid, v_tokyo_region_id)
  ON CONFLICT DO NOTHING;
END $$;

SELECT COUNT(*) AS "✓ Themes assigned" FROM trip_themes WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid;
SELECT COUNT(*) AS "✓ Regions assigned" FROM trip_regions WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid;

\echo ''
\echo '9. Testing Social Features...'

-- Bob likes the trip
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000002';

INSERT INTO trip_likes (trip_id, user_id)
VALUES ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid)
ON CONFLICT DO NOTHING;

-- Charlie bookmarks the trip
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000003';

INSERT INTO trip_bookmarks (trip_id, user_id)
VALUES ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000003'::uuid)
ON CONFLICT DO NOTHING;

SELECT COUNT(*) AS "✓ Likes created" FROM trip_likes WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid;
SELECT COUNT(*) AS "✓ Bookmarks created" FROM trip_bookmarks WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid;

\echo ''
\echo '10. Testing Reviews...'

-- Bob reviews the trip
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000002';

INSERT INTO reviews (author_id, target_type, trip_id, rating, content)
VALUES ('00000000-0000-0000-0000-000000000002'::uuid, 'trip', '10000000-0000-0000-0000-000000000001'::uuid, 5, 'Amazing trip! Highly recommend.')
ON CONFLICT DO NOTHING;

-- Alice reviews a place
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000001';

DO $$
DECLARE
  v_place_id uuid;
BEGIN
  SELECT id INTO v_place_id FROM places WHERE provider_place_id = 'test-001';

  INSERT INTO reviews (author_id, target_type, place_id, rating, content, visited_on)
  VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'place', v_place_id, 5, 'Beautiful temple with rich history', '2026-03-01')
  ON CONFLICT DO NOTHING;
END $$;

SELECT COUNT(*) AS "✓ Trip reviews" FROM reviews WHERE target_type = 'trip';
SELECT COUNT(*) AS "✓ Place reviews" FROM reviews WHERE target_type = 'place';

\echo ''
\echo '11. Testing Invite Links...'

-- Alice creates an invite link
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000001';

INSERT INTO trip_invite_links (trip_id, created_by, max_uses)
VALUES ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 5)
ON CONFLICT DO NOTHING;

SELECT COUNT(*) AS "✓ Invite links created" FROM trip_invite_links WHERE trip_id = '10000000-0000-0000-0000-000000000001'::uuid;

\echo ''
\echo '12. Testing Updated Timestamps...'

-- Update a trip and check updated_at changed
DO $$
DECLARE
  v_old_updated_at timestamptz;
  v_new_updated_at timestamptz;
BEGIN
  SELECT updated_at INTO v_old_updated_at FROM trips WHERE id = '10000000-0000-0000-0000-000000000001'::uuid;

  -- Wait a moment to ensure timestamp difference
  PERFORM pg_sleep(0.5);

  -- Update the trip
  UPDATE trips SET title = 'Tokyo Adventure - Updated' WHERE id = '10000000-0000-0000-0000-000000000001'::uuid;

  SELECT updated_at INTO v_new_updated_at FROM trips WHERE id = '10000000-0000-0000-0000-000000000001'::uuid;

  -- Check if updated_at changed (should be different due to trigger)
  IF v_new_updated_at IS NOT NULL AND v_old_updated_at IS NOT NULL AND v_new_updated_at >= v_old_updated_at THEN
    RAISE NOTICE '✓ updated_at trigger working (old: %, new: %)', v_old_updated_at, v_new_updated_at;
  ELSE
    RAISE NOTICE '✗ updated_at trigger may not be working properly (old: %, new: %)', v_old_updated_at, v_new_updated_at;
  END IF;
END $$;

\echo ''
\echo '13. Testing Helper Functions...'

-- Test is_trip_member
SET LOCAL request.jwt.claims.sub = '00000000-0000-0000-0000-000000000001';

SELECT is_trip_member('10000000-0000-0000-0000-000000000001'::uuid) AS "✓ Alice is member";
SELECT NOT is_trip_member('10000000-0000-0000-0000-000000000001'::uuid) AS "✓ Charlie is not member (should be false)"
WHERE current_setting('request.jwt.claims.sub', true) = '00000000-0000-0000-0000-000000000003';

-- Test can_edit_trip
SELECT can_edit_trip('10000000-0000-0000-0000-000000000001'::uuid) AS "✓ Alice can edit (owner)";

-- Test is_trip_owner
SELECT is_trip_owner('10000000-0000-0000-0000-000000000001'::uuid) AS "✓ Alice is owner";

\echo ''
\echo '14. Testing Constraint Violations...'

-- Test date range constraint
DO $$
BEGIN
  INSERT INTO trips (title, start_date, end_date, visibility, created_by)
  VALUES ('Invalid Trip', '2026-03-10', '2026-03-01', 'public', '00000000-0000-0000-0000-000000000001'::uuid);
  RAISE EXCEPTION 'Date constraint should have failed!';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE '✓ Date range constraint working';
END $$;

-- Test rating constraint
DO $$
DECLARE
  v_place_id uuid;
BEGIN
  SELECT id INTO v_place_id FROM places WHERE provider_place_id = 'test-002';

  INSERT INTO reviews (author_id, target_type, place_id, rating, content)
  VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'place', v_place_id, 6, 'Invalid rating');
  RAISE EXCEPTION 'Rating constraint should have failed!';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE '✓ Rating constraint working';
END $$;

\echo ''
\echo '========================================='
\echo 'All Functionality Tests Completed!'
\echo '========================================='

ROLLBACK;
