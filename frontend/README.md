# Trip Planner - Frontend

## 목차

1. [개요](#개요)
2. [설치 및 환경변수](#설치-및-환경변수)
3. [개발 명령어](#개발-명령어)
4. [테스트](#테스트)
5. [아키텍처](#아키텍처)
6. [UI Preview](#ui-preview)
7. [API 사용법](#api-사용법)
8. [Realtime & Presence](#realtime--presence)
9. [React Hooks & Context](#react-hooks--context)
10. [컨벤션](#컨벤션)
11. [Troubleshooting / FAQ](#troubleshooting--faq)

---

## 개요

Trip Planner 프론트엔드는 **협업 기반 여행 계획 서비스**의 클라이언트 애플리케이션입니다.

### 핵심 기능

- **실시간 협업 편집** - 여러 사용자가 동시에 여행 계획 수정
- **Presence** - 현재 편집 중인 사용자 표시
- **장소 검색** - Kakao Map/Local API 연동
- **소셜 기능** - 좋아요, 북마크, 리뷰

### 기술 스택

| 항목       | 기술                                   |
| ---------- | -------------------------------------- |
| Framework  | React 19                               |
| Build Tool | Vite 7 + SWC                           |
| Language   | JavaScript (ES6+)                      |
| UI         | React Bootstrap 2.x                    |
| Routing    | React Router DOM 7                     |
| Backend    | Supabase (Auth, DB, Realtime, Storage) |
| Map        | Kakao Map API                          |

### 프로젝트 구조

```
src/
├── context/            # React Context (AuthContext 등)
├── lib/                # 외부 라이브러리 설정
│   └── supabaseClient.js
├── services/           # 서비스 레이어
│   ├── _core/          # 공통 유틸리티
│   │   ├── errors.js   # AppError, 에러 분류
│   │   ├── functions.js # Edge Function 호출
│   │   ├── storage.js  # Storage 유틸
│   │   └── normalize/  # 데이터 정규화
│   └── auth.service.js # 인증 서비스
├── types/              # TypeScript 타입 정의
│   ├── database.types.ts  # Supabase 스키마 타입
│   └── domain.types.ts    # 도메인/쿼리 결과 타입
├── components/         # 공통 UI 컴포넌트
├── pages/              # 페이지 컴포넌트
├── styles/             # 전역 스타일
├── ui-preview/         # UI 컴포넌트 프리뷰
├── setupTests.js       # 테스트 환경 설정
├── App.jsx             # 앱 루트
└── main.jsx            # 엔트리포인트
```

---

## 설치 및 환경변수

### 설치

```bash
cd frontend
npm install
```

### 환경변수

`.env` 파일을 생성하고 다음 변수를 설정합니다:

```env
# Supabase (필수)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Kakao Map (필수)
VITE_KAKAO_MAP_API_KEY=your-kakao-javascript-key
```

| 변수                     | 설명                            | 필수 |
| ------------------------ | ------------------------------- | ---- |
| `VITE_SUPABASE_URL`      | Supabase 프로젝트 URL           | O    |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Key (공개용) | O    |
| `VITE_KAKAO_MAP_API_KEY` | Kakao JavaScript API Key        | O    |

> **주의**: `VITE_` 접두사가 있어야 클라이언트에서 접근 가능합니다.

---

## 개발 명령어

### 자주 사용하는 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 프리뷰
npm run preview

# ESLint 검사
npm run lint
```

### 개발 서버

```bash
npm run dev
```

- URL: http://localhost:5173
- HMR(Hot Module Replacement) 지원
- 변경 사항 자동 반영

### 빌드

```bash
npm run build
```

- 출력: `dist/` 폴더
- 최적화된 프로덕션 번들 생성

---

## 테스트

### 테스트 스택

| 항목            | 기술                          |
| --------------- | ----------------------------- |
| Test Runner     | Vitest 4.x                    |
| Testing Library | @testing-library/react 16.x   |
| DOM Environment | jsdom 27.x                    |
| Matchers        | @testing-library/jest-dom 6.x |

### 테스트 명령어

```bash
# 테스트 실행 (watch 모드)
npm run test

# 테스트 한 번 실행
npm run test:run

# 테스트 UI 실행
npm run test:ui
```

### 파일 구조

```
src/
├── setup.js              # 테스트 전역 설정
├── components/
│   ├── Button.jsx
│   └── Button.test.jsx        # 컴포넌트 옆에 테스트 파일
├── hooks/
│   ├── useAuth.js
│   └── useAuth.test.js
└── __tests__/                 # 통합 테스트 (선택)
    └── integration.test.jsx
```

### 테스트 파일 네이밍

- 컴포넌트: `ComponentName.test.jsx`
- 훅: `hookName.test.js`
- 유틸리티: `utilName.test.js`

### 기본 테스트 작성법

#### 컴포넌트 테스트

```jsx
// src/components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('텍스트를 올바르게 렌더링한다', () => {
    render(<Button>클릭</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('클릭');
  });

  it('클릭 시 onClick 핸들러를 호출한다', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 클릭이 동작하지 않는다', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        클릭
      </Button>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

#### 커스텀 훅 테스트

```jsx
// src/hooks/useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('초기값으로 시작한다', () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  it('increment 호출 시 카운트가 증가한다', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

#### 비동기 테스트

```jsx
// src/components/UserProfile.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserProfile from './UserProfile';
import { supabase } from '../api/supabase';

// Supabase 모킹
vi.mock('../api/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: '1', username: '테스트유저' },
              error: null,
            }),
          ),
        })),
      })),
    })),
  },
}));

describe('UserProfile', () => {
  it('사용자 정보를 로드하여 표시한다', async () => {
    render(<UserProfile userId="1" />);

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 데이터 로드 후 확인
    await waitFor(() => {
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
    });
  });
});
```

### Context/Provider가 필요한 컴포넌트 테스트

```jsx
// src/test-utils.jsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// 모든 Provider를 포함하는 래퍼
function AllProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

// 커스텀 render 함수
export function renderWithProviders(ui, options) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// @testing-library/react의 모든 것을 re-export
export * from '@testing-library/react';
```

```jsx
// 사용 예시
import { renderWithProviders, screen } from '../test-utils';
import Navigation from './Navigation';

describe('Navigation', () => {
  it('로그인하지 않은 경우 로그인 버튼을 표시한다', () => {
    renderWithProviders(<Navigation />);

    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });
});
```

### 주요 Testing Library 쿼리

| 쿼리                   | 용도                                    |
| ---------------------- | --------------------------------------- |
| `getByRole`            | 접근성 역할로 요소 찾기 (권장)          |
| `getByText`            | 텍스트 내용으로 찾기                    |
| `getByLabelText`       | label과 연결된 form 요소 찾기           |
| `getByPlaceholderText` | placeholder로 input 찾기                |
| `getByTestId`          | data-testid 속성으로 찾기 (최후의 수단) |
| `queryBy*`             | 요소가 없어도 에러 없이 null 반환       |
| `findBy*`              | 비동기로 요소 찾기 (Promise 반환)       |

### jest-dom 커스텀 매처

```jsx
// 가시성
expect(element).toBeVisible();
expect(element).toBeInTheDocument();

// form 요소
expect(input).toHaveValue('입력값');
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();

// 속성/클래스
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('href', '/home');

// 텍스트
expect(element).toHaveTextContent('내용');
```

### Vitest 주요 기능

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 모킹
const mockFn = vi.fn();
const mockFnWithReturn = vi.fn(() => 'value');

// 타이머 모킹
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();

// 모듈 모킹
vi.mock('./module', () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}));

// 스파이
const spy = vi.spyOn(object, 'method');

// 초기화
beforeEach(() => {
  vi.clearAllMocks();
});
```

### 테스트 작성 가이드라인

1. **AAA 패턴 따르기**: Arrange(준비) → Act(실행) → Assert(검증)
2. **사용자 관점에서 테스트**: 구현 세부사항이 아닌 동작을 테스트
3. **접근성 쿼리 우선**: `getByRole`, `getByLabelText` 사용 권장
4. **의미 있는 테스트 이름**: 테스트가 무엇을 검증하는지 명확히 작성
5. **테스트 격리**: 각 테스트는 독립적으로 실행 가능해야 함

---

## 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────────────────┐
│                   Pages/UI                       │
├─────────────────────────────────────────────────┤
│              Context (AuthContext)               │
├─────────────────────────────────────────────────┤
│            Services (auth.service 등)            │
├─────────────────────────────────────────────────┤
│     _core (errors, functions, storage)           │
├─────────────────────────────────────────────────┤
│           lib/supabaseClient.js                  │
└─────────────────────────────────────────────────┘
```

### 서비스 레이어 (`services/`)

서비스 레이어는 Supabase와의 통신을 추상화하고 일관된 에러 처리를 제공합니다.

#### 에러 처리 (`_core/errors.js`)

```javascript
import { unwrap, AppError, isAuthError } from '@/services/_core/errors';

// Supabase 결과를 unwrap (에러 시 AppError throw)
const data = unwrap(result, 'tripService.getTrip');

// UI에서 에러 분기 처리
try {
  await someOperation();
} catch (e) {
  if (isAuthError(e)) {
    // 로그인 페이지로 리다이렉트
  }
}
```

**AppError 종류 (`kind`)**:

| kind         | HTTP | 설명                   |
| ------------ | ---- | ---------------------- |
| `auth`       | 401  | 로그인 필요            |
| `forbidden`  | 403  | 권한 없음              |
| `not_found`  | 404  | 대상 없음              |
| `conflict`   | 409  | 중복/충돌              |
| `validation` | 400  | 잘못된 요청            |
| `network`    | 0    | 네트워크 오류          |
| `server`     | 5xx  | 서버 오류              |
| `unknown`    | -    | 알 수 없음             |

#### Edge Function 호출 (`_core/functions.js`)

```javascript
import { invokeFunction } from '@/services/_core/functions';

// Edge Function 호출 (unwrap 자동 적용)
const places = await invokeFunction('search-place', {
  body: { query: '강남 카페', page: 1 },
});
```

#### Storage 유틸 (`_core/storage.js`)

```javascript
import { uploadFile, getPublicUrl, removeFiles } from '@/services/_core/storage';

// 파일 업로드
const data = await uploadFile('images', 'trips/cover.jpg', file);

// Public URL 가져오기
const url = getPublicUrl('images', 'trips/cover.jpg');

// 파일 삭제
await removeFiles('images', ['trips/cover.jpg']);
```

#### 데이터 정규화 (`_core/normalize/`)

Supabase에서 반환된 데이터를 정규화합니다.

```javascript
import { normalizePlace } from '@/services/_core/normalize/normalizePlace';

// latitude/longitude를 number로 변환
const place = normalizePlace(rawPlace);
```

### 타입 정의 (`types/`)

#### `database.types.ts`

Supabase 스키마에서 생성된 타입입니다. 직접 수정하지 마세요.

```typescript
import type { Database } from '@/types/database.types';

// Supabase 클라이언트에 타입 적용
const supabase = createClient<Database>(url, key);
```

#### `domain.types.ts`

도메인 엔티티와 쿼리 결과 타입입니다.

```typescript
import type { Trip, TripInsert, TripFull, Profile } from '@/types/domain.types';

// 기본 엔티티
const trip: Trip = { ... };

// Insert 타입 (생성 시)
const newTrip: TripInsert = { title: '제주 여행', ... };

// 쿼리 결과 타입 (관계 포함)
const tripWithAuthor: TripWithAuthor = { ...trip, author: profile };
```

### Context (`context/`)

#### AuthContext

인증 상태와 관련 함수를 제공합니다.

```javascript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthed, loading, signIn, signOut } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthed) return <LoginPrompt />;

  return <div>Welcome, {user.email}</div>;
}
```

**제공 값:**

| 속성              | 타입       | 설명                    |
| ----------------- | ---------- | ----------------------- |
| `session`         | Session    | Supabase 세션           |
| `user`            | User       | 현재 사용자             |
| `loading`         | boolean    | 초기 로딩 중            |
| `isAuthed`        | boolean    | 로그인 여부             |
| `signIn`          | function   | 이메일/비밀번호 로그인  |
| `signUp`          | function   | 회원가입                |
| `signOut`         | function   | 로그아웃                |
| `signInWithOAuth` | function   | OAuth 로그인            |

---

## UI Preview

개발 중 UI 컴포넌트를 미리 확인할 수 있는 페이지입니다.

### 접근 방법

```
http://localhost:5173/preview
```

> **참고**: 개발 모드(`npm run dev`)에서만 접근 가능합니다.

### 새 컴포넌트 프리뷰 추가

`src/ui-preview/sections/` 폴더에 `*.preview.jsx` 파일을 생성합니다:

```jsx
// src/ui-preview/sections/MyComponent.preview.jsx

// 메타 정보 (선택)
export const meta = {
  title: 'My Component', // 표시될 제목
  order: 10, // 정렬 순서 (낮을수록 위)
};

// 프리뷰 컴포넌트 (필수)
export default function MyComponentPreview() {
  return (
    <div>
      {/* 컴포넌트 프리뷰 내용 */}
      <MyComponent variant="primary" />
      <MyComponent variant="secondary" />
    </div>
  );
}
```

### 프리뷰 기능

- **검색**: 상단 검색창으로 컴포넌트 필터링
- **자동 로드**: `*.preview.jsx` 파일 자동 감지
- **정렬**: `meta.order`로 표시 순서 제어

---

## API 사용법

### Supabase Client 초기화

```javascript
// src/api/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

### 인증 (Auth)

```javascript
import { supabase } from '../api/supabase';

// 회원가입
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// 로그아웃
await supabase.auth.signOut();

// 현재 사용자
const {
  data: { user },
} = await supabase.auth.getUser();
```

### 데이터 조회/수정

```javascript
// 조회
const { data: trips } = await supabase
  .from('trips')
  .select('*')
  .eq('visibility', 'public')
  .order('created_at', { ascending: false });

// 생성
const { data, error } = await supabase
  .from('trips')
  .insert({ title: 'New Trip', created_by: userId })
  .select()
  .single();

// 수정
const { error } = await supabase
  .from('trips')
  .update({ title: 'Updated Title' })
  .eq('id', tripId);

// 삭제
const { error } = await supabase.from('trips').delete().eq('id', tripId);
```

### Edge Functions 호출

```javascript
// 장소 검색
const { data, error } = await supabase.functions.invoke('search-place', {
  body: { query: '강남 카페', page: 1 },
});

// 이미지 업로드
const formData = new FormData();
formData.append('file', file);
formData.append('kind', 'cover');
formData.append('trip_id', tripId);

const { data, error } = await supabase.functions.invoke('process-image', {
  body: formData,
});
```

> **상세 API 문서**: [supabase/API.md](../supabase/API.md)

---

## Realtime & Presence

### Postgres Changes (DB 변경 구독)

Trip 데이터 변경을 실시간으로 감지합니다:

```javascript
import { supabase } from '../api/supabase';
import { useEffect } from 'react';

function useTripChanges(tripId, onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel(`trip:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          console.log('Trip changed:', payload);
          onUpdate(payload);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_items',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log('Schedule changed:', payload);
          onUpdate(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, onUpdate]);
}
```

### Presence (온라인 사용자 추적)

현재 Trip을 편집 중인 사용자를 표시합니다:

```javascript
import { supabase } from '../api/supabase';
import { useEffect, useState } from 'react';

function usePresence(tripId, currentUser) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const channel = supabase.channel(`trip:${tripId}`);

    // 상태 동기화
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).flat();
      setOnlineUsers(users);
    });

    // 구독 시작 및 내 상태 전송
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: currentUser.id,
          username: currentUser.username,
          avatar_url: currentUser.avatar_url,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [tripId, currentUser]);

  return onlineUsers;
}
```

### Presence 상태 업데이트

편집 중인 항목 표시:

```javascript
// 특정 항목 편집 시작
await channel.track({
  user_id: userId,
  editing_item_id: itemId,
  editing_field: 'title',
});

// 편집 종료
await channel.track({
  user_id: userId,
  editing_item_id: null,
  editing_field: null,
});
```

---

## React Hooks & Context

### 권장 Hook 구조

```
src/hooks/
├── useAuth.js          # 인증 상태 관리
├── useTrip.js          # Trip CRUD
├── useRealtime.js      # Realtime 구독
├── usePresence.js      # Presence 관리
└── useDebounce.js      # 디바운스 유틸리티
```

### useAuth Hook 예시

```javascript
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변화 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### useDebounce Hook 예시

```javascript
// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Context 구조 권장

```jsx
// src/App.jsx
import { AuthProvider } from './hooks/useAuth';
import { TripProvider } from './hooks/useTrip';

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <Routes>{/* ... */}</Routes>
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}
```

---

## 컨벤션

### 브랜치 네이밍

| 접두사     | 용도                      | 예시                    |
| ---------- | ------------------------- | ----------------------- |
| `feature/` | 새로운 기능 개발          | `feature/login-page`    |
| `fix/`     | 버그 수정                 | `fix/auth-redirect`     |
| `hotfix/`  | 긴급 버그 수정 (프로덕션) | `hotfix/critical-crash` |

```bash
# 브랜치 생성 예시
git checkout -b feature/trip-create
git checkout -b fix/map-loading-error
git checkout -b hotfix/login-failure
```

### 커밋 메시지

| 타입        | 용도                           | 예시                               |
| ----------- | ------------------------------ | ---------------------------------- |
| `feat:`     | 새로운 기능 추가               | `feat: 여행 생성 폼 추가`          |
| `fix:`      | 버그 수정                      | `fix: 로그인 리다이렉트 오류 수정` |
| `chore:`    | 빌드, 설정, 의존성 등          | `chore: eslint 설정 업데이트`      |
| `refactor:` | 코드 리팩토링 (기능 변경 없음) | `refactor: useAuth 훅 분리`        |
| `docs:`     | 문서 수정                      | `docs: README 업데이트`            |
| `style:`    | 코드 포맷팅 (기능 변경 없음)   | `style: 들여쓰기 수정`             |
| `test:`     | 테스트 코드                    | `test: 로그인 테스트 추가`         |

```bash
# 커밋 메시지 예시
git commit -m "feat: 여행 상세 페이지 구현"
git commit -m "fix: 지도 마커 클릭 이벤트 수정"
git commit -m "chore: React Bootstrap 버전 업그레이드"
git commit -m "refactor: API 호출 로직을 hooks로 분리"
```

### 코딩 컨벤션

#### 파일/폴더 네이밍

```
컴포넌트:     PascalCase.jsx     (예: TripCard.jsx, LoginForm.jsx)
훅:          camelCase.js       (예: useAuth.js, useTrip.js)
유틸리티:     camelCase.js       (예: formatDate.js, validators.js)
스타일:       kebab-case.css     (예: trip-card.css)
상수:         SCREAMING_SNAKE    (예: API_ENDPOINTS, MAX_FILE_SIZE)
```

#### 컴포넌트 구조

```jsx
// 1. imports (외부 → 내부 순서)
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';

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

#### ESLint 규칙

프로젝트에 설정된 ESLint 규칙을 따릅니다:

```bash
# 린트 검사
npm run lint

# 자동 수정 (가능한 경우)
npm run lint -- --fix
```

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

---

## Troubleshooting / FAQ

### 자주 발생하는 문제

#### 1. "Failed to fetch" 또는 네트워크 에러

**원인**: Supabase 연결 실패

**해결**:

```bash
# .env 파일 확인
cat .env

# 변수 확인 (브라우저 콘솔에서)
console.log(import.meta.env.VITE_SUPABASE_URL)
```

- `.env` 파일이 `frontend/` 폴더에 있는지 확인
- 변수명이 `VITE_` 접두사로 시작하는지 확인
- 개발 서버 재시작 (`npm run dev`)

---

#### 2. Kakao Map이 로드되지 않음

**원인**: API 키 문제 또는 도메인 미등록

**해결**:

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. **내 애플리케이션** > **플랫폼** > **Web**
3. `http://localhost:5173` 도메인 등록 확인
4. **JavaScript 키**가 `VITE_KAKAO_MAP_API_KEY`에 설정되었는지 확인

---

#### 3. "RLS policy violation" 에러

**원인**: 권한 없는 데이터 접근

**해결**:

- 로그인 상태 확인
- 해당 Trip의 멤버인지 확인
- 공개 Trip만 비로그인 상태에서 조회 가능

```javascript
// 현재 사용자 확인
const {
  data: { user },
} = await supabase.auth.getUser();
console.log('Current user:', user);
```

---

#### 4. Realtime 구독이 작동하지 않음

**원인**: 채널 설정 오류 또는 RLS 정책

**해결**:

```javascript
// 구독 상태 확인
channel.subscribe((status, err) => {
  console.log('Subscription status:', status);
  if (err) console.error('Subscription error:', err);
});
```

- Supabase Dashboard에서 Realtime 활성화 확인
- 테이블의 Realtime 설정 확인

---

#### 5. 빌드 에러

**해결**:

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm run build -- --force
```

---

#### 6. HMR(Hot Module Replacement)이 작동하지 않음

**해결**:

```bash
# Vite 캐시 삭제
rm -rf node_modules/.vite

# 개발 서버 재시작
npm run dev
```

---

### FAQ

**Q: TypeScript 대신 JavaScript를 사용하는 이유?**

A: 빠른 개발 속도와 학습 곡선을 고려하여 JavaScript를 선택했습니다. 추후 TypeScript로 마이그레이션 가능합니다.

---

**Q: 상태 관리 라이브러리(Redux, Zustand)를 사용하지 않는 이유?**

A: React Context + Hooks로 충분히 관리 가능한 규모입니다. Supabase Realtime이 서버 상태를 담당하므로 클라이언트 상태가 단순합니다.

---

**Q: 스타일링에 Bootstrap을 사용하는 이유?**

A: React Bootstrap은 풍부한 컴포넌트와 빠른 프로토타이핑을 제공합니다. 반응형 그리드 시스템이 기본 포함되어 있습니다.

---

**Q: 이미지 업로드 용량 제한은?**

A: 5MB까지 업로드 가능합니다. 허용 타입: JPEG, PNG, WebP, GIF

---

## 관련 문서

- [TECH_STACK.md](../TECH_STACK.md) - 전체 기술 스택
- [GETTING_STARTED.md](../GETTING_STARTED.md) - 프로젝트 시작 가이드
- [supabase/API.md](../supabase/API.md) - API 상세 문서
- [SECURITY.md](../SECURITY.md) - 보안 정책
