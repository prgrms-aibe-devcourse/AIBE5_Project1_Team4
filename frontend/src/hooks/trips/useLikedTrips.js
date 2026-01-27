import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { listLikedTrips } from '@/services/trips.service';

function filterTrips(items, { region, theme, days }) {
  return items.filter((trip) => {
    const regionPass = region === '전체' || (trip.regions || []).includes(region);
    const themePass = theme === '전체' || (trip.themes || []).includes(theme);

    if (!days) return regionPass && themePass;

    const created = trip.created_at ? new Date(trip.created_at) : null;
    const now = new Date();
    const daysDiff = created ? (now - created) / (1000 * 60 * 60 * 24) : Infinity;
    const daysPass = daysDiff <= days;

    return regionPass && themePass && daysPass;
  });
}

function sortTrips(items, sort) {
  if (sort === 'popular') {
    return [...items].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
  }
  return items; // latest는 백엔드 기본 정렬 가정
}

export function useLikedTrips({
  limit = 12,
  sort = 'latest',
  region = '전체',
  theme = '전체',
  days = null,
} = {}) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState('idle');

  const loadingRef = useRef(false);
  const cursorRef = useRef(null);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(
    async (opts = {}) => {
      const isReset = opts.reset === true;
      if (!user?.id) return;
      if (loadingRef.current) return;
      if (!isReset && !hasMoreRef.current) return;

      loadingRef.current = true;
      setStatus('loading');
      if (isReset) {
        setItems([]);
        setCursor(null);
        cursorRef.current = null;
        setHasMore(true);
        hasMoreRef.current = true;
      }

      try {
        const res = await listLikedTrips({
          limit,
          cursor: isReset ? null : cursorRef.current,
        });

        const filtered = filterTrips(res.items || [], { region, theme, days });
        const sorted = sortTrips(filtered, sort);

        setItems((prev) => (isReset ? sorted : [...prev, ...sorted]));
        setCursor(res.nextCursor || null);
        cursorRef.current = res.nextCursor || null;
        const more = !!res.nextCursor;
        setHasMore(more);
        hasMoreRef.current = more;
        setStatus('success');
      } catch (e) {
        setStatus('error');
      } finally {
        loadingRef.current = false;
      }
    },
    [user, limit, region, theme, days, sort],
  );

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadMore({ reset: true });
    }
    // 의도적으로 loadMore를 제외해 재생성으로 인한 무한 요청을 방지합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading, sort, region, theme, days]);

  return { items, hasMore, status, loadMore };
}
