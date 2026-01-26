import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { updateTripMemberRoleMock } = vi.hoisted(() => {
  const updateTripMemberRoleMock = vi.fn();
  return { updateTripMemberRoleMock };
});

vi.mock('@/services/trip-members.service', () => ({
  updateTripMemberRole: updateTripMemberRoleMock,
}));

import { useTripCreateForm } from './useTripCreateForm';

describe('useTripCreateForm owner transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates owner locally when tripId is not provided', () => {
    const { result } = renderHook(() => useTripCreateForm());

    act(() => {
      result.current.transferOwner('member-b');
    });

    expect(updateTripMemberRoleMock).not.toHaveBeenCalled();
    expect(
      result.current.members.find((member) => member.id === 'member-b')?.isOwner,
    ).toBe(true);
  });

  it('calls updateTripMemberRole and syncs owner from API roles', async () => {
    updateTripMemberRoleMock.mockResolvedValueOnce({
      data: {
        members: [
          { userId: 'member-b', role: 'owner' },
          { userId: 'member-a', role: 'editor' },
          { userId: 'member-c', role: 'editor' },
        ],
      },
    });

    const { result } = renderHook(() => useTripCreateForm({ tripId: 'trip-1' }));

    act(() => {
      result.current.transferOwner('member-b');
    });

    await waitFor(() => {
      expect(updateTripMemberRoleMock).toHaveBeenCalledWith({
        tripId: 'trip-1',
        memberId: 'member-b',
        role: 'owner',
      });
    });

    await waitFor(() => {
      expect(
        result.current.members.find((member) => member.id === 'member-b')?.isOwner,
      ).toBe(true);
    });
  });
});
