// src/services/reviews.service.js
import { supabase } from '@/lib/supabaseClient';
import { unwrap, toAppError, logError } from '@/services/_core/errors';

const CONTEXT = 'reviewsService';

// =====================================================
// Type Definitions (JSDoc)
// =====================================================

/**
 * @typedef {Object} ReviewAuthor
 * @property {string} id
 * @property {string} username
 * @property {string|null} full_name
 * @property {string|null} avatar_url
 */

/**
 * @typedef {Object} TripReview
 * @property {string} id
 * @property {string} trip_id
 * @property {string} author_id
 * @property {number} rating
 * @property {string|null} content
 * @property {string} created_at
 * @property {string} updated_at
 * @property {ReviewAuthor} author
 * @property {boolean} is_mine
 */

/**
 * @typedef {Object} PlaceReview
 * @property {string} id
 * @property {string} place_id
 * @property {string} author_id
 * @property {number} rating
 * @property {string|null} content
 * @property {string} created_at
 * @property {string} updated_at
 * @property {ReviewAuthor} author
 * @property {boolean} is_mine
 */

/**
 * @typedef {Object} ReviewStats
 * @property {number} review_count
 * @property {number|null} avg_rating
 */

/**
 * @typedef {Object} MyReview
 * @property {string} id
 * @property {number} rating
 * @property {string|null} content
 * @property {string} created_at
 * @property {string} updated_at
 */

// =====================================================
// Mappers
// =====================================================

/**
 * RPC 결과를 TripReview DTO로 변환
 */
function mapTripReviewRow(row) {
  return {
    id: row.id,
    trip_id: row.trip_id,
    author_id: row.author_id,
    rating: row.rating,
    content: row.content ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      full_name: row.author_full_name ?? null,
      avatar_url: row.author_avatar_url ?? null,
    },
    is_mine: row.is_mine ?? false,
  };
}

/**
 * RPC 결과를 PlaceReview DTO로 변환
 */
function mapPlaceReviewRow(row) {
  return {
    id: row.id,
    place_id: row.place_id,
    author_id: row.author_id,
    rating: row.rating,
    content: row.content ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      full_name: row.author_full_name ?? null,
      avatar_url: row.author_avatar_url ?? null,
    },
    is_mine: row.is_mine ?? false,
  };
}

// =====================================================
// Trip Reviews
// =====================================================

/**
 * Trip 리뷰 목록 조회 (내 리뷰 우선 정렬)
 * @param {string} tripId
 * @param {{ limit?: number, offset?: number }} options
 * @returns {Promise<TripReview[]>}
 */
export async function listTripReviews(tripId, options = {}) {
  const { limit = 20, offset = 0 } = options;
  const context = `${CONTEXT}.listTripReviews`;

  try {
    const result = await supabase.rpc('list_trip_reviews', {
      p_trip_id: tripId,
      p_limit: limit,
      p_offset: offset,
    });

    const rows = unwrap(result, context) || [];
    return rows.map(mapTripReviewRow);
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * Trip 리뷰 생성/수정 (Upsert)
 * @param {string} tripId
 * @param {{ rating: number, content?: string }} data
 * @returns {Promise<MyReview>}
 */
export async function upsertTripReview(tripId, { rating, content }) {
  const context = `${CONTEXT}.upsertTripReview`;

  try {
    const result = await supabase.rpc('upsert_trip_review', {
      p_trip_id: tripId,
      p_rating: rating,
      p_content: content ?? null,
    });

    const data = unwrap(result, context);
    return data;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * Trip 리뷰 삭제
 * @param {string} tripId
 * @returns {Promise<boolean>}
 */
export async function deleteTripReview(tripId) {
  const context = `${CONTEXT}.deleteTripReview`;

  try {
    const result = await supabase.rpc('delete_trip_review', {
      p_trip_id: tripId,
    });

    const deleted = unwrap(result, context);
    return deleted === true;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * 내 Trip 리뷰 조회 (편집 폼용)
 * @param {string} tripId
 * @returns {Promise<MyReview|null>}
 */
export async function getMyTripReview(tripId) {
  const context = `${CONTEXT}.getMyTripReview`;

  try {
    const result = await supabase.rpc('get_my_trip_review', {
      p_trip_id: tripId,
    });

    const data = unwrap(result, context);
    return data ?? null;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * Trip 리뷰 통계 조회
 * @param {string} tripId
 * @returns {Promise<ReviewStats>}
 */
export async function getTripReviewStats(tripId) {
  const context = `${CONTEXT}.getTripReviewStats`;

  try {
    const result = await supabase.rpc('get_trip_review_stats', {
      p_trip_id: tripId,
    });

    const rows = unwrap(result, context) || [];
    const row = rows[0] || { review_count: 0, avg_rating: null };

    return {
      review_count: Number(row.review_count) || 0,
      avg_rating: row.avg_rating ? Number(row.avg_rating) : null,
    };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

// =====================================================
// Place Reviews
// =====================================================

/**
 * Place 리뷰 목록 조회 (내 리뷰 우선 정렬)
 * @param {string} placeId
 * @param {{ limit?: number, offset?: number }} options
 * @returns {Promise<PlaceReview[]>}
 */
export async function listPlaceReviews(placeId, options = {}) {
  const { limit = 20, offset = 0 } = options;
  const context = `${CONTEXT}.listPlaceReviews`;

  try {
    const result = await supabase.rpc('list_place_reviews', {
      p_place_id: placeId,
      p_limit: limit,
      p_offset: offset,
    });

    const rows = unwrap(result, context) || [];
    return rows.map(mapPlaceReviewRow);
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * Place 리뷰 생성/수정 (Upsert)
 * @param {string} placeId
 * @param {{ rating: number, content?: string }} data
 * @returns {Promise<MyReview>}
 */
export async function upsertPlaceReview(placeId, { rating, content }) {
  const context = `${CONTEXT}.upsertPlaceReview`;

  try {
    const result = await supabase.rpc('upsert_place_review', {
      p_place_id: placeId,
      p_rating: rating,
      p_content: content ?? null,
    });

    const data = unwrap(result, context);
    return data;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * Place 리뷰 삭제
 * @param {string} placeId
 * @returns {Promise<boolean>}
 */
export async function deletePlaceReview(placeId) {
  const context = `${CONTEXT}.deletePlaceReview`;

  try {
    const result = await supabase.rpc('delete_place_review', {
      p_place_id: placeId,
    });

    const deleted = unwrap(result, context);
    return deleted === true;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * 내 Place 리뷰 조회 (편집 폼용)
 * @param {string} placeId
 * @returns {Promise<MyReview|null>}
 */
export async function getMyPlaceReview(placeId) {
  const context = `${CONTEXT}.getMyPlaceReview`;

  try {
    const result = await supabase.rpc('get_my_place_review', {
      p_place_id: placeId,
    });

    const data = unwrap(result, context);
    return data ?? null;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * Place 리뷰 통계 조회
 * @param {string} placeId
 * @returns {Promise<ReviewStats>}
 */
export async function getPlaceReviewStats(placeId) {
  const context = `${CONTEXT}.getPlaceReviewStats`;

  try {
    const result = await supabase.rpc('get_place_review_stats', {
      p_place_id: placeId,
    });

    const rows = unwrap(result, context) || [];
    const row = rows[0] || { review_count: 0, avg_rating: null };

    return {
      review_count: Number(row.review_count) || 0,
      avg_rating: row.avg_rating ? Number(row.avg_rating) : null,
    };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

// =====================================================
// Batch Operations (Optional - for performance)
// =====================================================

/**
 * 여러 Trip의 리뷰 통계를 한번에 조회
 * @param {string[]} tripIds
 * @returns {Promise<Record<string, ReviewStats>>}
 */
export async function getTripReviewStatsBatch(tripIds) {
  const context = `${CONTEXT}.getTripReviewStatsBatch`;

  if (!tripIds || tripIds.length === 0) {
    return {};
  }

  try {
    // View를 직접 쿼리 (RPC 대신)
    const result = await supabase
      .from('trip_review_stats')
      .select('trip_id, review_count, avg_rating')
      .in('trip_id', tripIds);

    const rows = unwrap(result, context) || [];

    const statsMap = {};
    for (const row of rows) {
      statsMap[row.trip_id] = {
        review_count: Number(row.review_count) || 0,
        avg_rating: row.avg_rating ? Number(row.avg_rating) : null,
      };
    }

    // 리뷰가 없는 trip은 기본값
    for (const id of tripIds) {
      if (!statsMap[id]) {
        statsMap[id] = { review_count: 0, avg_rating: null };
      }
    }

    return statsMap;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * 여러 Place의 리뷰 통계를 한번에 조회
 * @param {string[]} placeIds
 * @returns {Promise<Record<string, ReviewStats>>}
 */
export async function getPlaceReviewStatsBatch(placeIds) {
  const context = `${CONTEXT}.getPlaceReviewStatsBatch`;

  if (!placeIds || placeIds.length === 0) {
    return {};
  }

  try {
    // View를 직접 쿼리 (RPC 대신)
    const result = await supabase
      .from('place_review_stats')
      .select('place_id, review_count, avg_rating')
      .in('place_id', placeIds);

    const rows = unwrap(result, context) || [];

    const statsMap = {};
    for (const row of rows) {
      statsMap[row.place_id] = {
        review_count: Number(row.review_count) || 0,
        avg_rating: row.avg_rating ? Number(row.avg_rating) : null,
      };
    }

    // 리뷰가 없는 place는 기본값
    for (const id of placeIds) {
      if (!statsMap[id]) {
        statsMap[id] = { review_count: 0, avg_rating: null };
      }
    }

    return statsMap;
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}
