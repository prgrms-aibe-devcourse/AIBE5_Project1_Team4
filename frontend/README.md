# Trip Planner - Frontend

## 목차

1. [개요](#개요)
2. [설치 및 환경변수](#설치-및-환경변수)
3. [개발 명령어](#개발-명령어)
4. [UI Preview](#ui-preview)
5. [API 사용법](#api-사용법)
6. [Realtime & Presence](#realtime--presence)
7. [React Hooks & Context](#react-hooks--context)
8. [컨벤션](#컨벤션)
9. [Troubleshooting / FAQ](#troubleshooting--faq)

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
├── api/              # Supabase API 통신 레이어
├── components/       # 공통 UI 컴포넌트
├── features/         # 기능별 모듈 (trips, auth, reviews 등)
├── hooks/            # 커스텀 React Hooks
├── pages/            # 페이지 컴포넌트
├── styles/           # 전역 스타일
├── ui-preview/       # UI 컴포넌트 프리뷰
├── App.jsx           # 앱 루트
└── main.jsx          # 엔트리포인트
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

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `feature/` | 새로운 기능 개발 | `feature/login-page` |
| `fix/` | 버그 수정 | `fix/auth-redirect` |
| `hotfix/` | 긴급 버그 수정 (프로덕션) | `hotfix/critical-crash` |

```bash
# 브랜치 생성 예시
git checkout -b feature/trip-create
git checkout -b fix/map-loading-error
git checkout -b hotfix/login-failure
```

### 커밋 메시지

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat:` | 새로운 기능 추가 | `feat: 여행 생성 폼 추가` |
| `fix:` | 버그 수정 | `fix: 로그인 리다이렉트 오류 수정` |
| `chore:` | 빌드, 설정, 의존성 등 | `chore: eslint 설정 업데이트` |
| `refactor:` | 코드 리팩토링 (기능 변경 없음) | `refactor: useAuth 훅 분리` |
| `docs:` | 문서 수정 | `docs: README 업데이트` |
| `style:` | 코드 포맷팅 (기능 변경 없음) | `style: 들여쓰기 수정` |
| `test:` | 테스트 코드 | `test: 로그인 테스트 추가` |

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
  return (
    <div>
      {/* ... */}
    </div>
  );
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
* 할 일을 간단히 설명해주세요

## 📌 To do
* [ ] 할 작업들 리스트업
```

### PR Template

```markdown
## 🔎 What
* 한 작업을 간단히 설명해주세요

## 🔗 Issue
* Closes: #이슈번호

## ✅ 체크리스트
* [ ] 브랜치 base가 적절한가요?
* [ ] 제목이 이슈 제목과 동일한가요?
* [ ] 최소 1명의 리뷰를 받았나요?
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
