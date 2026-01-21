# Trip Planner 프로젝트 체크리스트

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

- [ ] T-3004 Auth 로그인 플로우 연결 (UI, 라우팅 가드)
- [ ] T-3005 Map SDK 세팅 (Kakao Map API)
- [ ] T-3006 Vercel 배포 파이프라인 연결

---

## EPIC 4 — MVP 1: 읽기 전용

### 랜딩 / 리스트

- [ ] T-4001 랜딩 페이지 UI 구현
- [ ] T-4002 공개 Trip 리스트 API 연동
- [ ] T-4003 카드 리스트 UI 구현
- [ ] T-4004 무한 스크롤 구현
- [ ] T-4005 정렬 (최신 / 인기) 구현

### 검색 / 필터

- [ ] T-4011 키워드 검색 구현
- [ ] T-4012 여행지 필터 구현
- [ ] T-4013 테마 필터 구현
- [ ] T-4014 작성일 필터 구현
- [ ] T-4015 찜 필터 구현

### 상세 페이지

- [ ] T-4021 상세 페이지 레이아웃 구현
- [ ] T-4022 요약바 구현
- [ ] T-4023 지도 마커 렌더링
- [ ] T-4024 우측 일정 패널 읽기 UI

---

## EPIC 5 — MVP 2: 편집

### Trip 생성

- [ ] T-5001 Trip 생성 UI / API
- [ ] T-5002 Trip 공개범위 설정 UI

### Day 관리

- [ ] T-5011 Day 추가 로직
- [ ] T-5012 Day 삭제 로직
- [ ] T-5013 Day 날짜 변경 → 연쇄 보정

### 일정 관리

- [ ] T-5021 장소 검색 → 일정 추가
- [ ] T-5022 일정 인라인 편집
- [ ] T-5023 일정 자동 정렬
- [ ] T-5024 일정 삭제

### 지도 연동

- [ ] T-5031 지도 마커 재렌더링
- [ ] T-5032 리스트 클릭 → 지도 포커스 이동
- [ ] T-5033 Polyline 렌더링

### 상태 관리

- [ ] T-5041 저장중 / 저장됨 상태 관리

---

## EPIC 6 — MVP 3: 협업

### 초대 / 참여

- [ ] T-6001 초대 링크 생성
- [ ] T-6002 초대 링크로 참여 처리
- [ ] T-6003 참여자 목록 UI
- [ ] T-6004 멤버 내보내기
- [ ] T-6005 나가기

### 권한 관리

- [ ] T-6011 Owner / Editor 권한 분기 처리
- [ ] T-6012 Owner만 삭제 가능 로직

---

## EPIC 7 — Social

### 좋아요

- [ ] T-7001 좋아요 토글 API
- [ ] T-7002 좋아요 카운트 반영

### 찜

- [ ] T-7011 찜 토글 API
- [ ] T-7012 내 찜 목록 필터 연동

---

## EPIC 8 — 고도화 / 안정화

- [ ] T-8001 필터 쿼리 인덱스 튜닝
- [ ] T-8002 무한스크롤 성능 최적화
- [ ] T-8003 Skeleton UI 적용
- [ ] T-8004 Undo 토스트
- [ ] T-8005 에러 로깅 연결
- [ ] T-8006 RLS 보안 점검

---

## 권장 착수 순서

1. ~~EPIC 1 (UI/UX)~~ ✅
2. ~~EPIC 2 (ERD)~~ ✅
3. EPIC 3 (세팅) - 진행 중 (67%)
4. EPIC 4 (읽기 MVP)

---

## 진행 현황 요약

| EPIC            | 태스크 수 | 완료   | 진행률  |
| --------------- | --------- | ------ | ------- |
| EPIC 0 (기획)   | 4         | 4      | 100%    |
| EPIC 1 (UI/UX)  | 10        | 10     | 100%    |
| EPIC 2 (DB)     | 8 + 5     | 13     | 100%    |
| EPIC 3 (인프라) | 9         | 6      | 67%     |
| EPIC 4 (읽기)   | 14        | 0      | 0%      |
| EPIC 5 (편집)   | 12        | 0      | 0%      |
| EPIC 6 (협업)   | 7         | 0      | 0%      |
| EPIC 7 (Social) | 4         | 0      | 0%      |
| EPIC 8 (고도화) | 6         | 0      | 0%      |
| **총합**        | **74**    | **33** | **45%** |

---

## 다음 단계 (권장)

1. **T-3004** Auth 로그인 플로우 완료 (로그인 UI, Protected Route)
2. **T-3005** Map SDK 세팅 (Kakao Map API)
3. **T-3006** Vercel 배포 파이프라인 연결
4. **EPIC 4** 읽기 전용 MVP 구현 시작
