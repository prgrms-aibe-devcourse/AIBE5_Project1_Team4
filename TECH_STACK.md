# Trip Planner - Tech Stack Documentation

## Overview

Trip Planner는 협업 기반의 여행 계획 서비스로, 실시간 편집 및 소셜 기능을 제공하는 풀스택 웹 애플리케이션입니다.

---

## Frontend

### Core Framework
- **React 19.2.0**
  - 최신 React 버전 사용
  - Hooks 기반 함수형 컴포넌트
  - 선언적 UI 구축

### Build Tool
- **Vite 7.2.4**
  - 빠른 개발 서버
  - HMR (Hot Module Replacement)
  - 최적화된 프로덕션 빌드

- **@vitejs/plugin-react-swc 4.2.2**
  - SWC 기반 빠른 컴파일
  - Babel 대비 빌드 속도 향상

### Language
- **JavaScript (ES6+)**
  - 최신 ECMAScript 문법
  - 모듈 시스템 (ESM)
  - 빠른 개발 속도

### Routing
- **React Router DOM 7.12.0**
  - 클라이언트 사이드 라우팅
  - 중첩 라우팅 지원
  - 동적 경로 매칭

### UI Framework
- **Bootstrap 5.3.8**
  - 반응형 그리드 시스템
  - 풍부한 UI 컴포넌트
  - 유틸리티 클래스 기반 스타일링

- **React Bootstrap 2.10.10**
  - Bootstrap의 React 컴포넌트 래퍼
  - JSX 친화적 API
  - 완전한 Bootstrap 기능 지원

### Map Integration
- **Kakao Map API**
  - 한국 지도 서비스
  - 장소 검색 연동
  - 마커, 폴리라인 등 지원
  - 사용자 친화적 한국어 지원

### Utilities (추후 추가 예정)
- **date-fns**
  - 날짜 포맷팅 및 조작
  - 경량화된 라이브러리
  - 트리 셰이킹 지원

- **@supabase/supabase-js**
  - Supabase 클라이언트 라이브러리
  - 실시간 구독 지원

### Code Quality
- **ESLint 9.39.1**
  - 코드 품질 검사
  - 일관된 코딩 스타일
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh

---

## Backend (Supabase)

### Database
- **PostgreSQL**
  - 관계형 데이터베이스
  - ACID 트랜잭션 보장
  - 복잡한 쿼리 지원
  - RLS (Row Level Security) 정책

### Authentication
- **Supabase Auth**
  - 이메일/소셜 로그인
  - JWT 기반 인증
  - 사용자 세션 관리
  - profiles 테이블과 1:1 연동

### Storage
- **Supabase Storage**
  - 객체 스토리지 (S3 호환)
  - 이미지 업로드 및 관리
  - Public bucket 설정
  - CDN 지원

### Realtime
- **Supabase Realtime**
  - Postgres Changes 구독
  - Presence (온라인 사용자 추적)
  - 실시간 협업 기능
  - WebSocket 기반 통신

### Edge Functions
- **Deno Runtime**
  - TypeScript/JavaScript 지원
  - 보안 샌드박스 환경
  - 빠른 콜드 스타트

#### Implemented Functions:
1. **search-place**
   - Kakao Local API 연동
   - 장소 검색 및 캐싱

2. **process-image**
   - 이미지 업로드 처리
   - 커버 이미지 업데이트

3. **create-review**
   - 리뷰 생성 및 검증
   - 권한 체크

4. **ai-suggest-query**
   - AI 검색어 제안
   - 쿼리 정규화

5. **accept-invite-link**
   - 초대 링크 처리
   - 멤버십 생성

### Client SDK (추후 추가 예정)
- **@supabase/supabase-js**
  - Supabase 클라이언트 라이브러리
  - 실시간 구독 지원

---

## External APIs

### Map & Location
- **Kakao Map API**
  - 한국 지도 렌더링
  - 마커 및 인포윈도우
  - 지도 컨트롤

- **Kakao Local Search API**
  - 한국 내 장소 검색
  - 상세 정보 조회
  - 카테고리 필터링

### AI Integration
- **LLM API** (OpenAI/Claude)
  - 검색어 제안 및 정규화
  - 자연어 처리
  - 검색 품질 개선

---

## Database Schema

### Core Tables
- **profiles** - 사용자 프로필
- **trips** - 여행 계획 문서
- **trip_members** - 협업 멤버 관리
- **trip_days** - 날짜별 페이지
- **schedule_items** - 일정 항목
- **places** - 장소 마스터 데이터

### Social Features
- **trip_likes** - 여행 좋아요
- **trip_bookmarks** - 북마크
- **reviews** - 리뷰 (Trip/Place)

### System Tables
- **trip_invite_links** - 초대 링크
- **ai_query_suggestions** - AI 쿼리 로그
- **rate_limits** - API 제한

### Taxonomy
- **themes**, **trip_themes** - 테마 분류
- **regions**, **trip_regions** - 지역 분류

---

## Security

### Authentication & Authorization
- Supabase Auth (JWT)
- Row Level Security (RLS) 정책
- Helper functions:
  - `is_trip_member(trip_id)`
  - `can_edit_trip(trip_id)`
  - `is_trip_owner(trip_id)`

### Access Control
- **Public trips**: 전체 읽기 가능
- **Unlisted/Private**: 멤버만 접근
- **Edit**: owner/editor만 가능
- **Delete**: owner만 가능

---

## Development Tools

### Package Management
- **npm** - Node.js 패키지 관리

### Version Control
- **Git** - 소스 코드 버전 관리

### Local Development
- **Supabase CLI**
  - 로컬 개발 환경
  - 마이그레이션 관리
  - Edge Functions 테스트

---

## Deployment

### Hosting
- **Supabase Cloud** (Production)
  - Database, Auth, Storage, Realtime
  - Global CDN
  - 자동 백업

### Frontend Hosting Options
- Vercel / Netlify / Cloudflare Pages (권장)
- Static site deployment
- Automatic HTTPS

---

## Architecture Principles

### Collaboration First
- 실시간 편집 지원
- Presence 기반 사용자 표시
- Optimistic UI 업데이트

### Document-Centric
- Trip은 문서로 취급
- 연속된 날짜의 Day 페이지
- 시간 기반 정렬

### Data Consistency
- RLS로 모든 접근 제어
- DB 레벨 제약 조건
- Trigger 기반 자동 업데이트

### Performance
- Realtime 구독 최적화
- 장소 데이터 캐싱
- 이미지 CDN 활용

---

## Production Stack Summary

```
Frontend:  React 19 + Vite + JavaScript + React Bootstrap
Backend:   Supabase (Postgres + Auth + Storage + Realtime)
Runtime:   Deno (Edge Functions)
Map:       Kakao Map API
Search:    Kakao Local API
AI:        OpenAI/Claude (검색 보조)
```

---

## Version Information

| Package | Version |
|---------|---------|
| Node.js | >= 18.0.0 (권장) |
| React | 19.2.0 |
| React DOM | 19.2.0 |
| React Router DOM | 7.12.0 |
| Vite | 7.2.4 |
| Bootstrap | 5.3.8 |
| React Bootstrap | 2.10.10 |
| ESLint | 9.39.1 |
| Supabase | Latest |
| Deno | Latest (Edge Functions) |

---

## Related Documentation

- [README.md](./README.md) - Project overview
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [SECURITY.md](./SECURITY.md) - Security policies
- [SUPABASE_SETUP_COMPLETE.md](./SUPABASE_SETUP_COMPLETE.md) - Supabase configuration
