# Trip Planner - Edge Functions

This directory contains Supabase Edge Functions (Deno runtime) for the Trip Planner application.

## Functions Overview

| Function | Purpose | Authentication |
|----------|---------|----------------|
| **search-place** | Search places via Kakao API + cache results | Required |
| **process-image** | Upload images to Storage with permission checks | Required |
| **create-review** | Create reviews with validation | Required |
| **ai-suggest-query** | AI-powered search query suggestions | Optional |
| **accept-invite-link** | Accept invitation to join a trip | Required |

## Environment Variables

Configure these in your Supabase project settings:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For search-place
KAKAO_REST_API_KEY=your-kakao-api-key

# For ai-suggest-query (choose one)
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key
```

## Deployment

Deploy all functions:

```bash
supabase functions deploy search-place
supabase functions deploy process-image
supabase functions deploy create-review
supabase functions deploy ai-suggest-query
supabase functions deploy accept-invite-link
```

## Function Details

### 1. search-place

Searches for places using Kakao Local API and caches results in the database.

**Endpoint:** `POST /search-place`

**Request:**
```json
{
  "query": "coffee shop gangnam",
  "latitude": 37.4979,
  "longitude": 127.0276,
  "radius": 5000,
  "page": 1,
  "size": 15
}
```

**Response:**
```json
{
  "data": {
    "places": [
      {
        "id": "uuid",
        "provider": "kakao",
        "provider_place_id": "12345",
        "name": "Cafe Example",
        "category": "Food > Cafe",
        "address": "Seoul Gangnam-gu...",
        "road_address": "123 Teheran-ro...",
        "phone": "02-1234-5678",
        "latitude": 37.4979,
        "longitude": 127.0276,
        "raw_data": {...}
      }
    ],
    "meta": {
      "total": 245,
      "page": 1,
      "size": 15,
      "is_end": false
    }
  }
}
```

**Features:**
- Automatic place caching (upsert by provider + provider_place_id)
- Location-based search with radius
- Pagination support
- Returns cached place IDs for use in schedule_items

---

### 2. process-image

Handles image uploads to Supabase Storage with permission checks and validation.

**Endpoint:** `POST /process-image`

**Request:** `multipart/form-data`
```
file: [image file]
kind: "cover" | "review"
trip_id: "uuid" (required if kind=cover)
review_id: "uuid" (required if kind=review)
```

**Response:**
```json
{
  "data": {
    "url": "https://your-project.supabase.co/storage/v1/object/public/images/...",
    "path": "trips/trip-id/filename.jpg",
    "kind": "cover",
    "trip_id": "uuid"
  }
}
```

**Features:**
- Validates file type (JPEG, PNG, WebP, GIF)
- Max file size: 5MB
- Permission checks (owner/editor for trips, author for reviews)
- Auto-updates `trips.cover_image_url` when kind=cover
- Organized storage paths: `trips/{trip_id}/` and `reviews/{review_id}/`

**Allowed MIME types:**
- image/jpeg
- image/jpg
- image/png
- image/webp
- image/gif

---

### 3. create-review

Creates reviews for trips or places with validation and permission checks.

**Endpoint:** `POST /create-review`

**Request:**
```json
{
  "target_type": "trip",
  "trip_id": "uuid",
  "rating": 5,
  "content": "Great trip planning experience!",
  "visited_on": "2024-01-15",
  "photo_urls": ["url1", "url2"]
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "author_id": "uuid",
    "target_type": "trip",
    "trip_id": "uuid",
    "rating": 5,
    "content": "Great trip...",
    "visited_on": "2024-01-15",
    "photo_urls": ["url1", "url2"],
    "created_at": "2024-01-15T12:00:00Z",
    "author": {
      "id": "uuid",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": "https://..."
    }
  },
  "message": "Review created successfully"
}
```

**Validation:**
- Rating must be 1-5 (integer)
- One review per user per target
- Trip reviews require permission to view the trip
- Place reviews are open to all authenticated users
- visited_on must be YYYY-MM-DD format

---

### 4. ai-suggest-query

AI-powered search query normalization and suggestions. **NOT a chatbot** - only for search improvement.

**Endpoint:** `POST /ai-suggest-query`

**Request:**
```json
{
  "q": "coffe shop gangnam"
}
```

**Response:**
```json
{
  "data": {
    "original_query": "coffe shop gangnam",
    "normalized_query": "coffee shop gangnam",
    "suggestions": [
      "cafe gangnam",
      "coffee gangnam seoul",
      "specialty coffee gangnam",
      "coffee roasters gangnam"
    ]
  }
}
```

**Features:**
- Fixes typos and standardizes queries
- Generates 3-5 related search suggestions
- Supports OpenAI (gpt-3.5-turbo) or Claude (haiku)
- Logs all queries to `ai_query_suggestions` table
- Graceful fallback if no AI configured (returns original query)

**Models:**
- OpenAI: `gpt-3.5-turbo`
- Anthropic: `claude-3-haiku-20240307`

---

### 5. accept-invite-link

Accepts trip invitation links and adds users as editors.

**Endpoint:** `POST /accept-invite-link`

**Request:**
```json
{
  "token": "invite-token-string"
}
```

**Response:**
```json
{
  "data": {
    "trip": {
      "id": "uuid",
      "title": "Tokyo Summer 2024",
      "summary": "...",
      "start_date": "2024-07-01",
      "end_date": "2024-07-07",
      "visibility": "private"
    },
    "membership": {
      "id": "uuid",
      "trip_id": "uuid",
      "user_id": "uuid",
      "role": "editor",
      "joined_at": "2024-01-15T12:00:00Z"
    },
    "role": "editor"
  },
  "message": "Successfully joined the trip"
}
```

**Features:**
- Validates token existence and expiration
- Checks max_uses limit
- Adds user as "editor" role
- Increments use_count
- Handles already-member case gracefully
- Returns full trip details after joining

**Error cases:**
- 404: Invalid/deleted token
- 410: Expired or exhausted link
- 200: Already a member (success, returns existing membership)

---

## Storage Setup

Create a public bucket named `images`:

```sql
-- Via Supabase Dashboard > Storage
-- Create bucket: images
-- Make it public
```

Or via SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

**Storage policies:**

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public to read images
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Error Handling

All functions follow consistent error response format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `410` - Gone (expired resource)
- `500` - Internal Server Error
- `502` - Bad Gateway (external API error)

---

## Testing

Test locally with Supabase CLI:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/search-place \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shop"}'
```

---

## Security Notes

1. **RLS Enforcement:** All functions use `createSupabaseClient` with user's auth token, ensuring RLS policies are enforced
2. **Service Role:** Only use `createServiceRoleClient` when absolutely necessary (none of these functions need it)
3. **Permission Checks:** Functions validate permissions before operations:
   - `process-image`: Checks `can_edit_trip()` or review ownership
   - `create-review`: Checks `can_view_trip()` for trip reviews
   - `accept-invite-link`: Validates token and checks membership
4. **Input Validation:** All inputs are validated before processing
5. **CORS:** All functions include CORS headers for browser requests

---

## Monitoring

View function logs:

```bash
# Via CLI
supabase functions logs search-place

# Via Dashboard
# Supabase Dashboard > Edge Functions > [function name] > Logs
```

---

## Next Steps

After deploying Edge Functions:

1. **Test each function** with your frontend
2. **Set up monitoring** and alerts
3. **Configure rate limiting** in your application
4. **Add analytics** tracking if needed
5. **Optimize caching** strategies for places
