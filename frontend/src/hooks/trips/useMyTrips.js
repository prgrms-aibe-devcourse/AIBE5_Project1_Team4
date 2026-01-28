// src/hooks/trips/useMyTrips.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { listMyTrips } from '@/services/mytrips.service';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useMyTrips({ 
  limit = 12, sort = 'latest', region = '전체', theme = '전체', days = null 
} = {}) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState('idle');
  const [popularLimit, setPopularLimit] = useState(limit);

  // 중복 호출 방지
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!user?.id || loadingRef.current) return;
    
    loadingRef.current = true;
    setStatus('loading');

    try {
      const res = await listMyTrips({
        userId: user.id,
        limit,
        cursor: null, // 초기화
        sort, 
        region, 
        theme, 
        days
      });

      setItems(res.items);
      setCursor(res.nextCursor);
      setPopularLimit(limit);
      
      // 인기순일 때: limit 기반 hasMore 판단
      if (sort === 'popular') {
        setHasMore(res.items.length === limit && limit < 100);
      } else {
        // 최신순일 때: cursor 기반 hasMore 판단
        setHasMore(!!res.nextCursor);
      }
      
      setStatus('success');
    } catch (e) {
      setStatus('error');
      setItems([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
    }
  }, [user?.id, limit, sort, region, theme, days]);

  const loadMore = useCallback(async () => {
    if (!user?.id || loadingRef.current || !hasMore) return;

    loadingRef.current = true;

    try {
      if (sort === 'popular') {
        // 인기순: limit을 증가시키는 방식 (cursor 없음)
        const nextLimit = Math.min(popularLimit + limit, 100);
        if (nextLimit === popularLimit) {
          setHasMore(false);
          setStatus('success');
          loadingRef.current = false;
          return;
        }

        const res = await listMyTrips({
          userId: user.id,
          limit: nextLimit,
          cursor: null, // cursor 사용 안 함
          sort,
          region,
          theme,
          days
        });

        setItems(res.items);
        setPopularLimit(nextLimit);
        setHasMore(res.items.length === nextLimit && nextLimit < 100);
      } else {
        // 최신순: cursor 기반 방식 유지
        if (!cursor) {
          loadingRef.current = false;
          return;
        }

        const res = await listMyTrips({
          userId: user.id,
          limit,
          cursor,
          sort,
          region,
          theme,
          days
        });

        setItems(prev => [...prev, ...res.items]);
        setCursor(res.nextCursor);
        setHasMore(!!res.nextCursor);
      }
      
      setStatus('success');
    } catch (e) {
      console.error('추가 로딩 실패:', e);
      setStatus('error');
    } finally {
      loadingRef.current = false;
    }
  }, [user?.id, cursor, hasMore, limit, sort, region, theme, days, popularLimit]);

  // 필터 조건이 바뀔 때마다 새로고침
  useEffect(() => {
    if (!authLoading && user?.id) {
      refresh();
    }
  }, [authLoading, refresh]);

  return { items, hasMore, status, loadMore };
}
