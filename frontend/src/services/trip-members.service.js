import { supabase } from '@/lib/supabaseClient';
import { unwrap, isConflictError } from '@/services/_core/errors';

/**
 * [UPDATE] 멤버 권한 변경 (RPC 사용)
 * Edge Function 대신 RPC를 사용하여 RLS 문제를 회피합니다.
 */
export async function updateTripMemberRole({ tripId, memberId, role }) {
  console.log("🚀 [Service] 권한 변경 요청 (RPC):", { tripId, memberId, role });

  // Edge Function 대신 새로 만든 RPC 함수 호출
  const result = await supabase.rpc('rpc_update_member_role', {
    p_trip_id: tripId,
    p_member_id: memberId,
    p_new_role: role,
  });

  return unwrap(result, 'tripMembers.updateTripMemberRole');
}

/**
 * [READ] 여행 참여자 목록 조회
 */
export async function getTripMembers({ tripId }) {
  const result = await supabase.rpc('rpc_trip_members', {
    p_trip_id: tripId,
  });
  return unwrap(result, 'tripMembers.getTripMembers');
}

/**
 * [CREATE] 멤버 추가
 */
export async function upsertTripMember({ tripId, userId, role }) {
  const result = await supabase
    .from('trip_members')
    .upsert(
      { trip_id: tripId, user_id: userId, role },
      { onConflict: 'trip_id,user_id' }
    );
  return unwrap(result, 'tripMembers.upsertTripMember');
}

/**
 * [DELETE] 멤버 내보내기 (강퇴)
 * RPC: rpc_delete_member
 */
export async function deleteTripMember({ tripId, memberId }) {
  const result = await supabase.rpc('rpc_delete_member', {
    p_trip_id: tripId,
    p_member_id: memberId,
  });
  return unwrap(result, 'tripMembers.deleteTripMember');
}