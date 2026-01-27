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
  const result = await supabase.rpc('rpc_trip_members', {
    p_trip_id: tripId,
  });
  return unwrap(result, 'trips.detail.getTripMembers');
}

/**
 * 상세 전체(요약+일정+멤버) 병렬 조회
 * - UI에서 1번에 쓰고 싶을 때 사용
 */
export async function getTripDetail(tripId) {
  const [summary, schedule, members] = await Promise.all([
    getTripDetailSummary(tripId),
    getTripDetailSchedule(tripId),
    getTripMembers(tripId),
  ]);

  return { summary, schedule, members };
}
