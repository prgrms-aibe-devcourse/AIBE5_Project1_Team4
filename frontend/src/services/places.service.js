// src/services/places.service.js
import { supabase } from '@/lib/supabaseClient';
import { invokeFunction } from '@/services/_core/functions';
import { AppError, unwrap } from '@/services/_core/errors';

function requireRow(value, context, message = 'Update returned empty result') {
  if (!value) throw new AppError({ kind: 'unknown', message, context });
  return value;
}

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

export async function updatePlaceName({ placeId, name }) {
  const context = 'places.updatePlaceName';

  const result = await supabase.rpc('rpc_update_place_name', {
    p_place_id: placeId,
    p_name: name,
  });

  const data = unwrap(result, context);

  // RPC가 returns uuid 인 경우:
  // - Supabase JS는 보통 data가 uuid 단일값 or [{...}] 형태로 올 수 있어서 둘 다 커버
  const id =
    typeof data === 'string'
      ? data
      : (data?.[0]?.id ?? data?.[0]?.p_place_id ?? data?.[0]?.place_id);

  return requireRow(id, context, 'update place name returned no id');
}
