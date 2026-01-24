// src/services/ai.service.js
import { invokeFunction } from './_core/functions';
import { toAppError, logError } from './_core/errors';

/**
 * AI 쿼리 제안 응답
 * @typedef {Object} AiSuggestResult
 * @property {string} normalized_query - 정규화된 쿼리
 * @property {string[]} suggestions - 추천 검색어 목록
 * @property {string} original_query - 원본 쿼리
 */

/**
 * AI를 활용한 검색 쿼리 제안
 * - 오타 수정 및 정규화
 * - 연관 검색어 제안
 *
 * @param {string} query - 원본 검색 쿼리
 * @param {Object} options
 * @param {AbortSignal} [options.signal] - 취소 시그널
 * @returns {Promise<AiSuggestResult>}
 */
export async function suggestQuery(query, { signal } = {}) {
  const context = 'aiService.suggestQuery';

  if (!query || query.trim().length === 0) {
    return {
      normalized_query: '',
      suggestions: [],
      original_query: '',
    };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length > 200) {
    throw toAppError(
      { status: 400, message: '검색어는 200자 이하로 입력해주세요.' },
      context
    );
  }

  try {
    const result = await invokeFunction('ai-suggest-query', {
      body: { q: trimmedQuery },
      signal,
    });

    // Edge Function 응답: { data: { normalized_query, suggestions, original_query } }
    const data = result?.data || result;

    return {
      normalized_query: data?.normalized_query || trimmedQuery,
      suggestions: data?.suggestions || [],
      original_query: trimmedQuery,
    };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}
