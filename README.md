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
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── lib/              # 외부 라이브러리 설정 (supabaseClient)
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── services/         # 서비스 레이어
│   │   │   ├── _core/        # 공통 유틸 (errors, functions, storage)
│   │   │   └── auth.service.js
│   │   ├── types/            # TypeScript 타입 정의
│   │   │   ├── database.types.ts   # Supabase 스키마 타입
│   │   │   └── domain.types.ts     # 도메인/쿼리 결과 타입
│   │   ├── ui-preview/       # UI 컴포넌트 프리뷰
│   │   └── setupTests.js     # 테스트 환경 설정
│   └── package.json
│
├── supabase/                 # Supabase configuration
│   ├── functions/            # Edge Functions
│   │   ├── search-place/     # Kakao API integration
│   │   ├── process-image/    # Image upload
│   │   ├── create-review/    # Review creation
│   │   ├── ai-suggest-query/ # AI query normalization
│   │   └── accept-invite-link/ # Invitation system
│   └── migrations/           # Database schema
│
├── WBS.md                    # Work breakdown structure
├── CHECKLIST.md              # Progress tracking
└── README.md                 # This file
```

> 상세 구조: [frontend/README.md](frontend/README.md#프로젝트-구조)

## Progress Overview

| Phase                 | Status    | Progress |
| --------------------- | --------- | -------- |
| EPIC 0: 기획/설계     | ✅ 완료   | 100%     |
| EPIC 1: UI/UX (Figma) | ✅ 완료   | 100%     |
| EPIC 2: DB/Supabase   | ✅ 완료   | 100%     |
| EPIC 3: 인프라/세팅   | 🔄 진행중 | 67%      |
| EPIC 4: MVP 읽기      | ⏳ 대기   | 0%       |
| EPIC 5: MVP 편집      | ⏳ 대기   | 0%       |
| EPIC 6: MVP 협업      | ⏳ 대기   | 0%       |
| EPIC 7: Social        | ⏳ 대기   | 0%       |
| EPIC 8: 고도화        | ⏳ 대기   | 0%       |
| **총 진행률**         |           | **45%**  |

> 상세 체크리스트: [CHECKLIST.md](CHECKLIST.md)

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

### Phase 4: Infrastructure (In Progress - 67%)

- [x] Vite + React project setup
- [x] Bootstrap 5 UI system
- [x] Supabase client connection
- [x] Test environment (Vitest + Testing Library)
- [x] TypeScript type definitions
- [x] Service layer architecture
- [ ] Auth login flow
- [ ] Map SDK setup (Kakao Map API)
- [ ] Vercel deployment pipeline

## Next Steps

1. **T-3004** Auth 로그인 플로우 완료
2. **T-3005** Map SDK 세팅 (Kakao Map API)
3. **T-3006** Vercel 배포 파이프라인 연결
4. **EPIC 4** 읽기 전용 MVP 구현 시작

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

# Testing
npm run test        # watch 모드
npm run test:run    # 단일 실행
npm run test:ui     # UI 모드
```

### 테스트

| 도구            | 용도               |
| --------------- | ------------------ |
| Vitest          | 테스트 러너        |
| Testing Library | 컴포넌트/훅 테스트 |
| jsdom           | DOM 환경           |

> 상세 가이드: [frontend/README.md#테스트](frontend/README.md#테스트)

## Team Convention

### Branch Naming

| 접두사     | 용도                      | 예시                        |
| ---------- | ------------------------- | --------------------------- |
| `feature/` | 새로운 기능 개발          | `feature/#12-login-page`    |
| `fix/`     | 버그 수정                 | `fix/#15-auth-redirect`     |
| `hotfix/`  | 긴급 버그 수정 (프로덕션) | `hotfix/#20-critical-crash` |

```bash
# 브랜치 생성 예시
git checkout -b feature/#12-trip-create
git checkout -b fix/#15-map-loading-error
```

### Commit Message

| 타입         | 용도                  | 예시                                      |
| ------------ | --------------------- | ----------------------------------------- |
| `[Feat]`     | 새로운 기능 추가      | `[Feat] #12 - 여행 생성 폼 추가`          |
| `[Fix]`      | 버그 수정             | `[Fix] #15 - 로그인 리다이렉트 오류 수정` |
| `[Chore]`    | 빌드, 설정, 의존성 등 | `[Chore] #18 - eslint 설정 업데이트`      |
| `[Refactor]` | 코드 리팩토링         | `[Refactor] #20 - useAuth 훅 분리`        |
| `[Docs]`     | 문서 수정             | `[Docs] #22 - README 업데이트`            |
| `[Style]`    | 코드 포맷팅           | `[Style] #25 - 들여쓰기 수정`             |
| `[Test]`     | 테스트 코드           | `[Test] #28 - 로그인 테스트 추가`         |

```bash
# 커밋 메시지 예시
git commit -m "[Feat] #12 - 여행 상세 페이지 구현"
git commit -m "[Fix] #15 - 지도 마커 클릭 이벤트 수정"
git commit -m "[Chore] #18 - React Bootstrap 버전 업그레이드"
```

### File/Folder Naming

```
컴포넌트:     PascalCase.jsx     (예: TripCard.jsx, LoginForm.jsx)
훅:          camelCase.js       (예: useAuth.js, useTrip.js)
유틸리티:     camelCase.js       (예: formatDate.js, validators.js)
스타일:       kebab-case.css     (예: trip-card.css)
상수:         SCREAMING_SNAKE    (예: API_ENDPOINTS, MAX_FILE_SIZE)
```

### Component Structure

```jsx
// 1. imports (외부 → 내부 순서)
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

// 2. 컴포넌트 정의
export default function MyComponent({ prop1, prop2 }) {
  // 3. hooks
  const [state, setState] = useState(null);
  const { user } = useAuth();

  // 4. effects
  useEffect(() => {
    // ...
  }, []);

  // 5. handlers
  const handleClick = () => {
    // ...
  };

  // 6. render
  return <div>{/* ... */}</div>;
}
```

> 상세 컨벤션: [frontend/README.md](frontend/README.md#컨벤션)

### Issue Template

```markdown
## 📝 무엇을 하나요?

- 할 일을 간단히 설명해주세요

## 📌 To do

- [ ] 할 작업들 리스트업
```

### PR Template

```markdown
## 🔎 What

- 한 작업을 간단히 설명해주세요

## 🔗 Issue

- Closes: #이슈번호

## ✅ 체크리스트

- [ ] 브랜치 base가 적절한가요?
- [ ] 제목이 이슈 제목과 동일한가요?
- [ ] 최소 1명의 리뷰를 받았나요?
```

## License

Private project for educational purposes.

---

**Built with Supabase, React, and Bootstrap**
