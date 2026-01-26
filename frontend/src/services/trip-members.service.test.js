import { describe, it, expect, vi, beforeEach } from 'vitest';

const { invokeMock, rpcMock } = vi.hoisted(() => {
  const invokeMock = vi.fn();
  const rpcMock = vi.fn();
  return { invokeMock, rpcMock };
});

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    functions: { invoke: invokeMock },
    rpc: rpcMock,
  },
}));

import { updateTripMemberRole, getTripMembers } from './trip-members.service';

describe('updateTripMemberRole (service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes update-trip-member-role edge function with payload', async () => {
    invokeMock.mockResolvedValueOnce({ data: { ok: true }, error: null });

    const payload = {
      tripId: 'trip-1',
      memberId: 'member-1',
      role: 'owner',
    };

    await updateTripMemberRole(payload);

    expect(invokeMock).toHaveBeenCalledWith('update-trip-member-role', {
      body: payload,
    });
  });

  it('calls rpc_trip_members with trip id', async () => {
    rpcMock.mockResolvedValueOnce({ data: { members: [] }, error: null });

    await getTripMembers({ tripId: 'trip-1' });

    expect(rpcMock).toHaveBeenCalledWith('rpc_trip_members', {
      p_trip_id: 'trip-1',
    });
  });
});
