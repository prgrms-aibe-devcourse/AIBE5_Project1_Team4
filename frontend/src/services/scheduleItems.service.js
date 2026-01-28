// src/services/scheduleItems.service.js
import { supabase } from '@/lib/supabaseClient';
import { unwrap, AppError, toAppError, logError } from '@/services/_core/errors';

function requireRow(value, context, message = 'RPC returned empty result') {
  if (!value) throw new AppError({ kind: 'unknown', message, context });
  return value;
}

function normalizeTime(t) {
  if (t == null) return null;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

/**
 * upsert_schedule_item (기존 RPC 경유)
 * - id 있으면 update
 * - id 없으면 insert (tripDayId, placeId 필수)
 */
export async function upsertScheduleItem({
  id = null,
  tripDayId = null,
  placeId = null,
  time = null,
  durationMinutes = null,
  notes = null,
}) {
  const result = await supabase.rpc('upsert_schedule_item', {
    p_id: id,
    p_trip_day_id: tripDayId,
    p_place_id: placeId,
    p_time: normalizeTime(time),
    p_duration_minutes: durationMinutes,
    p_notes: notes,
  });
  const data = unwrap(result, 'scheduleItems.upsertScheduleItem');

  const itemId = data?.[0]?.out_id ?? data?.[0]?.id;
  return requireRow(
    itemId,
    'scheduleItems.upsertScheduleItem',
    'upsert_schedule_item returned no id',
  );
}

export async function deleteScheduleItem(id) {
  const result = await supabase.rpc('delete_schedule_item', {
    p_id: id,
  });
  const data = unwrap(result, 'scheduleItems.deleteScheduleItem');

  const deletedId = data?.[0]?.out_id ?? data?.[0]?.id;
  return requireRow(
    deletedId,
    'scheduleItems.deleteScheduleItem',
    'delete_schedule_item returned no id',
  );
}

/**
 * 장소 검색 결과 → 일정에 추가 (Edge Function 경유)
 *
 * add-schedule-item Edge Function을 호출하여:
 *   1. places 테이블에 upsert
 *   2. schedule_items에 insert
 * 를 하나의 트랜잭션으로 처리한다.
 *
 * @param {string} tripDayId - 대상 trip_day UUID
 * @param {object} place - 검색 결과 장소 객체
 * @param {string} place.provider - 'kakao'
 * @param {string} place.provider_place_id - 카카오 장소 ID
 * @param {string} place.name - 장소명
 * @param {string} [place.category] - 카테고리
 * @param {string} [place.address] - 지번 주소
 * @param {string} [place.road_address] - 도로명 주소
 * @param {string} [place.phone] - 전화번호
 * @param {number} place.latitude - 위도
 * @param {number} place.longitude - 경도
 * @param {object} [place.raw_data] - 원본 API 응답
 * @param {object} [options] - 추가 옵션
 * @param {string} [options.time] - 시간 (HH:MM 또는 HH:MM:SS)
 * @param {number} [options.durationMinutes] - 소요 시간(분)
 * @param {string} [options.notes] - 메모
 *
 * @returns {{ scheduleItemId: string, placeId: string, orderIndex: number }}
 */
export async function addScheduleItemWithPlace(tripDayId, place, options = {}) {
  const context = 'scheduleItems.addScheduleItemWithPlace';

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new AppError({ kind: 'auth', message: '로그인이 필요합니다.', context });
  }

  const body = {
    trip_day_id: tripDayId,
    place: {
      provider: place.provider,
      provider_place_id: place.provider_place_id,
      name: place.name,
      category: place.category ?? null,
      address: place.address ?? null,
      road_address: place.road_address ?? null,
      phone: place.phone ?? null,
      latitude: place.latitude,
      longitude: place.longitude,
      raw_data: place.raw_data ?? null,
    },
    time: normalizeTime(options.time) ?? null,
    duration_minutes: options.durationMinutes ?? null,
    notes: options.notes ?? null,
  };

  const response = await supabase.functions.invoke('add-schedule-item', {
    body,
  });

  // supabase.functions.invoke는 { data, error } 형태를 반환
  if (response.error) {
    const appErr = toAppError(response.error, context);
    logError(appErr);
    throw appErr;
  }

  const result = response.data;

  // Edge Function이 { error: ... } 형태로 에러를 반환한 경우
  if (result?.error) {
    throw new AppError({
      kind: classifyEdgeFunctionError(result.error),
      message: result.error,
      context,
    });
  }

  const row = result?.data;
  if (!row) {
    throw new AppError({
      kind: 'unknown',
      message: 'Edge Function returned no data',
      context,
    });
  }

  return {
    scheduleItemId: row.schedule_item_id,
    placeId: row.place_id,
    orderIndex: row.order_index,
  };
}

function classifyEdgeFunctionError(errorMessage) {
  if (!errorMessage) return 'unknown';
  const msg = errorMessage.toLowerCase();
  if (msg.includes('authorization') || msg.includes('token') || msg.includes('authentication')) return 'auth';
  if (msg.includes('permission') || msg.includes('forbidden')) return 'forbidden';
  if (msg.includes('not found')) return 'not_found';
  if (msg.includes('invalid') || msg.includes('required')) return 'validation';
  return 'unknown';
}
