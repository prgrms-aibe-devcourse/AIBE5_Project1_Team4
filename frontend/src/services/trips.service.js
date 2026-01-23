// src/services/trips.service.js
import { supabase } from '@/lib/supabaseClient';
import { unwrap, toAppError, logError } from '@/services/_core/errors';

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
  };
}

/**
 * 공개 Trip 리스트 조회 (RPC 기반)
 * @param {ListPublicTripsParams} params
 * @returns {Promise<{ items: PublicTripCard[], nextCursor: ({ createdAt: string, id: string } | null) }>}
 */
export async function listPublicTrips(params = {}) {
  const { q, limit = 20, cursor } = params;

  const context = 'tripsService.listPublicTrips';

  try {
    const realLimit = Math.max(1, Math.min(50, limit));

    const result = await supabase.rpc('list_public_trips', {
      p_limit: realLimit,
      p_q: q ?? null,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
    });

    const rows = unwrap(result, context) || [];

    const items = rows.map(mapRowToCard);

    const last = items[items.length - 1];
    const nextCursor =
      last && rows.length === realLimit
        ? { createdAt: last.created_at, id: last.id }
        : null;

    return { items, nextCursor };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}
