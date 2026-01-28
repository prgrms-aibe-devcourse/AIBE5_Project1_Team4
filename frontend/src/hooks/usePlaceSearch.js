// src/hooks/usePlaceSearch.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { searchPlaces } from '@/services/places.service';

/**
 * 장소 검색 훅
 *
 * - query 변경 시 디바운스(debounceMs) 후 검색
 * - AbortController로 이전 요청 자동 취소
 * - page 관리 + 결과 누적 (loadMore)
 * - meta.is_end 기반 canLoadMore 판단
 *
 * @param {string} query - 검색 키워드
 * @param {object} [options]
 * @param {number} [options.debounceMs=500] - 디바운스 시간
 * @param {number} [options.minLength=1] - 최소 검색어 길이
 * @param {boolean} [options.enabled=true] - 훅 활성화 여부
 * @param {number} [options.size=15] - 페이지당 결과 수
 */
export function usePlaceSearch(query, options = {}) {
  const { debounceMs = 500, minLength = 1, enabled = true, size = 15 } = options;

  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(false);

  const pageRef = useRef(1);
  const abortRef = useRef(null);
  const timeoutRef = useRef(null);

  // 내부 검색 실행 (page 지정)
  const execute = useCallback(
    async (searchQuery, page) => {
      // 이전 요청 취소
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const result = await searchPlaces({
          query: searchQuery,
          page,
          size,
        });

        const nextPlaces = result.places ?? [];
        const meta = result.meta ?? {};

        if (page === 1) {
          setPlaces(nextPlaces);
        } else {
          setPlaces((prev) => [...prev, ...nextPlaces]);
        }

        pageRef.current = page;
        setCanLoadMore(!meta.is_end);
      } catch (e) {
        if (e.name === 'AbortError') return;
        setError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [size],
  );

  // query 변경 → 디바운스 → page 1로 검색
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const trimmed = query?.trim() ?? '';

    if (trimmed.length < minLength) {
      setPlaces([]);
      setCanLoadMore(false);
      setError(null);
      pageRef.current = 1;
      return;
    }

    timeoutRef.current = setTimeout(() => {
      execute(trimmed, 1);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, minLength, enabled, execute]);

  // 더보기
  const loadMore = useCallback(() => {
    const trimmed = query?.trim() ?? '';
    if (!canLoadMore || isLoading || trimmed.length < minLength) return;
    execute(trimmed, pageRef.current + 1);
  }, [query, canLoadMore, isLoading, minLength, execute]);

  // 초기화
  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPlaces([]);
    setCanLoadMore(false);
    setError(null);
    setIsLoading(false);
    pageRef.current = 1;
  }, []);

  // 언마운트 정리
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    places,
    isLoading,
    error,
    canLoadMore,
    loadMore,
    reset,
  };
}
