# Trip Planner - Collaborative Travel Planning Application

A production-grade collaborative travel planning application built with React, TypeScript, and Supabase.

## Project Vision

Trip Planner is "Google Docs + Figma + Map + Travel Itinerary" - a real-time collaborative travel planning platform where:
- Multiple users can edit the same trip simultaneously
- Finished trips become discoverable, shareable assets
- Trips and places can receive reviews from the community
- AI assists with search, not as a chatbot

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **React Router** for navigation
- **Leaflet** for maps
- **date-fns** for date handling
- **lucide-react** for icons

### Backend
- **Supabase**
  - Postgres database with RLS
  - Authentication
  - Storage (images)
  - Realtime (collaboration)
  - Edge Functions

### External APIs
- **Kakao Local Search** for place discovery
- **OpenAI** or **Anthropic Claude** for AI query suggestions

## Project Structure

```
project1/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── api/            # API layer (trips, places, reviews)
│   │   ├── components/      # React components
│   │   ├── context/        # React context (Auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Supabase client
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── .env               # Environment variables (gitignored)
│   └── package.json
│
├── supabase/              # Supabase configuration
│   ├── functions/          # Edge Functions
│   │   ├── search-place/  # Kakao API integration
│   │   ├── process-image/ # Image upload
│   │   ├── create-review/ # Review creation
│   │   ├── ai-suggest-query/ # AI query normalization
│   │   └── accept-invite-link/ # Invitation system
│   └── migrations/         # Database schema
│       └── 20260119000000_initial_schema.sql
│
└── README.md              # This file
```

## Setup Instructions

### 1. Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Supabase CLI
npm install -g supabase

# Git
git --version
```

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd project1

# Install frontend dependencies
cd frontend
npm install
```

### 3. Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# These are already configured:
VITE_SUPABASE_URL=https://luahhgcbrlkfbbawcult.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SDDa1xzlYCu7OfeWJYSVAA_ap_q1gwU
```

### 4. Database Setup

```bash
# From project root
cd ..

# Apply database migration
supabase db push

# This will create:
# - All tables with constraints
# - RLS policies
# - Helper functions
# - Triggers
# - Seed data (themes, regions)
```

### 5. Edge Functions Deployment

```bash
# Set environment variables for Edge Functions
cd supabase/functions

# Make sure .env has these values:
# KAKAO_REST_API_KEY=adf4d53a313aa60e9213476773d61199
# SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Deploy all Edge Functions
supabase functions deploy search-place
supabase functions deploy process-image
supabase functions deploy create-review
supabase functions deploy ai-suggest-query
supabase functions deploy accept-invite-link
```

### 6. Storage Setup

Create an `images` bucket in Supabase Dashboard:

1. Go to **Storage** in Supabase Dashboard
2. Create new bucket: `images`
3. Make it **public**
4. Apply the storage policies from `supabase/functions/README.md`

### 7. Run the Application

```bash
# From frontend directory
cd frontend
npm run dev

# Application will open at http://localhost:5173
```

## Features

### Phase 1: Database ✅
- [x] Complete PostgreSQL schema
- [x] Row Level Security (RLS) policies
- [x] Helper functions for access control
- [x] Automatic triggers (updated_at, updated_by, owner creation)
- [x] Seed data (themes, regions)

### Phase 2: Edge Functions ✅
- [x] `search-place` - Kakao API integration + place caching
- [x] `process-image` - Image upload with validation
- [x] `create-review` - Review creation with permissions
- [x] `ai-suggest-query` - AI-powered search suggestions
- [x] `accept-invite-link` - Invitation system

### Phase 3: Frontend ✅
- [x] React + TypeScript + Vite setup
- [x] Authentication (Login/Signup)
- [x] Home page (Trip discovery)
- [x] Trip Detail page
- [x] Trip Edit page with Realtime
- [x] Supabase client integration
- [x] API layer (trips, places, reviews)
- [x] Responsive design

### Realtime Collaboration
- [x] Presence tracking (who's online)
- [x] Postgres changes subscription
- [x] Optimistic UI updates
- [ ] Advanced: CRDT/OT (not in MVP)

## Core Domain Concepts

### Trips
- Acts like a collaborative document
- Has owner and editors
- Visibility: public, unlisted, or private
- Contains days with schedule items

### Places
- Shared master table
- Cached from Kakao API
- Unique by (provider, provider_place_id)
- Referenced by all schedule items

### Reviews
- Unified system for trips AND places
- Respects trip visibility
- One review per user per target

### Collaboration
- Real-time presence
- Link-based invitations
- Role-based access (owner/editor)

## Security Model

All access is controlled through PostgreSQL RLS:

- **Public trips**: Anyone can view, only members can edit
- **Unlisted trips**: Only members can view
- **Private trips**: Only members can view
- **Editing**: Only owner/editor roles
- **Deletion**: Only owners

Helper functions enforce permissions:
- `can_view_trip(trip_id)`
- `can_edit_trip(trip_id)`
- `is_trip_owner(trip_id)`
- `is_trip_member(trip_id)`

## API Documentation

See individual README files:
- Database: `supabase/README.md`
- Edge Functions: `supabase/functions/README.md`

## Development Workflow

```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Frontend (Vercel/Netlify)

```bash
# Build
cd frontend
npm run build

# Output in frontend/dist/
# Deploy dist/ folder to your hosting provider
```

### Backend (Supabase)

Already deployed! Your Supabase project is live at:
```
https://luahhgcbrlkfbbawcult.supabase.co
```

## Environment Variables Reference

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Edge Functions (supabase/functions/.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KAKAO_REST_API_KEY=your-kakao-key
OPENAI_API_KEY=your-openai-key  # OR
ANTHROPIC_API_KEY=your-anthropic-key
```

## Troubleshooting

### Database issues
```bash
# Reset database (⚠️ destroys data)
supabase db reset

# Check migrations
supabase migration list
```

### Edge Functions not working
```bash
# Check function logs
supabase functions logs search-place

# Test locally
supabase functions serve
```

### Frontend build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

Private project for educational purposes.

---

**Built with ❤️ using Supabase, React, and TypeScript**
