# Trip Planner - Collaborative Travel Planning Application

A production-grade collaborative travel planning application built with React and Supabase.

## Project Vision

Trip Planner is "Google Docs + Figma + Map + Travel Itinerary" - a real-time collaborative travel planning platform where:
- Multiple users can edit the same trip simultaneously
- Finished trips become discoverable, shareable assets
- Trips and places can receive reviews from the community
- AI assists with search, not as a chatbot

## Tech Stack

### Frontend
- **React 19** + **Vite**
- **React Router** for navigation
- **Bootstrap 5** + **React-Bootstrap** for UI
- **Kakao Map API** for maps

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
│   │   ├── api/            # API layer
│   │   ├── components/     # React components
│   │   ├── features/       # Feature modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS styles
│   │   └── ui-preview/     # UI component preview
│   └── package.json
│
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge Functions
│   │   ├── search-place/   # Kakao API integration
│   │   ├── process-image/  # Image upload
│   │   ├── create-review/  # Review creation
│   │   ├── ai-suggest-query/ # AI query normalization
│   │   └── accept-invite-link/ # Invitation system
│   └── migrations/         # Database schema
│
├── .claude/                # Project documentation
│   ├── CLAUDE.md          # AI instructions
│   ├── WBS.md             # Work breakdown structure
│   └── CHECKLIST.md       # Progress tracking
│
└── README.md              # This file
```

## Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| EPIC 0: 기획/설계 | ✅ 완료 | 100% |
| EPIC 1: UI/UX (Figma) | ✅ 완료 | 100% |
| EPIC 2: DB/Supabase | ✅ 완료 | 100% |
| EPIC 3: 인프라/세팅 | 🔄 진행중 | 33% |
| EPIC 4: MVP 읽기 | ⏳ 대기 | 0% |
| EPIC 5: MVP 편집 | ⏳ 대기 | 0% |
| EPIC 6: MVP 협업 | ⏳ 대기 | 0% |
| EPIC 7: Social | ⏳ 대기 | 0% |
| EPIC 8: 고도화 | ⏳ 대기 | 0% |
| **총 진행률** | | **41%** |

> 상세 체크리스트: [.claude/CHECKLIST.md](.claude/CHECKLIST.md)

## Completed Features

### Phase 1: Planning & Design ✅
- [x] 요구사항 문서 정리
- [x] 공개/private/unlisted 정책 확정
- [x] Owner/Editor 권한 모델 정의
- [x] 좋아요 vs 찜 정책 문서화
- [x] 모든 페이지 와이어프레임 (Figma)
- [x] UX 정의 (Day 관리, 일정 편집, 지도 연동 등)

### Phase 2: Database ✅
- [x] Complete PostgreSQL schema (15+ tables)
- [x] Row Level Security (RLS) policies
- [x] Helper functions (`can_view_trip`, `can_edit_trip`, `is_trip_owner`, etc.)
- [x] Automatic triggers (updated_at, updated_by, owner creation)
- [x] Seed data (themes, regions)

### Phase 3: Edge Functions ✅
- [x] `search-place` - Kakao API integration + place caching
- [x] `process-image` - Image upload with validation
- [x] `create-review` - Review creation with permissions
- [x] `ai-suggest-query` - AI-powered search suggestions
- [x] `accept-invite-link` - Invitation system

### Phase 4: Infrastructure (In Progress)
- [x] Vite + React project setup
- [x] Bootstrap 5 UI system
- [ ] Supabase client connection
- [ ] Auth login flow
- [ ] Map SDK setup (Kakao Map API)
- [ ] Vercel deployment pipeline

## Next Steps

1. **T-3003** Supabase client 연결 (`@supabase/supabase-js` 설치)
2. **T-3004** Auth 로그인 플로우 연결
3. **T-3005** Map SDK 세팅 (Kakao Map API)
4. **T-3006** Vercel 배포 파이프라인 연결
5. **EPIC 4** 읽기 전용 MVP 구현 시작

## Setup Instructions

### 1. Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Supabase CLI
npm install -g supabase
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
# Frontend: frontend/.env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions: supabase/functions/.env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KAKAO_REST_API_KEY=your-kakao-key
```

### 4. Run the Application

```bash
cd frontend
npm run dev

# Application will open at http://localhost:5173
```

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

## Documentation

- [WBS (Work Breakdown Structure)](WBS.md)
- [Checklist (진행 현황)](CHECKLIST.md)
- [Database](supabase/README.md)
- [Edge Functions](supabase/functions/README.md)
- [API](supabase/API.md)

## Development Workflow

```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Linting
npm run lint
```

## License

Private project for educational purposes.

---

**Built with Supabase, React, and Bootstrap**
