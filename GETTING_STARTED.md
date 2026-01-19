# Getting Started with Trip Planner

## Project Status ✅

All three phases are complete and ready to use:

- ✅ Phase 1: Database schema with RLS
- ✅ Phase 2: Edge Functions (5 functions)
- ✅ Phase 3: Frontend application

## Quick Start (5 minutes)

### 1. Apply Database Migration

```bash
# From project root
supabase db push
```

This creates all tables, policies, functions, and seed data.

### 2. Deploy Edge Functions

```bash
cd supabase/functions

# Deploy all functions
supabase functions deploy search-place
supabase functions deploy process-image
supabase functions deploy create-review
supabase functions deploy ai-suggest-query
supabase functions deploy accept-invite-link
```

### 3. Create Storage Bucket

Via Supabase Dashboard:

1. Go to **Storage**
2. Create bucket named `images`
3. Make it **public**

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:5173

## What You Can Do Now

### For Users (MVP Features)

1. **Sign up / Login**
2. **Browse public trips** on homepage
3. **View trip details** with full itinerary
4. **Create a new trip** (needs UI - use Supabase Dashboard for now)
5. **Edit trips** with real-time collaboration
6. **See who's online** when editing

### For Development

1. **Test the API** via Edge Functions
2. **Create trips manually** via Supabase Dashboard
3. **Search places** via Kakao API
4. **Upload images** for trip covers
5. **Add reviews** for trips and places

## Manual Testing Steps

### Create Your First Trip

Since the "Create Trip" UI isn't in the MVP, use Supabase Dashboard:

1. Go to Supabase Dashboard > **Table Editor** > `trips`
2. Click **Insert Row**
3. Fill in:
   ```
   title: "Tokyo Adventure"
   summary: "A week exploring Tokyo"
   start_date: "2024-03-01"
   end_date: "2024-03-07"
   visibility: "public"
   created_by: [your user ID from profiles table]
   ```
4. Save

The trip will automatically:

- Create you as the owner in `trip_members`
- Show up on the homepage
- Be editable in the Edit page

### Test Real-time Collaboration

1. Open the edit page for a trip: `/trips/[id]/edit`
2. Open the same URL in another browser/tab (different user if possible)
3. See presence indicators showing who's online
4. Make changes and see them sync

### Test Place Search

```bash
# Via curl (replace with your session token)
curl -X POST https://your-project.functions.supabase.co/search-place \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee shop gangnam", "page": 1}'
```

## Environment Variables

### Already Configured ✅

**Frontend** (`.env`):

```bash
VITE_SUPABASE_URL=https://luahhgcbrlkfbbawcult.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SDDa1xzlYCu7OfeWJYSVAA_ap_q1gwU
```

**Edge Functions** (`supabase/functions/.env`):

```bash
SUPABASE_URL=https://luahhgcbrlkfbbawcult.supabase.co
SUPABASE_ANON_KEY=sb_publishable_SDDa1xzlYCu7OfeWJYSVAA_ap_q1gwU
SUPABASE_SERVICE_ROLE_KEY=sb_secret_6OzkE-6CH066-8PANo_jFg_sfRkGCIs
KAKAO_REST_API_KEY=adf4d53a313aa60e9213476773d61199
```

### Optional (for AI features)

Add to `supabase/functions/.env`:

```bash
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key
```

## Development Commands

```bash
# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Database
supabase db push     # Apply migrations
supabase db reset    # Reset database (⚠️ destroys data)

# Edge Functions
supabase functions serve              # Serve locally
supabase functions logs search-place  # View logs
supabase secrets list                 # List secrets
```

## Architecture Overview

### Frontend Stack

- React 18 + TypeScript + Vite
- React Router for navigation
- Supabase client for backend
- date-fns for dates
- lucide-react for icons

### Backend Stack

- Supabase Postgres with RLS
- Supabase Realtime for collaboration
- Edge Functions (Deno runtime)
- Kakao Local Search API
- Optional: OpenAI/Claude for AI

### Key Features

- **Real-time collaboration** - See who's editing
- **Row Level Security** - All access controlled by Postgres
- **Place caching** - Kakao API results cached in database
- **Review system** - Unified for trips and places
- **Link invitations** - Share trips with teammates

## Known Limitations (MVP)

These features are designed but not implemented:

- ❌ Create Trip UI (use Supabase Dashboard)
- ❌ Add/Edit schedule items UI
- ❌ Place search in frontend
- ❌ Drag-and-drop itinerary
- ❌ Map integration (Leaflet)
- ❌ Review UI components
- ❌ Bookmark/Like UI (API exists)
- ❌ My Trips page
- ❌ Bookmarks page

These can be added in future iterations.

## Troubleshooting

### "Failed to load trips"

- Check if database migration was applied
- Verify Supabase URL and keys in `.env`
- Check browser console for errors

### "Missing authorization header"

- Make sure you're logged in
- Check if session is valid
- Try logging out and back in

### "Search place not working"

- Verify Edge Function is deployed
- Check Kakao API key is set
- Look at function logs: `supabase functions logs search-place`

### Build errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

1. **Add Create Trip UI** - Form to create trips from frontend
2. **Add Schedule Editor** - Drag-and-drop interface for days/items
3. **Add Place Search** - Frontend for searching and adding places
4. **Add Map** - Leaflet/Mapbox integration
5. **Add Reviews** - UI for reviewing trips and places
6. **Add Social Features** - Likes, bookmarks, sharing
7. **Add Filters** - Search by region, theme, dates
8. **Add User Profile** - Edit profile, avatar upload
9. **Add Notifications** - Real-time updates
10. **Add Mobile Responsiveness** - Better mobile UX

## Resources

- **Supabase Dashboard**: https://luahhgcbrlkfbbawcult.supabase.co
- **Database Schema**: `/supabase/README.md`
- **Edge Functions**: `/supabase/functions/README.md`
- **Security Guide**: `/SECURITY.md`
- **Main README**: `/README.md`

## Support

If you encounter issues:

1. Check the console for errors
2. Review the documentation
3. Check Supabase logs
4. Verify environment variables
5. Try resetting the database (dev only!)

---

**Happy trip planning!** 🗺️✈️
