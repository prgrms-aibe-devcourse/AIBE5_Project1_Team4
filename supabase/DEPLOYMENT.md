# Trip Planner - Deployment Guide

## Overview

This guide walks through deploying the Trip Planner application to Supabase (production).

## Prerequisites

- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Supabase account (https://supabase.com)
- Node.js 18+ and npm (for Edge Functions)
- Docker (for local development)

## Local Development Setup

### 1. Start Local Supabase

```bash
# From project root
cd /path/to/project1
supabase start
```

This will:

- Start all Supabase services in Docker
- Apply all migrations from `supabase/migrations/`
- Create the `images` storage bucket
- Seed initial data (themes, regions)

### 2. Access Local Services

After starting, you'll see:

```
Studio:  http://127.0.0.1:54323
API URL: http://127.0.0.1:54321
DB URL:  postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 3. Run Tests

```bash
# Schema tests
docker exec -i supabase_db_supabase psql -U postgres -d postgres < tests/database/test_schema.sql

# Functionality tests
docker exec -i supabase_db_supabase psql -U postgres -d postgres < tests/database/test_functionality.sql
```

Expected results:

- ✅ 67 indexes created
- ✅ 49 RLS policies active
- ✅ 16 tables with RLS enabled
- ✅ 25 foreign key constraints
- ✅ All triggers working
- ✅ Storage bucket with 4 policies

## Production Deployment

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create a new project
3. Note down:
   - Project URL
   - Anon (public) key
   - Service role key

### Step 2: Link Local Project to Remote

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Optional: Pull existing schema (if any)
supabase db pull
```

### Step 3: Push Database Migrations

```bash
# Push all migrations to production
supabase db push

# Verify migrations applied
supabase db diff
```

This will apply:

- `20260119000000_initial_schema.sql` - Complete database schema
- `20260119000001_storage_setup.sql` - Storage bucket and policies

### Step 4: Configure Environment Variables

Create `.env` files for Edge Functions:

```bash
cd supabase/functions
cp .env.example .env
```

Edit `.env` with your keys:

```env
# Supabase (automatically provided in production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kakao API (required)
KAKAO_REST_API_KEY=your-kakao-rest-api-key

# AI Service (choose one)
OPENAI_API_KEY=your-openai-api-key
# OR
# ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Step 5: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy search-place
supabase functions deploy process-image
supabase functions deploy create-review
supabase functions deploy ai-suggest-query
supabase functions deploy accept-invite-link

# Or deploy all at once
for fn in search-place process-image create-review ai-suggest-query accept-invite-link; do
  supabase functions deploy $fn
done
```

### Step 6: Set Secrets for Edge Functions

```bash
# Set Kakao API key
supabase secrets set KAKAO_REST_API_KEY=your-key

# Set AI API key (choose one)
supabase secrets set OPENAI_API_KEY=your-key
# OR
supabase secrets set ANTHROPIC_API_KEY=your-key
```

### Step 7: Verify Deployment

```bash
# Check function status
supabase functions list

# Test a function
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/search-place' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"query":"coffee shop gangnam"}'
```

## Database Schema

### Core Tables

- `profiles` - User profiles (1:1 with auth.users)
- `trips` - Travel plans (collaborative documents)
- `trip_members` - Access control (owner/editor)
- `trip_days` - Day pages within trips
- `schedule_items` - Activities in each day
- `places` - Shared place master table (cached from Kakao API)

### Social Features

- `trip_likes` - Public engagement
- `trip_bookmarks` - Private saves
- `reviews` - Unified review system (trips + places)

### Taxonomy

- `themes` - Travel themes (10 seeded)
- `regions` - Geographic regions (10 seeded)
- `trip_themes`, `trip_regions` - Many-to-many relationships

### Utilities

- `trip_invite_links` - Link-based invitations
- `ai_query_suggestions` - AI query logs
- `rate_limits` - Rate limiting

## Security Model

All tables use Row Level Security (RLS):

### Helper Functions

- `is_trip_member(trip_id)` - Check membership
- `can_edit_trip(trip_id)` - Check edit permission
- `is_trip_owner(trip_id)` - Check ownership
- `can_view_trip(trip_id)` - Check view permission

### Access Rules

- **Public trips**: Anyone can view, only members can edit
- **Unlisted/Private trips**: Only members can view/edit
- **Editing**: Owner/editor can modify
- **Deletion**: Only owner can delete

## Edge Functions

### 1. search-place

**Endpoint**: `/functions/v1/search-place`

Searches Kakao Local API and caches results.

```json
POST /functions/v1/search-place
{
  "query": "coffee shop gangnam",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "radius": 5000
}
```

### 2. process-image

**Endpoint**: `/functions/v1/process-image`

Handles image uploads to storage.

```bash
POST /functions/v1/process-image
Content-Type: multipart/form-data

file: <image file>
kind: "cover" | "review"
trip_id: <uuid> (for cover)
review_id: <uuid> (for review)
```

### 3. create-review

**Endpoint**: `/functions/v1/create-review`

Creates a review with validation.

```json
POST /functions/v1/create-review
{
  "target_type": "trip",
  "trip_id": "uuid",
  "rating": 5,
  "content": "Amazing trip!",
  "visited_on": "2026-03-01"
}
```

### 4. ai-suggest-query

**Endpoint**: `/functions/v1/ai-suggest-query`

Normalizes search queries using AI.

```json
POST /functions/v1/ai-suggest-query
{
  "q": "coffe shop gangnam"
}
```

Returns:

```json
{
  "data": {
    "normalized_query": "coffee shop gangnam",
    "suggestions": ["cafe gangnam", "coffee gangnam seoul", ...]
  }
}
```

### 5. accept-invite-link

**Endpoint**: `/functions/v1/accept-invite-link`

Accepts invitation and adds user to trip.

```json
POST /functions/v1/accept-invite-link
{
  "token": "invitation-token-here"
}
```

## Storage

### Bucket: `images`

- **Type**: Public
- **Size limit**: 5MB per file
- **Allowed types**: JPEG, PNG, WebP, GIF
- **Structure**:
  - `trips/{trip_id}/{user_id}_{timestamp}_{random}.jpg`
  - `reviews/{review_id}/{user_id}_{timestamp}_{random}.jpg`

### Policies

- ✅ Anyone can view (public bucket)
- ✅ Authenticated users can upload
- ✅ Users can update/delete their own images

## Monitoring

### Database Health

```bash
# Check migration status
supabase db diff

# View database statistics
supabase db inspect
```

### Edge Functions

```bash
# View function logs
supabase functions logs search-place --tail

# Check function metrics
supabase functions list
```

### Storage

- Monitor storage usage in Supabase Dashboard
- Check for failed uploads in Storage logs

## Troubleshooting

### Migration Errors

```bash
# Reset local database
supabase db reset

# Pull remote schema
supabase db pull

# Check differences
supabase db diff
```

### Edge Function Errors

```bash
# View recent logs
supabase functions logs <function-name> --tail

# Test locally
supabase functions serve
```

### Storage Issues

- Verify bucket exists: Check Storage tab in Dashboard
- Check policies: Ensure RLS policies are active
- Verify file size: Max 5MB per file

## Next Steps

1. **Frontend Development**
   - Connect to Supabase using `@supabase/supabase-js`
   - Use environment variables for API keys
   - Implement Realtime subscriptions

2. **Testing**
   - Write integration tests for Edge Functions
   - Add E2E tests for frontend
   - Load test the database

3. **Performance**
   - Add database indexes as needed
   - Monitor slow queries
   - Implement caching strategies

4. **Security**
   - Audit RLS policies regularly
   - Review Edge Function permissions
   - Enable rate limiting in production

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli)
- [Deno Deploy](https://deno.com/deploy) (for Edge Functions)
- [Kakao Local API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)
