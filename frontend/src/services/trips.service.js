// src/services/trips.service.js
import { supabase } from '@/lib/supabaseClient';
import {
  unwrap,
  toAppError,
  logError,
  AppError,
} from '@/services/_core/errors';

/**
 * 카드에서 바로 쓰는 DTO
 * @typedef {Object} PublicTripCard
 * @property {string} id
 * @property {string} title
 * @property {string|null} description
 * @property {string|null} cover_image_url
 * @property {string} start_date
 * @property {string} end_date
 * @property {string} created_at
 * @property {{ id: string, name: string, avatar_url: (string|null) }} author
 * @property {number} like_count
 * @property {number} bookmark_count
 * @property {number} member_count
 */

/**
 * @typedef {Object} ListPublicTripsParams
 * @property {string=} q
 * @property {number=} limit
 * @property {{ createdAt: string, id: string }=} cursor
 * @property {'latest'|'popular'=} sort
 */

function mapRowToCard(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.summary ?? null,
    cover_image_url: row.cover_image_url ?? null,
    start_date: row.start_date,
    end_date: row.end_date,
    created_at: row.created_at,
    author: {
      id: row.author_id,
      name: row.author_name,
      avatar_url: row.author_avatar_url,
    },
    like_count: Number(row.like_count) || 0,
    bookmark_count: Number(row.bookmark_count) || 0,
    member_count: Number(row.member_count) || 1,
    regions: row.regions ?? [],
    themes: row.themes ?? [],
  };
}/**
 * 내 여행 목록 조회 (Liked 방식과 100% 동일한 구조)
 */
export async function listMyTrips(params = {}) {
  const { limit = 10, cursor } = params;
  const context = 'tripsService.listMyTrips';

  try {
    // RPC 호출 (p_user_id 파라미터 제거, SQL 내부에서 처리함)
    const result = await supabase.rpc('list_my_trips', {
      p_limit: limit,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
    });

    const rows = unwrap(result, context) || [];
    
    // 매퍼(mapRowToCard) 재사용
    const items = rows.map(mapRowToCard);

    // 다음 페이지 커서 계산
    const last = items[items.length - 1];
    const nextCursor =
      last && rows.length === limit
        ? { createdAt: last.created_at, id: last.id }
        : null;

    return { items, nextCursor };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

/**
 * 공개 Trip 리스트 조회 (RPC 기반)
 * @param {ListPublicTripsParams} params
 * @returns {Promise<{ items: PublicTripCard[], nextCursor: ({ createdAt: string, id: string } | null) }>}
 */
/**
 * 필터 옵션 (지역/테마) 조회 - 여행 수 많은 순
 */
export async function getFilterOptions() {
  const context = 'tripsService.getFilterOptions';

  try {
    const [regionsResult, themesResult] = await Promise.all([
      supabase.rpc('get_region_filter_options'),
      supabase.rpc('get_theme_filter_options'),
    ]);

    const regions = unwrap(regionsResult, context) || [];
    const themes = unwrap(themesResult, context) || [];

    return {
      regions: regions.map((r) => ({
        name: r.name,
        slug: r.slug,
        count: Number(r.trip_count),
      })),
      themes: themes.map((t) => ({
        name: t.name,
        slug: t.slug,
        count: Number(t.trip_count),
      })),
    };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

export async function listPublicTrips(params = {}) {
  const { q, limit = 20, cursor, sort = 'latest' } = params;

  const context = 'tripsService.listPublicTrips';

  try {
    const realLimit = Math.max(1, Math.min(50, limit));

    const result = await supabase.rpc('list_public_trips', {
      p_limit: realLimit,
      p_q: q ?? null,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
      p_sort: sort,
    });

    const rows = unwrap(result, context) || [];

    const items = rows.map(mapRowToCard);

    const last = items[items.length - 1];
    // popular 정렬은 커서 기반 페이지네이션 미지원
    const nextCursor =
      sort === 'latest' && last && rows.length === realLimit
        ? { createdAt: last.created_at, id: last.id }
        : null;

    return { items, nextCursor };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}

function requireRow(value, context, message = 'RPC returned empty result') {
  if (!value) throw new AppError({ kind: 'unknown', message, context });
  return value;
}

export async function createTripDraft() {
  const result = await supabase.rpc('create_trip_draft');
  const data = unwrap(result, 'trips.createTripDraft');

  const tripId = data?.[0]?.trip_id;
  return requireRow(
    tripId,
    'trips.createTripDraft',
    'create_trip_draft returned no trip_id',
  );
}

export async function assertTripEditor({ tripId }) {
  const result = await supabase.rpc('assert_trip_editor', {
    p_trip_id: tripId,
  });
  unwrap(result, 'trips.assertTripEditor');
  return true;
}

export async function updateTripMeta({ tripId, title, summary, visibility }) {
  const result = await supabase.rpc('update_trip_meta', {
    p_trip_id: tripId,
    p_title: title ?? null,
    p_summary: summary ?? null,
    p_visibility: visibility ?? null,
  });
  const data = unwrap(result, 'trips.updateTripMeta');

  const id = data?.[0]?.trip_id;
  return requireRow(
    id,
    'trips.updateTripMeta',
    'update_trip_meta returned no trip_id',
  );
}

export async function adjustTripDates({ tripId, startDate, endDate }) {
  const result = await supabase.rpc('adjust_trip_dates', {
    p_trip_id: tripId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  const data = unwrap(result, 'trips.adjustTripDates');

  const id = data?.[0]?.trip_id ?? tripId;
  return requireRow(
    id,
    'trips.adjustTripDates',
    'adjust_trip_dates returned no trip_id',
  );
}

export async function deleteTrip({ tripId }) {
  const result = await supabase.rpc('delete_trip', {
    p_trip_id: tripId,
  });
  const data = unwrap(result, 'trips.deleteTrip');

  const id = data?.[0]?.trip_id;
  return requireRow(
    id,
    'trips.deleteTrip',
    'delete_trip returned no trip_id',
  );
}

/**
 * 사용자가 좋아요한 여행 목록 조회 (최신순 + 커서 페이지네이션)
 * @param {{ limit?: number, cursor?: { createdAt: string, id: string } }} params
 * @returns {Promise<{ items: PublicTripCard[], nextCursor: ({ createdAt: string, id: string } | null) }>}
 */
export async function listLikedTrips(params = {}) {
  const { limit = 10, cursor } = params;
  const context = 'tripsService.listLikedTrips';

  try {
    // RPC 호출
    const result = await supabase.rpc('list_liked_trips', {
      p_limit: limit,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
    });

    const rows = unwrap(result, context) || [];
    
    // 기존에 만들어둔 매퍼(mapRowToCard)를 재사용해 DTO 변환
    const items = rows.map(mapRowToCard);

    // 다음 페이지 커서 계산
    const last = items[items.length - 1];
    const nextCursor =
      last && rows.length === limit
        ? { createdAt: last.created_at, id: last.id }
        : null;

    return { items, nextCursor };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}