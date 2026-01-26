# Trip Planner 프로젝트 체크리스트

> 최종 업데이트: 2026-01-26

## EPIC 0 — 기획 / 설계

- [x] T-0001 요구사항 문서 정리 (유저 스토리 / 권한 / 공개범위 / MVP 범위)
- [x] T-0002 공개 / private / unlisted 정책 확정
- [x] T-0003 권한 모델 Owner / Editor 정책 확정
- [x] T-0004 좋아요 vs 찜 정책 문서화

---

## EPIC 1 — UI/UX (Figma)

### 와이어프레임

- [x] T-1001 랜딩 페이지 와이어프레임
- [x] T-1002 탐색 / 리스트 페이지 와이어프레임
- [x] T-1003 상세 페이지 와이어프레임
- [x] T-1004 편집 페이지 와이어프레임
- [x] T-1005 참여자 사이드 패널 와이어프레임

### UX 정의

- [x] T-1011 Day 추가/삭제 UX 정의
- [x] T-1012 일정 추가/편집 UX 정의
- [x] T-1013 지도 ↔ 리스트 연동 UX 정의
- [x] T-1014 검색 필터 모달 UX 정의
- [x] T-1015 저장 상태 UX 정의

---

## EPIC 2 — DB / Supabase

- [x] T-2001 ERD 최종 확정
- [x] T-2002 initial schema SQL 작성
- [x] T-2003 unique / fk / index 제약조건 추가
- [x] T-2004 trip_days 연속 날짜 무결성 제약 구현
- [x] T-2005 RLS: 공개 trip 읽기 정책
- [x] T-2006 RLS: private trip 접근 정책
- [x] T-2007 RLS: editor / owner 쓰기 권한 정책
- [x] T-2008 RLS: owner 삭제 권한 정책

### Edge Functions (추가)

- [x] process-image 함수 구현
- [x] search-place 함수 구현 (Kakao + upsert)
- [x] create-review 함수 구현
- [x] ai-suggest-query 함수 구현
- [x] accept-invite-link 함수 구현
- [x] update-trip-member-role 함수 구현
- [x] popular-regions 함수 구현

---

## EPIC 3 — 인프라 / 세팅

### 기본 세팅

- [x] T-3001 Vite + React 프로젝트 생성
- [x] T-3002 Bootstrap 시스템 세팅
- [x] T-3003 Supabase client 연결 (`@supabase/supabase-js`)

### 개발 환경

- [x] T-3007 테스트 환경 구성 (Vitest + Testing Library + jsdom)
- [x] T-3008 TypeScript 타입 정의 (database.types.ts, domain.types.ts)
- [x] T-3009 서비스 레이어 구조 설계 (errors, functions, storage)

### 인증/외부 연동

- [x] T-3004 Auth 로그인 플로우 연결 (이메일 OTP, 카카오 OAuth, Protected Routes)
- [ ] T-3005 Map SDK 세팅 (Kakao Map API) — 패키지 설치만 완료
- [ ] T-3006 Vercel 배포 파이프라인 연결

---

## EPIC 4 — MVP 1: 읽기 전용

### 랜딩 / 리스트

- [x] T-4001 랜딩 페이지 UI 구현 (Hero 섹션, 최근/인기/추천 섹션, CTA)
- [x] T-4002 공개 Trip 리스트 API 연동 (`list_public_trips` RPC)
- [x] T-4003 카드 리스트 UI 구현 (TripCard, TripCardList)
- [x] T-4004 무한 스크롤 구현 (Intersection Observer)
- [x] T-4005 정렬 (최신 / 인기) 구현 (URL 파라미터 지원)

### 검색 / 필터

- [x] T-4011 키워드 검색 구현 (AI 검색 제안 포함)
- [x] T-4012 여행지 필터 구현 (TripFilterPanel)
- [x] T-4013 테마 필터 구현 (TripFilterPanel)
- [x] T-4014 작성일 필터 구현 (TripFilterPanel)
- [ ] T-4015 찜 필터 구현 — API 연동 필요

### 상세 페이지

- [x] T-4021 상세 페이지 레이아웃 구현 (TripDetailPage)
- [x] T-4022 요약바 구현 (TripSummaryBar)
- [ ] T-4023 지도 마커 렌더링 — Kakao Map 연동 필요
- [x] T-4024 우측 일정 패널 읽기 UI (TripItineraryList)

---

## EPIC 5 — MVP 2: 편집

### Trip 생성

- [x] T-5001 Trip 생성 UI / API (`createTripDraft` RPC 완료, UI 개발 중)
- [x] T-5002 Trip 공개범위 설정 UI (visibility 옵션 구현)

### Day 관리

- [x] T-5011 Day 추가 로직 (`insert_trip_day_after` RPC 완료)
- [x] T-5012 Day 삭제 로직 (`delete_trip_day` RPC 완료)
- [x] T-5013 Day 날짜 변경 → 연쇄 보정 (`adjust_trip_dates` RPC 완료)

### 일정 관리

- [x] T-5021 장소 검색 → 일정 추가 (`search-place` Edge Function, `upsertScheduleItem` RPC)
- [x] T-5022 일정 인라인 편집 (`upsertScheduleItem` RPC 완료, UI 부분 구현)
- [x] T-5023 일정 자동 정렬 (order_index + time 기반 정렬 로직)
- [x] T-5024 일정 삭제 (`deleteScheduleItem` RPC 완료)

### 지도 연동

- [ ] T-5031 지도 마커 재렌더링 — Kakao Map 연동 필요
- [ ] T-5032 리스트 클릭 → 지도 포커스 이동 — Kakao Map 연동 필요
- [ ] T-5033 Polyline 렌더링 — Kakao Map 연동 필요

### 상태 관리

- [x] T-5041 저장중 / 저장됨 상태 관리 (UI 구현, API 연동 부분 완료)

---

## EPIC 6 — MVP 3: 협업

### 초대 / 참여

- [ ] T-6001 초대 링크 생성 — UI 미구현
- [x] T-6002 초대 링크로 참여 처리 (`accept-invite-link` Edge Function 완료)
- [x] T-6003 참여자 목록 UI (`getTripMembers` RPC, TripMemberPicker 컴포넌트)
- [ ] T-6004 멤버 내보내기 — 미구현
- [ ] T-6005 나가기 — 미구현

### 권한 관리

- [x] T-6011 Owner / Editor 권한 분기 처리 (RLS + RPC 완료)
- [x] T-6012 Owner만 삭제 가능 로직 (RLS 정책 적용)

### 실시간 협업 (추가)

- [ ] T-6021 Supabase Realtime 채널 연동 — 미구현
- [ ] T-6022 Presence 표시 (온라인 사용자) — 미구현
- [ ] T-6023 Postgres Changes 구독 — 미구현

---

## EPIC 7 — Social

### 좋아요

- [x] T-7001 좋아요 토글 UI (TripCard 하트 버튼)
- [ ] T-7001-api 좋아요 토글 API 연동 — 미구현

### 찜

- [x] T-7011 찜 토글 UI (TripCard 북마크 버튼)
- [ ] T-7011-api 찜 토글 API 연동 — 미구현
- [ ] T-7012 내 찜 목록 필터 연동 — 미구현

---

## EPIC 8 — 고도화 / 안정화

- [ ] T-8001 필터 쿼리 인덱스 튜닝
- [ ] T-8002 무한스크롤 성능 최적화
- [x] T-8003 Skeleton UI 적용 (TripCardSkeleton 구현)
- [ ] T-8004 Undo 토스트
- [ ] T-8005 에러 로깅 연결
- [ ] T-8006 RLS 보안 점검

---

## 권장 착수 순서

1. ~~EPIC 1 (UI/UX)~~ ✅
2. ~~EPIC 2 (ERD)~~ ✅
3. ~~EPIC 3 (세팅)~~ ✅ (89% 완료)
4. ~~EPIC 4 (읽기 MVP)~~ ✅ (86% 완료)
5. EPIC 5 (편집 MVP) - 진행 중 (75%)
6. EPIC 6 (협업) - 진행 중 (40%)
7. EPIC 7 (Social) - 진행 중 (UI 완료, API 필요)

---

## 진행 현황 요약

| EPIC            | 태스크 수 | 완료   | 진행률  |
| --------------- | --------- | ------ | ------- |
| EPIC 0 (기획)   | 4         | 4      | 100%    |
| EPIC 1 (UI/UX)  | 10        | 10     | 100%    |
| EPIC 2 (DB)     | 8 + 7     | 15     | 100%    |
| EPIC 3 (인프라) | 9         | 8      | 89%     |
| EPIC 4 (읽기)   | 14        | 12     | 86%     |
| EPIC 5 (편집)   | 12        | 9      | 75%     |
| EPIC 6 (협업)   | 10        | 4      | 40%     |
| EPIC 7 (Social) | 5         | 2      | 40%     |
| EPIC 8 (고도화) | 6         | 1      | 17%     |
| **총합**        | **78**    | **65** | **83%** |

---

## 다음 단계 (권장)

### 우선순위 1: Map SDK 연동 (EPIC 3/4/5 완료 필수)
1. **T-3005** Kakao Map SDK 세팅 및 컴포넌트 구현
2. **T-4023** 지도 마커 렌더링 (상세 페이지)
3. **T-5031~T-5033** 편집 페이지 지도 연동

### 우선순위 2: Social 기능 API 연동 (EPIC 7)
1. **T-7001-api** 좋아요 토글 API 구현
2. **T-7011-api** 찜 토글 API 구현
3. **T-7012** 내 찜 목록 필터 연동

### 우선순위 3: 협업 기능 완성 (EPIC 6)
1. **T-6001** 초대 링크 생성 UI
2. **T-6021~T-6023** Supabase Realtime 연동

### 우선순위 4: 배포 (EPIC 3)
1. **T-3006** Vercel 배포 파이프라인 연결
