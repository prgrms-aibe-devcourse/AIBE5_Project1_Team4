import { supabase } from '@/lib/supabaseClient';
import { unwrap } from '@/services/_core/errors';

/**
 * Update a trip member role (owner/editor).
 * Uses Edge Function: update-trip-member-role
 */
export async function updateTripMemberRole({ tripId, memberId, role }) {
  const result = await supabase.functions.invoke('update-trip-member-role', {
    body: { tripId, memberId, role },
  });
  return unwrap(result, 'tripMembers.updateTripMemberRole');
}

/**
 * Fetch trip members with roles.
 * Uses RPC: rpc_trip_members(p_trip_id uuid)
 */
export async function getTripMembers({ tripId }) {
  const result = await supabase.rpc('rpc_trip_members', {
    p_trip_id: tripId,
  });
  return unwrap(result, 'tripMembers.getTripMembers');
}

export async function upsertTripMember({ tripId, userId, role }) {
  const result = await supabase
    .from('trip_members')
    .upsert(
      {
        trip_id: tripId,
        user_id: userId,
        role,
      },
      { onConflict: 'trip_id,user_id' },
    );
  return unwrap(result, 'tripMembers.upsertTripMember');
}
