// src/services/trips.detail.service.js
import { supabase } from '@/lib/supabaseClient';
import { unwrap } from '@/services/_core/errors';

/**
 * 상세 요약 조회
 * - rpc_trip_detail_summary(p_trip_id uuid)
 * - returns jsonb
 */
export async function getTripDetailSummary(tripId) {
  const result = await supabase.rpc('rpc_trip_detail_summary', {
    p_trip_id: tripId,
  });
  return unwrap(result, 'trips.detail.getTripDetailSummary');
}

/**
 * 상세 일정 조회 (days -> items -> place(lat/lng))
 * - rpc_trip_detail_schedule(p_trip_id uuid)
 * - returns jsonb
 */
export async function getTripDetailSchedule(tripId) {
  const result = await supabase.rpc('rpc_trip_detail_schedule', {
    p_trip_id: tripId,
  });
  return unwrap(result, 'trips.detail.getTripDetailSchedule');
}

/**
 * 여행 멤버 조회
 * - rpc_trip_members(p_trip_id uuid)
 * - returns jsonb { tripId, members: [{ userId, role, displayName, isSelf }] }
 */
export async function getTripMembers(tripId) {
  try {
    const result = await supabase.rpc('rpc_trip_members', {
      p_trip_id: tripId,
    });
    return unwrap(result, 'trips.detail.getTripMembers');
  } catch (e) {
    console.warn('[rpc_trip_members] ignored:', e);
    return { tripId, members: [] };
  }
}

/**
 * 상세 전체(요약+일정+멤버) 병렬 조회
 * - UI에서 1번에 쓰고 싶을 때 사용
 */
export async function getTripDetail(tripId) {
  const results = await Promise.allSettled([
    getTripDetailSummary(tripId),
    getTripDetailSchedule(tripId),
    getTripMembers(tripId),
  ]);

  const summary =
    results[0].status === 'fulfilled'
      ? results[0].value
      : (console.warn('[rpc_trip_detail_summary] ignored:', results[0].reason),
        null);

  const schedule =
    results[1].status === 'fulfilled'
      ? results[1].value
      : (console.warn('[rpc_trip_detail_schedule] ignored:', results[1].reason),
        null);

  const members =
    results[2].status === 'fulfilled'
      ? results[2].value
      : (console.warn('[rpc_trip_members] ignored:', results[2].reason),
        { tripId, members: [] });

  return { summary, schedule, members };
}
