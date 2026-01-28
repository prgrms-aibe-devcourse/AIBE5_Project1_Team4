// src/services/places.service.js
import { invokeFunction } from '@/services/_core/functions';

/**
 * 장소 검색 (search-place Edge Function 경유)
 *
 * @param {object} params
 * @param {string} params.query - 검색 키워드
 * @param {number} [params.page=1]
 * @param {number} [params.size=15]
 * @param {number} [params.latitude]
 * @param {number} [params.longitude]
 * @param {number} [params.radius]
 * @returns {Promise<{ places: Array, meta: { total, page, size, is_end } }>}
 */
export async function searchPlaces({
  query,
  page = 1,
  size = 15,
  latitude,
  longitude,
  radius,
}) {
  const result = await invokeFunction('search-place', {
    body: { query, page, size, latitude, longitude, radius },
  });

  return (
    result?.data ?? { places: [], meta: { total: 0, page, size, is_end: true } }
  );
}
