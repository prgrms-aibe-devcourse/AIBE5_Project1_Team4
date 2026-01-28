// src/hooks/trip-create/useTripCreateForm.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ------------------------------
// hoisted mocks
// ------------------------------
const {
  updateTripMemberRoleMock,
  getTripMembersMock,
  getTripDetailMock,
  toastMock,
} = vi.hoisted(() => ({
  updateTripMemberRoleMock: vi.fn(),
  getTripMembersMock: vi.fn(),
  getTripDetailMock: vi.fn(),
  toastMock: vi.fn(),
}));

// date utils (today 고정)
vi.mock('@/utils/date', () => ({
  getTodayString: () => '2026-01-28',
  formatLocalDate: (d) => {
    // 아주 단순한 YYYY-MM-DD 포맷 (테스트용)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },
}));

// trip-members
vi.mock('@/services/trip-members.service', () => ({
  updateTripMemberRole: updateTripMemberRoleMock,
  getTripMembers: getTripMembersMock,
}));

// trips / detail (여기서 실제로 뭘 하진 않지만, import 때문에 mock 필요)
vi.mock('@/services/trips.service', () => ({
  updateTripMeta: vi.fn(),
  deleteTrip: vi.fn(),
  adjustTripDates: vi.fn(),
}));

vi.mock('@/services/trips.detail.service', () => ({
  getTripDetail: getTripDetailMock,
}));

// place search hook
vi.mock('@/hooks/usePlaceSearch', () => ({
  usePlaceSearch: () => ({
    places: [],
    isLoading: false,
    canLoadMore: false,
    loadMore: vi.fn(),
  }),
}));

// add schedule hook
vi.mock('@/hooks/useAddScheduleItem', () => ({
  useAddScheduleItem: () => ({
    add: vi.fn(),
    isAdding: false,
    addingPlaceId: null,
  }),
}));

// toast
vi.mock('@/shared/ui/overlay', () => ({
  toast: toastMock,
}));

import { useTripCreateForm } from './useTripCreateForm';

describe('useTripCreateForm owner transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // trip detail 기본 mock (tripId 있을 때 effect로 호출됨)
    getTripDetailMock.mockResolvedValue({
      summary: {
        trip: {
          title: 't',
          startDate: '2026-01-28',
          endDate: '2026-01-30',
          visibility: 'public',
        },
      },
      schedule: { days: [] },
    });
  });

  it('tripId가 없고 members가 비어있으면 transferOwner는 아무 것도 하지 않는다 (현재 구현 기준)', () => {
    const { result } = renderHook(() => useTripCreateForm());

    act(() => {
      result.current.transferOwner('member-b');
    });

    expect(updateTripMemberRoleMock).not.toHaveBeenCalled();
    expect(getTripMembersMock).not.toHaveBeenCalled();
    // members 자체가 비어있으므로 isOwner 확인도 의미 없음
    expect(result.current.members).toEqual([]);
  });

  it('tripId가 있고 self(owner)일 때 transferOwner는 updateTripMemberRole 호출 후 API roles로 owner를 반영한다', async () => {
    // 1) 멤버 로딩: self가 owner여야 canManageMembers=true
    getTripMembersMock.mockResolvedValueOnce({
      data: {
        members: [
          {
            userId: 'member-a',
            role: 'owner',
            displayName: 'A',
            isSelf: true,
            avatarUrl: null,
          },
          {
            userId: 'member-b',
            role: 'editor',
            displayName: 'B',
            isSelf: false,
            avatarUrl: null,
          },
          {
            userId: 'member-c',
            role: 'editor',
            displayName: 'C',
            isSelf: false,
            avatarUrl: null,
          },
        ],
      },
    });

    // 2) owner transfer API 응답
    updateTripMemberRoleMock.mockResolvedValueOnce({
      data: {
        members: [
          { userId: 'member-b', role: 'owner' },
          { userId: 'member-a', role: 'editor' },
          { userId: 'member-c', role: 'editor' },
        ],
      },
    });

    const { result } = renderHook(() =>
      useTripCreateForm({ tripId: 'trip-1' }),
    );

    // 멤버 로딩 완료까지 대기
    await waitFor(() => {
      expect(getTripMembersMock).toHaveBeenCalledWith({ tripId: 'trip-1' });
      expect(result.current.members.length).toBeGreaterThan(0);
      expect(result.current.canManageMembers).toBe(true);
    });

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
      const b = result.current.members.find((m) => m.id === 'member-b');
      const a = result.current.members.find((m) => m.id === 'member-a');

      expect(b?.isOwner).toBe(true);
      expect(a?.isOwner).toBe(false);
    });
  });
});
