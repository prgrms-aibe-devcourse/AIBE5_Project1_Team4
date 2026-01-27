// src/hooks/reviews/usePlaceReviews.js
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listPlaceReviews,
  getPlaceReviewStats,
} from '@/services/reviews.service';

/**
 * Place 리뷰 목록 조회 훅 (내 리뷰 우선 정렬, 페이지네이션 지원)
 * @param {string} placeId
 * @param {{ limit?: number }} options
 */
export function usePlaceReviews(placeId, { limit = 20 } = {}) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ review_count: 0, avg_rating: null });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const loadingRef = useRef(false);

  // 새로고침 (처음부터 다시 로드)
  const refresh = useCallback(async () => {
    if (!placeId) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setStatus('loading');
    setError(null);

    try {
      const [reviewsData, statsData] = await Promise.all([
        listPlaceReviews(placeId, { limit, offset: 0 }),
        getPlaceReviewStats(placeId),
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
  }, [placeId, limit]);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (!placeId) return;
    if (!hasMore) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setError(null);

    try {
      const moreReviews = await listPlaceReviews(placeId, { limit, offset });

      setReviews((prev) => [...prev, ...moreReviews]);
      setOffset((prev) => prev + moreReviews.length);
      setHasMore(moreReviews.length >= limit);
    } catch (e) {
      setError(e);
    } finally {
      loadingRef.current = false;
    }
  }, [placeId, limit, offset, hasMore]);

  // placeId 변경 시 자동 새로고침
  useEffect(() => {
    if (placeId) {
      refresh();
    } else {
      setReviews([]);
      setStats({ review_count: 0, avg_rating: null });
      setOffset(0);
      setHasMore(true);
      setStatus('idle');
    }
  }, [placeId, refresh]);

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
