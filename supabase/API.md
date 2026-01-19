# Trip Planner - Frontend API Reference

프론트엔드에서 사용하는 모든 API를 정리한 문서입니다.

## 목차

1. [설정](#설정)
2. [인증 (Auth)](#인증-auth)
3. [Edge Functions](#edge-functions)
4. [Supabase Client API (테이블 직접 접근)](#supabase-client-api)
5. [Realtime](#realtime)
6. [Storage](#storage)

---

## 설정

### Supabase Client 초기화

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 환경 변수 (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 인증 (Auth)

### 회원가입

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'johndoe',
      full_name: 'John Doe'
    }
  }
})
```

### 로그인

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### 소셜 로그인 (OAuth)

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google' // 'kakao', 'github' 등
})
```

### 로그아웃

```typescript
const { error } = await supabase.auth.signOut()
```

### 현재 사용자 정보

```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### 세션 상태 구독

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

---

## Edge Functions

### 1. search-place

장소 검색 (Kakao Local API + 캐싱)

**Endpoint**: `POST /functions/v1/search-place`

**Request**:
```typescript
interface SearchPlaceRequest {
  query: string           // 검색어 (필수)
  latitude?: number       // 현재 위도 (선택)
  longitude?: number      // 현재 경도 (선택)
  radius?: number         // 검색 반경 (m, 최대 20000)
  page?: number           // 페이지 번호 (기본 1)
  size?: number           // 페이지 크기 (최대 15)
}
```

**Response**:
```typescript
interface SearchPlaceResponse {
  data: {
    places: Place[]
    meta: {
      total: number
      page: number
      size: number
      is_end: boolean
    }
  }
}

interface Place {
  id: string
  provider: string
  provider_place_id: string
  name: string
  category: string
  address: string
  road_address: string
  phone: string
  latitude: number
  longitude: number
  raw_data: object
}
```

**사용 예시**:
```typescript
const { data, error } = await supabase.functions.invoke('search-place', {
  body: {
    query: 'coffee shop gangnam',
    latitude: 37.5665,
    longitude: 126.9780,
    radius: 5000
  }
})
```

**에러 코드**:
| 코드 | 설명 |
|------|------|
| 400 | query 파라미터 누락 |
| 401 | 인증 헤더 누락 |
| 502 | Kakao API 오류 |

---

### 2. process-image

이미지 업로드 (커버 이미지, 리뷰 이미지)

**Endpoint**: `POST /functions/v1/process-image`

**Content-Type**: `multipart/form-data`

**Request**:
| 필드 | 타입 | 설명 |
|------|------|------|
| `file` | File | 이미지 파일 (필수) |
| `kind` | string | `"cover"` 또는 `"review"` (필수) |
| `trip_id` | string | Trip UUID (kind=cover일 때 필수) |
| `review_id` | string | Review UUID (kind=review일 때 필수) |

**제한 사항**:
- 최대 파일 크기: 5MB
- 허용 타입: JPEG, PNG, WebP, GIF

**Response**:
```typescript
interface ProcessImageResponse {
  data: {
    url: string       // 공개 URL
    path: string      // Storage 경로
    kind: string
    trip_id?: string
    review_id?: string
  }
}
```

**사용 예시**:
```typescript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('kind', 'cover')
formData.append('trip_id', tripId)

const { data, error } = await supabase.functions.invoke('process-image', {
  body: formData
})
```

**에러 코드**:
| 코드 | 설명 |
|------|------|
| 400 | 파일 누락, 잘못된 파일 타입, 파일 크기 초과 |
| 401 | 인증 필요 |
| 403 | 권한 없음 (Trip 편집 권한 또는 Review 소유권) |

---

### 3. create-review

리뷰 생성 (Trip 또는 Place)

**Endpoint**: `POST /functions/v1/create-review`

**Request**:
```typescript
interface CreateReviewRequest {
  target_type: 'trip' | 'place'  // 리뷰 대상 (필수)
  trip_id?: string               // Trip UUID (target_type=trip일 때 필수)
  place_id?: string              // Place UUID (target_type=place일 때 필수)
  rating: number                 // 평점 1-5 (필수)
  content?: string               // 리뷰 내용
  visited_on?: string            // 방문일 (YYYY-MM-DD)
  photo_urls?: string[]          // 사진 URL 배열
}
```

**Response**:
```typescript
interface CreateReviewResponse {
  data: Review & {
    author: {
      id: string
      username: string
      full_name: string
      avatar_url: string
    }
  }
  message: string
}
```

**사용 예시**:
```typescript
const { data, error } = await supabase.functions.invoke('create-review', {
  body: {
    target_type: 'trip',
    trip_id: 'uuid-here',
    rating: 5,
    content: 'Amazing trip!',
    visited_on: '2026-03-01'
  }
})
```

**에러 코드**:
| 코드 | 설명 |
|------|------|
| 400 | 잘못된 target_type, rating, 날짜 형식 |
| 401 | 인증 필요 |
| 403 | Trip 열람 권한 없음 |
| 409 | 이미 리뷰 작성함 (대상당 1개) |

---

### 4. ai-suggest-query

AI 검색어 추천 (오타 교정 + 연관 검색어)

**Endpoint**: `POST /functions/v1/ai-suggest-query`

**Request**:
```typescript
interface SuggestQueryRequest {
  q: string  // 검색어 (필수, 최대 200자)
}
```

**Response**:
```typescript
interface SuggestQueryResponse {
  data: {
    original_query: string      // 원본 쿼리
    normalized_query: string    // 교정된 쿼리
    suggestions: string[]       // 연관 검색어 (3-5개)
  }
}
```

**사용 예시**:
```typescript
const { data, error } = await supabase.functions.invoke('ai-suggest-query', {
  body: { q: 'coffe shop gangnam' }
})

// Response:
// {
//   normalized_query: "coffee shop gangnam",
//   suggestions: ["cafe gangnam", "specialty coffee gangnam", ...]
// }
```

**참고**: 인증 없이 사용 가능 (선택적)

---

### 5. accept-invite-link

초대 링크 수락 (Trip 참여)

**Endpoint**: `POST /functions/v1/accept-invite-link`

**Request**:
```typescript
interface AcceptInviteRequest {
  token: string  // 초대 토큰 (필수)
}
```

**Response**:
```typescript
interface AcceptInviteResponse {
  data: {
    trip: Trip              // Trip 정보
    membership?: TripMember // 새로 생성된 멤버십
    role: 'editor'          // 부여된 역할
    already_member?: boolean // 이미 멤버인 경우 true
  }
  message: string
}
```

**사용 예시**:
```typescript
const { data, error } = await supabase.functions.invoke('accept-invite-link', {
  body: { token: 'invitation-token-here' }
})
```

**에러 코드**:
| 코드 | 설명 |
|------|------|
| 400 | 토큰 누락 |
| 401 | 인증 필요 |
| 404 | 유효하지 않은 토큰 |
| 410 | 만료됨 또는 사용 횟수 초과 |

---

## Supabase Client API

Supabase Client를 통해 직접 접근하는 테이블들입니다.
RLS(Row Level Security)가 적용되어 권한에 따라 자동 필터링됩니다.

### profiles (프로필)

```typescript
// 내 프로필 조회
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// 프로필 업데이트
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'New Name', bio: 'Hello!' })
  .eq('id', userId)

// 사용자 검색
const { data } = await supabase
  .from('profiles')
  .select('id, username, full_name, avatar_url')
  .ilike('username', `%${searchTerm}%`)
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | auth.users.id와 동일 |
| `username` | text | 고유 사용자명 (3-30자, 영숫자+_-) |
| `full_name` | text | 표시 이름 |
| `avatar_url` | text | 프로필 이미지 URL |
| `bio` | text | 자기소개 |

---

### trips (여행 계획)

```typescript
// 내 Trip 목록
const { data } = await supabase
  .from('trips')
  .select(`
    *,
    members:trip_members(user_id, role),
    themes:trip_themes(theme:themes(*)),
    regions:trip_regions(region:regions(*))
  `)
  .order('created_at', { ascending: false })

// Trip 생성
const { data, error } = await supabase
  .from('trips')
  .insert({
    title: 'My Trip',
    start_date: '2026-03-01',
    end_date: '2026-03-05',
    visibility: 'private',
    created_by: userId
  })
  .select()
  .single()

// Trip 업데이트
const { error } = await supabase
  .from('trips')
  .update({ title: 'New Title', summary: 'Updated summary' })
  .eq('id', tripId)

// Trip 삭제 (owner만 가능)
const { error } = await supabase
  .from('trips')
  .delete()
  .eq('id', tripId)

// 공개 Trip 검색 (Discovery)
const { data } = await supabase
  .from('trips')
  .select(`
    *,
    creator:profiles!trips_created_by_fkey(username, avatar_url),
    like_count:trip_likes(count),
    themes:trip_themes(theme:themes(name, slug))
  `)
  .eq('visibility', 'public')
  .order('created_at', { ascending: false })
  .range(0, 19)
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `title` | text | 제목 (필수) |
| `summary` | text | 요약 |
| `start_date` | date | 시작일 |
| `end_date` | date | 종료일 |
| `cover_image_url` | text | 커버 이미지 URL |
| `visibility` | text | `public`, `unlisted`, `private` |
| `created_by` | uuid | 생성자 ID |
| `updated_by` | uuid | 마지막 수정자 ID |

---

### trip_members (Trip 멤버)

```typescript
// Trip 멤버 목록
const { data } = await supabase
  .from('trip_members')
  .select(`
    *,
    user:profiles(id, username, full_name, avatar_url)
  `)
  .eq('trip_id', tripId)

// 멤버 역할 변경 (owner만)
const { error } = await supabase
  .from('trip_members')
  .update({ role: 'editor' })
  .eq('id', memberId)

// 멤버 제거 (owner 또는 자기 자신)
const { error } = await supabase
  .from('trip_members')
  .delete()
  .eq('id', memberId)
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `trip_id` | uuid | Trip FK |
| `user_id` | uuid | Profile FK |
| `role` | text | `owner`, `editor` |
| `joined_at` | timestamptz | 참여 시각 |

---

### trip_days (Day 페이지)

```typescript
// Trip의 Day 목록
const { data } = await supabase
  .from('trip_days')
  .select(`
    *,
    schedule_items(
      *,
      place:places(*)
    )
  `)
  .eq('trip_id', tripId)
  .order('date', { ascending: true })

// Day 생성
const { data, error } = await supabase
  .from('trip_days')
  .insert({
    trip_id: tripId,
    date: '2026-03-01',
    notes: 'First day!'
  })
  .select()
  .single()

// Day 업데이트
const { error } = await supabase
  .from('trip_days')
  .update({ notes: 'Updated notes' })
  .eq('id', dayId)

// Day 삭제
const { error } = await supabase
  .from('trip_days')
  .delete()
  .eq('id', dayId)
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `trip_id` | uuid | Trip FK |
| `date` | date | 날짜 (trip당 고유) |
| `notes` | text | Day 메모 |

---

### schedule_items (일정 항목)

```typescript
// Day의 일정 목록 (정렬: time이 null인 것 먼저, 그 다음 time, 그 다음 order_index)
const { data } = await supabase
  .from('schedule_items')
  .select(`*, place:places(*)`)
  .eq('trip_day_id', dayId)
  .order('time', { ascending: true, nullsFirst: true })
  .order('order_index', { ascending: true })

// 일정 추가
const { data, error } = await supabase
  .from('schedule_items')
  .insert({
    trip_day_id: dayId,
    place_id: placeId,
    time: '09:00',
    duration_minutes: 60,
    notes: 'Morning coffee',
    order_index: 0
  })
  .select(`*, place:places(*)`)
  .single()

// 일정 업데이트
const { error } = await supabase
  .from('schedule_items')
  .update({ time: '10:00', notes: 'Changed time' })
  .eq('id', itemId)

// 일정 삭제
const { error } = await supabase
  .from('schedule_items')
  .delete()
  .eq('id', itemId)

// 순서 변경 (order_index 일괄 업데이트)
const updates = items.map((item, index) => ({
  id: item.id,
  order_index: index
}))
// 개별 업데이트 필요 (upsert는 PK 필요)
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `trip_day_id` | uuid | TripDay FK |
| `place_id` | uuid | Place FK |
| `time` | time | 시간 (nullable) |
| `duration_minutes` | integer | 소요 시간 (분) |
| `notes` | text | 메모 |
| `order_index` | integer | 정렬 순서 |

---

### places (장소)

```typescript
// 장소 조회 (ID로)
const { data } = await supabase
  .from('places')
  .select('*')
  .eq('id', placeId)
  .single()

// 장소 검색 (캐시에서)
const { data } = await supabase
  .from('places')
  .select('*')
  .ilike('name', `%${searchTerm}%`)
  .limit(20)
```

**참고**: 장소 검색은 `search-place` Edge Function 사용 권장 (Kakao API + 캐싱)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `provider` | text | 데이터 출처 (`kakao`) |
| `provider_place_id` | text | 외부 API ID |
| `name` | text | 장소명 |
| `category` | text | 카테고리 |
| `address` | text | 지번 주소 |
| `road_address` | text | 도로명 주소 |
| `phone` | text | 전화번호 |
| `latitude` | numeric | 위도 |
| `longitude` | numeric | 경도 |
| `raw_data` | jsonb | 원본 API 응답 |

---

### themes / regions (테마 / 지역)

```typescript
// 전체 테마 목록
const { data: themes } = await supabase
  .from('themes')
  .select('*')
  .order('name')

// 전체 지역 목록
const { data: regions } = await supabase
  .from('regions')
  .select('*')
  .order('name')
```

---

### trip_themes / trip_regions (Trip-테마/지역 연결)

```typescript
// Trip에 테마 추가
const { error } = await supabase
  .from('trip_themes')
  .insert({ trip_id: tripId, theme_id: themeId })

// Trip에서 테마 제거
const { error } = await supabase
  .from('trip_themes')
  .delete()
  .eq('trip_id', tripId)
  .eq('theme_id', themeId)

// Trip에 지역 추가/제거 (동일한 패턴)
```

---

### trip_likes (좋아요)

```typescript
// 좋아요 상태 확인
const { data } = await supabase
  .from('trip_likes')
  .select('*')
  .eq('trip_id', tripId)
  .eq('user_id', userId)
  .single()

// 좋아요 토글
const isLiked = data !== null

if (isLiked) {
  await supabase
    .from('trip_likes')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId)
} else {
  await supabase
    .from('trip_likes')
    .insert({ trip_id: tripId, user_id: userId })
}

// 좋아요 수 조회
const { count } = await supabase
  .from('trip_likes')
  .select('*', { count: 'exact', head: true })
  .eq('trip_id', tripId)
```

---

### trip_bookmarks (북마크)

```typescript
// 내 북마크 목록
const { data } = await supabase
  .from('trip_bookmarks')
  .select(`
    *,
    trip:trips(*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// 북마크 추가
const { error } = await supabase
  .from('trip_bookmarks')
  .insert({ trip_id: tripId, user_id: userId })

// 북마크 제거
const { error } = await supabase
  .from('trip_bookmarks')
  .delete()
  .eq('trip_id', tripId)
  .eq('user_id', userId)
```

---

### reviews (리뷰)

```typescript
// Trip 리뷰 목록
const { data } = await supabase
  .from('reviews')
  .select(`
    *,
    author:profiles!reviews_author_id_fkey(id, username, avatar_url)
  `)
  .eq('target_type', 'trip')
  .eq('trip_id', tripId)
  .order('created_at', { ascending: false })

// Place 리뷰 목록
const { data } = await supabase
  .from('reviews')
  .select(`
    *,
    author:profiles!reviews_author_id_fkey(id, username, avatar_url)
  `)
  .eq('target_type', 'place')
  .eq('place_id', placeId)
  .order('created_at', { ascending: false })

// 리뷰 업데이트 (본인만)
const { error } = await supabase
  .from('reviews')
  .update({ rating: 4, content: 'Updated review' })
  .eq('id', reviewId)

// 리뷰 삭제 (본인만)
const { error } = await supabase
  .from('reviews')
  .delete()
  .eq('id', reviewId)
```

**참고**: 리뷰 생성은 `create-review` Edge Function 사용 (중복 방지, 권한 검증)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `author_id` | uuid | 작성자 ID |
| `target_type` | text | `trip` 또는 `place` |
| `trip_id` | uuid | Trip FK (target_type=trip일 때) |
| `place_id` | uuid | Place FK (target_type=place일 때) |
| `rating` | integer | 평점 (1-5) |
| `content` | text | 리뷰 내용 |
| `visited_on` | date | 방문일 |
| `photo_urls` | text[] | 사진 URL 배열 |

---

### trip_invite_links (초대 링크)

```typescript
// Trip의 초대 링크 목록
const { data } = await supabase
  .from('trip_invite_links')
  .select('*')
  .eq('trip_id', tripId)

// 초대 링크 생성
const { data, error } = await supabase
  .from('trip_invite_links')
  .insert({
    trip_id: tripId,
    created_by: userId,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일
    max_uses: 10
  })
  .select()
  .single()

// 초대 링크 삭제 (owner만)
const { error } = await supabase
  .from('trip_invite_links')
  .delete()
  .eq('id', linkId)
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `trip_id` | uuid | Trip FK |
| `token` | text | 고유 토큰 |
| `created_by` | uuid | 생성자 ID |
| `expires_at` | timestamptz | 만료 시각 (nullable) |
| `max_uses` | integer | 최대 사용 횟수 (nullable) |
| `use_count` | integer | 현재 사용 횟수 |

---

## Realtime

### Postgres Changes (DB 변경 구독)

```typescript
// Trip 변경 구독
const channel = supabase
  .channel('trip-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'trips',
      filter: `id=eq.${tripId}`
    },
    (payload) => {
      console.log('Trip changed:', payload)
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'trip_days',
      filter: `trip_id=eq.${tripId}`
    },
    (payload) => {
      console.log('Day changed:', payload)
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'schedule_items'
    },
    (payload) => {
      console.log('Schedule item changed:', payload)
    }
  )
  .subscribe()

// 구독 해제
supabase.removeChannel(channel)
```

### Presence (온라인 사용자)

```typescript
const channel = supabase.channel(`trip:${tripId}`)

// Presence 상태 추적
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', state)
})

channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
  console.log('User joined:', newPresences)
})

channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
  console.log('User left:', leftPresences)
})

// 구독 및 내 상태 전송
await channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: userId,
      username: username,
      avatar_url: avatarUrl,
      online_at: new Date().toISOString()
    })
  }
})

// 내 상태 업데이트 (예: 편집 중인 항목)
await channel.track({
  user_id: userId,
  editing_item_id: itemId
})

// 구독 해제
await channel.untrack()
supabase.removeChannel(channel)
```

---

## Storage

### 이미지 버킷: `images`

```typescript
// 직접 업로드 (process-image Edge Function 권장)
const { data, error } = await supabase.storage
  .from('images')
  .upload(`trips/${tripId}/${fileName}`, file, {
    contentType: file.type,
    upsert: false
  })

// Public URL 가져오기
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('trips/trip-id/image.jpg')

// 이미지 삭제
const { error } = await supabase.storage
  .from('images')
  .remove(['trips/trip-id/image.jpg'])

// 폴더 내 파일 목록
const { data, error } = await supabase.storage
  .from('images')
  .list(`trips/${tripId}`)
```

**Storage 구조**:
```
images/
├── trips/
│   └── {trip_id}/
│       └── {user_id}_{timestamp}_{random}.jpg
└── reviews/
    └── {review_id}/
        └── {user_id}_{timestamp}_{random}.jpg
```

**제한 사항**:
- 최대 파일 크기: 5MB
- 허용 타입: JPEG, PNG, WebP, GIF
- 버킷 타입: Public (누구나 URL로 접근 가능)

---

## RLS Helper Functions

프론트엔드에서 RPC로 호출 가능한 헬퍼 함수들:

```typescript
// Trip 멤버 여부 확인
const { data: isMember } = await supabase
  .rpc('is_trip_member', { p_trip_id: tripId })

// Trip 편집 권한 확인
const { data: canEdit } = await supabase
  .rpc('can_edit_trip', { p_trip_id: tripId })

// Trip 소유자 여부 확인
const { data: isOwner } = await supabase
  .rpc('is_trip_owner', { p_trip_id: tripId })

// Trip 열람 권한 확인
const { data: canView } = await supabase
  .rpc('can_view_trip', { p_trip_id: tripId })
```

---

## TypeScript 타입 생성

Supabase CLI로 자동 타입 생성:

```bash
supabase gen types typescript --local > src/types/database.types.ts
# 또는 프로덕션에서
supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

사용 예시:
```typescript
import { Database } from './types/database.types'

type Trip = Database['public']['Tables']['trips']['Row']
type TripInsert = Database['public']['Tables']['trips']['Insert']
type TripUpdate = Database['public']['Tables']['trips']['Update']
```
