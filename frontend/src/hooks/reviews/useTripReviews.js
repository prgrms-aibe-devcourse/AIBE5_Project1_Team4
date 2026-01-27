// src/hooks/reviews/useTripReviews.js
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listTripReviews,
  getTripReviewStats,
} from '@/services/reviews.service';

/**
 * Trip 리뷰 목록 조회 훅 (내 리뷰 우선 정렬, 페이지네이션 지원)
 * @param {string} tripId
 * @param {{ limit?: number }} options
 */
export function useTripReviews(tripId, { limit = 20 } = {}) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ review_count: 0, avg_rating: null });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const loadingRef = useRef(false);

  // 새로고침 (처음부터 다시 로드)
  const refresh = useCallback(async () => {
    if (!tripId) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setStatus('loading');
    setError(null);

    try {
      const [reviewsData, statsData] = await Promise.all([
        listTripReviews(tripId, { limit, offset: 0 }),
        getTripReviewStats(tripId),
      ]);

      setReviews(reviewsData);
      setStats(statsData);
      setOffset(reviewsData.length);
      setHasMore(reviewsData.length >= limit);
      setStatus('success');
    } catch (e) {
      setError(e);
      setStatus('error');
    } finally {
      loadingRef.current = false;
    }
  }, [tripId, limit]);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (!tripId) return;
    if (!hasMore) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setError(null);

    try {
      const moreReviews = await listTripReviews(tripId, { limit, offset });

      setReviews((prev) => [...prev, ...moreReviews]);
      setOffset((prev) => prev + moreReviews.length);
      setHasMore(moreReviews.length >= limit);
    } catch (e) {
      setError(e);
    } finally {
      loadingRef.current = false;
    }
  }, [tripId, limit, offset, hasMore]);

  // tripId 변경 시 자동 새로고침
  useEffect(() => {
    if (tripId) {
      refresh();
    } else {
      setReviews([]);
      setStats({ review_count: 0, avg_rating: null });
      setOffset(0);
      setHasMore(true);
      setStatus('idle');
    }
  }, [tripId, refresh]);

  return {
    reviews,
    stats,
    hasMore,
    status,
    error,
    refresh,
    loadMore,
    isLoading: status === 'loading',
  };
}
