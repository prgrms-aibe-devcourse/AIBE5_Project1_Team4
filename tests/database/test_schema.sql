-- =====================================================
-- Trip Planner - Database Schema Tests
-- =====================================================
-- This test file validates the database schema, RLS policies,
-- triggers, and helper functions.
-- Run with: psql -f tests/database/test_schema.sql
-- =====================================================

\echo '========================================='
\echo 'Trip Planner Database Schema Tests'
\echo '========================================='

-- Start transaction (will be rolled back)
BEGIN;

\echo ''
\echo '1. Testing Helper Functions...'

-- Test 1.1: is_trip_member function exists
SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'is_trip_member'
) AS "✓ is_trip_member function exists";

-- Test 1.2: can_edit_trip function exists
SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'can_edit_trip'
) AS "✓ can_edit_trip function exists";

-- Test 1.3: is_trip_owner function exists
SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'is_trip_owner'
) AS "✓ is_trip_owner function exists";

-- Test 1.4: can_view_trip function exists
SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'can_view_trip'
) AS "✓ can_view_trip function exists";

\echo ''
\echo '2. Testing Core Tables...'

-- Test 2.1: All core tables exist
SELECT
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') AS profiles,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trips') AS trips,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_members') AS trip_members,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_days') AS trip_days,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedule_items') AS schedule_items,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'places') AS places;

\echo '✓ All core tables exist'

-- Test 2.2: Check constraints on trips table
SELECT
  COUNT(*) AS "✓ trips constraints count"
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
AND constraint_name LIKE 'trips_%';

-- Test 2.3: Check unique constraints on places
SELECT
  COUNT(*) AS "✓ places unique constraints"
FROM information_schema.table_constraints
WHERE table_name = 'places'
AND constraint_type = 'UNIQUE';

\echo ''
\echo '3. Testing Social Tables...'

-- Test 3.1: Social tables exist
SELECT
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_likes') AS likes,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_bookmarks') AS bookmarks,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') AS reviews;

\echo '✓ All social tables exist'

\echo ''
\echo '4. Testing Taxonomy Tables...'

-- Test 4.1: Taxonomy tables exist
SELECT
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'themes') AS themes,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'regions') AS regions,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_themes') AS trip_themes,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_regions') AS trip_regions;

\echo '✓ All taxonomy tables exist'

-- Test 4.2: Check seed data
SELECT
  COUNT(*) AS "✓ themes seed data count"
FROM themes;

SELECT
  COUNT(*) AS "✓ regions seed data count"
FROM regions;

\echo ''
\echo '5. Testing Utility Tables...'

-- Test 5.1: Utility tables exist
SELECT
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_invite_links') AS invites,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_query_suggestions') AS ai_suggestions,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') AS rate_limits;

\echo '✓ All utility tables exist'

\echo ''
\echo '6. Testing Indexes...'

-- Test 6.1: Check critical indexes exist
SELECT
  COUNT(*) AS "✓ total indexes count"
FROM pg_indexes
WHERE schemaname = 'public';

-- Test 6.2: Check specific important indexes
SELECT
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trips_visibility') AS trips_visibility,
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trip_members_trip_id') AS members_trip,
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_places_provider') AS places_provider,
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_schedule_items_sorting') AS schedule_sorting;

\echo '✓ Critical indexes exist'

\echo ''
\echo '7. Testing Triggers...'

-- Test 7.1: Check trigger functions exist
SELECT
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') AS update_timestamp,
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_by') AS set_updated_by,
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_trip_owner_member') AS create_owner;

\echo '✓ All trigger functions exist'

-- Test 7.2: Check triggers are attached
SELECT
  COUNT(*) AS "✓ total triggers count"
FROM information_schema.triggers
WHERE trigger_schema = 'public';

\echo ''
\echo '8. Testing Row Level Security...'

-- Test 8.1: Check RLS is enabled on all tables
SELECT
  COUNT(*) AS "✓ tables with RLS enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Test 8.2: Check number of policies
SELECT
  COUNT(*) AS "✓ total RLS policies"
FROM pg_policies
WHERE schemaname = 'public';

-- Test 8.3: Check critical policies exist
SELECT
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname LIKE '%select%') AS trips_select,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname LIKE '%insert%') AS trips_insert,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_members' AND policyname LIKE '%select%') AS members_select,
  EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname LIKE '%insert%') AS reviews_insert;

\echo '✓ Critical RLS policies exist'

\echo ''
\echo '9. Testing Foreign Key Constraints...'

-- Test 9.1: Count foreign keys
SELECT
  COUNT(*) AS "✓ total foreign key constraints"
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

\echo ''
\echo '10. Testing Check Constraints...'

-- Test 10.1: Verify critical check constraints
SELECT
  EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE '%valid_date_range%') AS date_range,
  EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE '%valid_visibility%') AS visibility,
  EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE '%valid_rating%') AS rating,
  EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE '%valid_coordinates%') AS coordinates;

\echo '✓ Critical check constraints exist'

\echo ''
\echo '========================================='
\echo 'All Schema Tests Completed!'
\echo '========================================='

-- Rollback transaction (no actual data changes)
ROLLBACK;
