import { invokeFunction } from '@/services/_core/functions';

/**
 * Update a trip member role (owner/editor).
 * Uses Edge Function: update-trip-member-role
 */
export async function updateTripMemberRole({ tripId, memberId, role }) {
  return invokeFunction('update-trip-member-role', {
    body: { tripId, memberId, role },
  });
}
