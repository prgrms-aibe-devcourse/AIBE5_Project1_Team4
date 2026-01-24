// src/hooks/useAiSuggest.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { suggestQuery } from '@/services/ai.service';

// 메모리 캐시 (세션 동안 유지)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5분

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * AI 검색 쿼리 제안 훅
 *
 * @param {string} query - 검색 쿼리
 * @param {Object} options
 * @param {number} [options.debounceMs=500] - 디바운스 시간 (ms)
 * @param {number} [options.minLength=2] - 최소 쿼리 길이
 * @param {boolean} [options.enabled=true] - 훅 활성화 여부
 * @returns {{
 *   normalizedQuery: string,
 *   suggestions: string[],
 *   isLoading: boolean,
 *   error: Error | null,
 *   refetch: () => Promise<void>
 * }}
 */
export function useAiSuggest(query, options = {}) {
  const { debounceMs = 300, minLength = 2, enabled = true } = options;

  const [normalizedQuery, setNormalizedQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const fetchSuggestions = useCallback(
    async (searchQuery) => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const trimmed = searchQuery?.trim().toLowerCase() || '';

      // 최소 길이 미만이면 초기화
      if (trimmed.length < minLength) {
        setNormalizedQuery('');
        setSuggestions([]);
        setError(null);
        return;
      }

      // 캐시 확인
      const cached = getCached(trimmed);
      if (cached) {
        setNormalizedQuery(cached.normalized_query);
        setSuggestions(cached.suggestions);
        setError(null);
        return;
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const result = await suggestQuery(trimmed, {
          signal: abortControllerRef.current.signal,
        });

        // 캐시에 저장
        setCache(trimmed, result);

        setNormalizedQuery(result.normalized_query);
        setSuggestions(result.suggestions);
      } catch (e) {
        // AbortError는 무시
        if (e.name === 'AbortError') return;

        setError(e);
        setNormalizedQuery('');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [minLength]
  );

  // 디바운스된 쿼리 요청
  useEffect(() => {
    if (!enabled) return;

    // 이전 타임아웃 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, enabled, fetchSuggestions]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const refetch = useCallback(() => {
    return fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  return {
    normalizedQuery,
    suggestions,
    isLoading,
    error,
    refetch,
  };
}
