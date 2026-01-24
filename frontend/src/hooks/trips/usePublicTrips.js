import { useCallback, useEffect, useRef, useState } from 'react';
import { listPublicTrips } from '@/services/trips.service';

export function usePublicTrips({ q = '', limit = 20, sort = 'latest' } = {}) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  // 중복 호출 방지(연타/스크롤)
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setStatus('loading');
    setError(null);

    try {
      const res = await listPublicTrips({ q, limit, cursor: null, sort });
      setItems(res.items);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
      setStatus('success');
    } catch (e) {
      setError(e);
      setStatus('error');
    } finally {
      loadingRef.current = false;
    }
  }, [q, limit, sort]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setError(null);

    // 최초 로딩과 UI 분리하고 싶으면 loadingMore 상태를 따로 둬도 됨
    setStatus((prev) => (prev === 'idle' ? 'loading' : prev));

    try {
      const res = await listPublicTrips({ q, limit, cursor, sort });
      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
      setStatus('success');
    } catch (e) {
      setError(e);
      setStatus('error');
    } finally {
      loadingRef.current = false;
    }
  }, [q, limit, cursor, hasMore, sort]);

  // q 또는 sort 변경 시 자동 새로고침
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    items,
    hasMore,
    status,
    error,
    refresh,
    loadMore,
  };
}
