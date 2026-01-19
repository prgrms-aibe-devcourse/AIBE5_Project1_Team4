# Trip Planner - Database Schema

This directory contains the Supabase database schema for the Trip Planner collaborative travel planning application.

## Quick Start

To apply the migration to your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually via SQL Editor in Supabase Dashboard
# Copy the contents of migrations/20260119000000_initial_schema.sql
```

## Schema Overview

### Core Entities

**trips** - The main collaborative document
- Each trip is like a Google Doc for travel planning
- Has visibility settings: public, unlisted, or private
- Automatically creates an owner in `trip_members` on insert

**trip_members** - Access control for trips
- Roles: `owner` (can delete, full control) or `editor` (can edit)
- Created automatically for trip creator

**trip_days** - Day pages within a trip
- Must be continuous dates within trip date range
- Each day can have notes

**schedule_items** - Individual activities in a day
- Always references a `place`
- Has optional `time` (nullable)
- Sorted by: (time IS NULL), time, order_index

**places** - Shared master table for all locations
- Cached from external APIs (Kakao Local)
- Unique by (provider, provider_place_id)
- Shared across all trips

### Social Features

**trip_likes** - Public engagement metric

**trip_bookmarks** - Private save-for-later

**reviews** - Unified review system
- Can target either a `trip` or a `place`
- Trip reviews respect trip visibility
- Place reviews are always public

### Discovery

**themes** - Travel themes (Adventure, Beach, Cultural, etc.)

**regions** - Geographic regions (Seoul, Tokyo, Paris, etc.)

**trip_themes** & **trip_regions** - Many-to-many relationships

### Collaboration

**trip_invite_links** - Link-based invitation system
- Generates unique tokens
- Optional expiration and max uses
- Tracks use count

### AI & Utilities

**ai_query_suggestions** - Logs AI search query processing

**rate_limits** - Simple rate limiting per user/operation

## Security Model

All tables use Row Level Security (RLS). Access is controlled through helper functions:

### Helper Functions

```sql
is_trip_member(trip_id)     -- Check if user is a member
can_edit_trip(trip_id)      -- Check if user can edit (owner/editor)
is_trip_owner(trip_id)      -- Check if user is owner
can_view_trip(trip_id)      -- Check if user can view trip
```

### Access Rules

**Public trips:**
- Anyone can view
- Anyone can like
- Only members can edit

**Unlisted trips:**
- Only members can view
- Only members can review

**Private trips:**
- Only members can view
- Only members can review

**Editing:**
- Only owner/editor can modify trip content
- Only owner can delete trip
- Only owner can manage members

## Triggers

### Auto-updating timestamps
- `updated_at` is automatically set on UPDATE for all relevant tables

### Auto-setting user context
- `updated_by` is automatically set to `auth.uid()` on UPDATE for:
  - trips
  - trip_days
  - schedule_items

### Auto-creating owner
- When a trip is created, the creator is automatically added to `trip_members` as `owner`

## Indexes

Indexes are strategically placed for:
- Foreign key lookups
- Common query patterns (visibility, created_at DESC)
- Geospatial queries (lat/lng on places)
- Sorting schedule items
- Review filtering

## Data Integrity

### Constraints

**Trips:**
- `end_date >= start_date`
- `visibility IN ('public', 'unlisted', 'private')`

**Places:**
- Unique (provider, provider_place_id)
- Valid coordinates (-90 to 90 lat, -180 to 180 lng)

**Reviews:**
- Rating 1-5
- Must target either trip OR place (not both)
- One review per user per target

**Schedule Items:**
- Sorted by: time NULLS FIRST, then order_index

## Realtime Collaboration

For realtime features, subscribe to:

```javascript
// Presence channel for online users
const channel = supabase.channel(`trip:${tripId}`)
  .on('presence', { event: 'sync' }, () => {
    // Handle presence updates
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'schedule_items',
    filter: `trip_day_id=in.(${dayIds})`
  }, payload => {
    // Handle schedule changes
  })
  .subscribe()
```

## Next Steps

After applying this migration:

1. Set up Edge Functions for:
   - `search-place` - Kakao API integration
   - `process-image` - Image upload handling
   - `create-review` - Review creation with validation
   - `ai-suggest-query` - AI query processing
   - `accept-invite-link` - Invitation acceptance

2. Configure Storage:
   - Create public bucket for images
   - Set up upload policies

3. Seed initial data if needed:
   - Additional themes
   - Regional data
   - Sample trips (for demo)

## Notes

- This schema follows the MVP v1.2 specification
- No CRDT/OT in MVP - use optimistic UI + debounced commits
- All mutations should go through RLS - never bypass with service role in client
