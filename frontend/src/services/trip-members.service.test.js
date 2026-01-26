import { describe, it, expect, vi, beforeEach } from 'vitest';

const { invokeMock } = vi.hoisted(() => {
  const invokeMock = vi.fn();
  return { invokeMock };
});

vi.mock('@/services/_core/functions', () => ({
  invokeFunction: invokeMock,
}));

import { updateTripMemberRole } from './trip-members.service';

describe('updateTripMemberRole (service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes update-trip-member-role edge function with payload', async () => {
    invokeMock.mockResolvedValueOnce({ data: { ok: true } });

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
});
