# Getting Started with Trip Planner

## Project Status

### Completed

- ✅ Phase 1: Database schema with RLS
- ✅ Phase 2: Edge Functions (5 functions)
- ✅ Phase 3: Frontend 프로젝트 초기 설정
- ✅ UI Preview 페이지

### In Progress

- 🚧 Frontend 핵심 기능 개발

---

## Quick Start

### 1. Prerequisites

- Node.js >= 18.0.0
- npm
- Supabase CLI
- Kakao Developers 계정 (Map & Local API용)

### 2. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd project1

# Install frontend dependencies
cd frontend
npm install
```

### 3. Environment Setup

**Frontend** (`frontend/.env`):

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_KAKAO_MAP_API_KEY=your-kakao-javascript-key
```

**Edge Functions** (`supabase/functions/.env`):

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KAKAO_REST_API_KEY=your-kakao-rest-api-key
```

**Optional (AI features)**:

```bash
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key
```

### 4. Database Setup

```bash
# Apply migrations
supabase db push
```

This creates all tables, policies, functions, and seed data.

### 5. Deploy Edge Functions

```bash
cd supabase/functions

# Deploy all functions
supabase functions deploy search-place
supabase functions deploy process-image
supabase functions deploy create-review
supabase functions deploy ai-suggest-query
supabase functions deploy accept-invite-link
```

### 6. Create Storage Bucket

Via Supabase Dashboard:

1. Go to **Storage**
2. Create bucket named `images`
3. Make it **public**

### 7. Run Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:5173

---

## Project Structure

```
project1/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── api/             # API 통신 레이어
│   │   ├── components/      # 공통 컴포넌트
│   │   ├── features/        # 기능별 모듈
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── styles/          # 스타일 파일
│   │   ├── ui-preview/      # UI 프리뷰 컴포넌트
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── supabase/
│   ├── functions/           # Edge Functions
│   └── migrations/          # Database migrations
│
└── docs/
```

---

## Tech Stack

### Frontend

- **React 19** + **Vite** + **JavaScript (ES6+)**
- **React Bootstrap** - UI 컴포넌트
- **React Router DOM** - 클라이언트 라우팅
- **Kakao Map API** - 지도 서비스

### Backend (Supabase)

- **PostgreSQL** with RLS
- **Supabase Auth** - 인증
- **Supabase Realtime** - 실시간 협업
- **Supabase Storage** - 이미지 저장
- **Edge Functions** (Deno)

### External APIs

- **Kakao Map API** - 지도 렌더링
- **Kakao Local API** - 장소 검색
- **OpenAI/Claude** - AI 검색 보조 (선택)

---

## Development Commands

```bash
# Frontend
cd frontend
npm run dev          # 개발 서버 시작 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 프로덕션 빌드 프리뷰
npm run lint         # ESLint 실행

# Database
supabase db push     # 마이그레이션 적용
supabase db reset    # 데이터베이스 리셋 (⚠️ 데이터 삭제됨)

# Edge Functions
supabase functions serve              # 로컬 실행
supabase functions logs search-place  # 로그 확인
supabase secrets list                 # 시크릿 목록
```

---

## Kakao API Setup

### 1. Kakao Developers 등록

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. **JavaScript 키** 복사 → `VITE_KAKAO_MAP_API_KEY`
4. **REST API 키** 복사 → `KAKAO_REST_API_KEY`

### 2. 플랫폼 등록

1. **내 애플리케이션** > **플랫폼**
2. **Web 플랫폼 등록**
3. 사이트 도메인 추가:
   - `http://localhost:5173` (개발용)
   - 프로덕션 도메인

### 3. API 활성화

1. **내 애플리케이션** > **제품 설정**
2. **지도/로컬** 활성화

---

## Key Features

### Real-time Collaboration

- Supabase Realtime 기반
- Presence로 온라인 사용자 표시
- Optimistic UI 업데이트

### Row Level Security

- 모든 데이터 접근은 Postgres RLS로 제어
- Helper functions: `is_trip_member()`, `can_edit_trip()`, `is_trip_owner()`

### Place Caching

- Kakao API 검색 결과 DB에 캐싱
- 중복 API 호출 방지

### Review System

- Trip과 Place 통합 리뷰 시스템
- 별점 (1-5) + 텍스트 + 사진

---

## Planned Features (MVP)

- [ ] 회원가입 / 로그인
- [ ] 홈페이지 (공개 여행 목록)
- [ ] 여행 상세 보기
- [ ] 여행 생성 / 편집
- [ ] 실시간 협업 편집
- [ ] 장소 검색 (Kakao)
- [ ] 지도 연동 (Kakao Map)
- [ ] 리뷰 작성
- [ ] 좋아요 / 북마크
- [ ] 초대 링크

---

## Troubleshooting

### "Failed to load trips"

- 데이터베이스 마이그레이션 적용 확인
- `.env` 파일의 Supabase URL/Key 확인
- 브라우저 콘솔 에러 확인

### "Missing authorization header"

- 로그인 상태 확인
- 세션 유효성 확인
- 로그아웃 후 재로그인

### "Kakao Map not loading"

- `VITE_KAKAO_MAP_API_KEY` 설정 확인
- Kakao Developers 플랫폼에 도메인 등록 확인
- 브라우저 콘솔에서 API 에러 확인

### "Search place not working"

- Edge Function 배포 확인
- `KAKAO_REST_API_KEY` 설정 확인
- 함수 로그 확인: `supabase functions logs search-place`

### Build errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Bootstrap Documentation](https://react-bootstrap.github.io/)
- [Kakao Map API Documentation](https://apis.map.kakao.com/web/documentation/)
- [Kakao Local API Documentation](https://developers.kakao.com/docs/latest/ko/local/dev-guide)

---

## Related Documentation

- [TECH_STACK.md](./TECH_STACK.md) - 기술 스택 상세
- [SECURITY.md](./SECURITY.md) - 보안 정책
- [SUPABASE_SETUP_COMPLETE.md](./supabase/SUPABASE_SETUP_COMPLETE.md) - Supabase 설정 가이드
