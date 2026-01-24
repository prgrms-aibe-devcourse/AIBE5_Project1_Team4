import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, ButtonGroup, Container, Form } from 'react-bootstrap';
import TripCardList from '@/components/trip/TripCardList';
import { listPublicTrips } from '@/services/trips.service';
import { seedDummyTrips } from '@/dev/seedDummyTrips'; // 있으면
// import { useNavigate } from 'react-router-dom';

function makeMockTrips(count = 24) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(now - i * 1000 * 60 * 60).toISOString();
    const start = new Date(now + (i % 10) * 86400000);
    const end = new Date(start);
    end.setDate(start.getDate() + 2);

    return {
      id: `mock-${i + 1}`,
      title: `프리뷰 여행 ${i + 1}`,
      description:
        i % 2 === 0 ? '이건 카드 UI 프리뷰용 더미 설명입니다.' : null,
      cover_image_url: null,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      created_at: createdAt,
      author: {
        id: `author-${(i % 4) + 1}`,
        name: ['민수', '지수', '현우', '서연'][i % 4],
        avatar_url: null,
      },
      like_count: (i * 7) % 123,
      bookmark_count: (i * 3) % 45,
      member_count: 1 + (i % 5),
      // region은 현재 카드에서 optional
      region: null,
    };
  });
}

export default function ExplorePreviewPage() {
  // const navigate = useNavigate();

  const [mode, setMode] = useState('mock'); // mock | supabase
  const [q, setQ] = useState('');
  const [trips, setTrips] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [likedTripIds, setLikedTripIds] = useState([]);
  const [bookmarkedTripIds, setBookmarkedTripIds] = useState([]);

  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    setErrorMsg('');

    if (mode === 'mock') {
      const mocked = makeMockTrips(36);
      // q 필터는 프리뷰에서만 간단히
      const filtered = q.trim()
        ? mocked.filter((t) =>
            (t.title || '').toLowerCase().includes(q.trim().toLowerCase()),
          )
        : mocked;

      setTrips(filtered);
      setCursor(null);
      setHasMore(false);
      return;
    }

    // supabase mode
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await listPublicTrips({ q, limit: 20, cursor: null });
      setTrips(res.items);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } catch (e) {
      setErrorMsg(e?.message || '불러오기 실패');
      setTrips([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [mode, q]);

  const loadMore = useCallback(async () => {
    if (mode !== 'supabase') return;
    if (!hasMore || isLoading || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await listPublicTrips({ q, limit: 20, cursor });
      setTrips((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } catch (e) {
      setErrorMsg(e?.message || '더 불러오기 실패');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [mode, hasMore, isLoading, q, cursor]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCardClick = useCallback((tripId) => {
    // 프리뷰에선 이동 대신 로그만
    console.log('card click:', tripId);
    // navigate(`/trips/${tripId}`);
  }, []);

  const onLikeClick = useCallback((tripId) => {
    setLikedTripIds((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId],
    );
  }, []);

  const onBookmarkClick = useCallback((tripId) => {
    setBookmarkedTripIds((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId],
    );
  }, []);

  const emptyMessage = useMemo(() => {
    if (mode === 'mock')
      return q.trim()
        ? '더미에서 검색 결과가 없습니다'
        : '더미 여행이 없습니다';
    return q.trim() ? '검색 결과가 없습니다' : '공개된 여행 일정이 없습니다';
  }, [mode, q]);

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <h4 className="m-0">Explore Preview</h4>

        <ButtonGroup>
          <Button
            variant={mode === 'mock' ? 'primary' : 'outline-primary'}
            onClick={() => setMode('mock')}
          >
            mock
          </Button>
          <Button
            variant={mode === 'supabase' ? 'primary' : 'outline-primary'}
            onClick={() => setMode('supabase')}
          >
            supabase
          </Button>
        </ButtonGroup>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <Form.Control
          placeholder="프리뷰 검색(q)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <Button variant="outline-secondary" onClick={refresh}>
          새로고침
        </Button>

        {mode === 'supabase' && (
          <Button
            variant="outline-danger"
            onClick={() => seedDummyTrips?.(20)}
            title="로그인 필요 / 더미 생성"
          >
            더미 생성
          </Button>
        )}
      </div>

      {errorMsg && (
        <Alert variant="danger" className="mt-3">
          {errorMsg}
        </Alert>
      )}

      {/* 너희 카드 리스트 컴포넌트 그대로 사용 */}
      <TripCardList
        trips={trips}
        isLoading={isLoading}
        hasMore={mode === 'supabase' ? hasMore : false}
        onLoadMore={mode === 'supabase' ? loadMore : undefined}
        onCardClick={onCardClick}
        onLikeClick={onLikeClick}
        onBookmarkClick={onBookmarkClick}
        likedTripIds={likedTripIds}
        bookmarkedTripIds={bookmarkedTripIds}
        emptyMessage={emptyMessage}
        columns={3}
      />
    </Container>
  );
}
