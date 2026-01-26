// src/hooks/trips/useBookmarkedTrips.js
import { useState, useCallback, useEffect } from 'react';
import { listBookmarkedTrips } from '@/services/bookmark.service';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useBookmarkedTrips({ 
  limit = 12, sort = 'latest', region = '전체', theme = '전체', days = null 
} = {}) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState('idle');

  const loadMore = useCallback(async (isInitial = false) => {
    if (!user?.id || status === 'loading' || (!isInitial && !hasMore)) return;

    setStatus('loading');
    try {
      const res = await listBookmarkedTrips({
        userId: user.id,
        limit,
        cursor: isInitial ? null : cursor,
        sort, 
        region, 
        theme, 
        days
      });

      setItems(prev => isInitial ? res.items : [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
      setStatus('success');
    } catch (e) {
      setStatus('error');
    }
  }, [user, cursor, hasMore, status, limit, sort, region, theme, days]);

  // ✅ 핵심: 필터 조건(sort, region, theme, days)이 바뀔 때마다 loadMore(true)를 실행합니다.
  useEffect(() => {
    if (!authLoading && user?.id) {
      loadMore(true); // 데이터를 초기화하고 새로 가져옴
    }
  }, [user?.id, authLoading, sort, region, theme, days]); // 👈 이 부분이 필터 작동의 핵심입니다!

  return { items, hasMore, status, loadMore };
}