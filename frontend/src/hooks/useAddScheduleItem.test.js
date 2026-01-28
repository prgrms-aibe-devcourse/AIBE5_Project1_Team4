// src/hooks/useAddScheduleItem.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddScheduleItem } from './useAddScheduleItem';

// ✅ hoist-safe mock
vi.mock('@/services/scheduleItems.service', () => {
  return {
    addScheduleItemWithPlace: vi.fn(),
  };
});

import { addScheduleItemWithPlace } from '@/services/scheduleItems.service';

function flushPromises() {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('useAddScheduleItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const tripDayId = 'day-1';
  const place = {
    provider: 'kakao',
    provider_place_id: 'kakao-123',
    name: '테스트 장소',
    latitude: 37.1,
    longitude: 127.1,
  };

  it('tripDayId가 없으면 add는 null을 반환하고 아무것도 하지 않는다', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useAddScheduleItem(null, { onSuccess, onError }),
    );

    let out;
    await act(async () => {
      out = await result.current.add(place);
      await flushPromises();
    });

    expect(out).toBeNull();
    expect(addScheduleItemWithPlace).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('성공: addScheduleItemWithPlace 호출 후 result를 반환하고 onSuccess를 호출한다', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    addScheduleItemWithPlace.mockResolvedValueOnce({
      scheduleItemId: 'si-1',
      placeId: 'p-1',
      orderIndex: 0,
    });

    const { result } = renderHook(() =>
      useAddScheduleItem(tripDayId, { onSuccess, onError }),
    );

    let out;
    await act(async () => {
      out = await result.current.add(place, { time: '09:30', notes: 'memo' });
      await flushPromises();
    });

    expect(addScheduleItemWithPlace).toHaveBeenCalledWith(tripDayId, place, {
      time: '09:30',
      notes: 'memo',
    });

    expect(out).toEqual({
      scheduleItemId: 'si-1',
      placeId: 'p-1',
      orderIndex: 0,
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      {
        scheduleItemId: 'si-1',
        placeId: 'p-1',
        orderIndex: 0,
      },
      place,
    );

    expect(onError).not.toHaveBeenCalled();
    expect(result.current.error).toBe(null);
    expect(result.current.isAdding).toBe(false);
    expect(result.current.addingPlaceId).toBe(null);
  });

  it('실패: addScheduleItemWithPlace가 throw하면 null 반환 + error set + onError 호출', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const err = new Error('failed');
    addScheduleItemWithPlace.mockRejectedValueOnce(err);

    const { result } = renderHook(() =>
      useAddScheduleItem(tripDayId, { onSuccess, onError }),
    );

    let out;
    await act(async () => {
      out = await result.current.add(place);
      await flushPromises();
    });

    expect(out).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(err, place);

    expect(result.current.error).toBe(err);
    expect(result.current.isAdding).toBe(false);
    expect(result.current.addingPlaceId).toBe(null);
  });

  it('호출 중 상태: add 시작 시 isAdding=true, addingPlaceId 설정 → 완료 후 원복된다', async () => {
    let resolveFn;
    const pending = new Promise((resolve) => {
      resolveFn = resolve;
    });

    addScheduleItemWithPlace.mockReturnValueOnce(pending);

    const { result } = renderHook(() => useAddScheduleItem(tripDayId));

    act(() => {
      // await 하지 않고 즉시 상태를 관찰
      result.current.add(place);
    });

    expect(result.current.isAdding).toBe(true);
    expect(result.current.addingPlaceId).toBe('kakao-123');

    await act(async () => {
      resolveFn({ scheduleItemId: 'si-1', placeId: 'p-1', orderIndex: 0 });
      await flushPromises();
    });

    expect(result.current.isAdding).toBe(false);
    expect(result.current.addingPlaceId).toBe(null);
  });

  it('중복 요청 방지: 첫 요청이 pending인 동안 두 번째 add는 null 반환하고 호출되지 않는다', async () => {
    let resolveFn;
    const pending = new Promise((resolve) => {
      resolveFn = resolve;
    });

    addScheduleItemWithPlace.mockReturnValueOnce(pending);

    const { result } = renderHook(() => useAddScheduleItem(tripDayId));

    let out2;

    act(() => {
      result.current.add(place); // 1st (pending)
    });

    await act(async () => {
      out2 = await result.current.add(place); // 2nd (blocked)
      await flushPromises();
    });

    expect(out2).toBeNull();
    expect(addScheduleItemWithPlace).toHaveBeenCalledTimes(1);

    // 1st 요청 끝내기
    await act(async () => {
      resolveFn({ scheduleItemId: 'si-1', placeId: 'p-1', orderIndex: 0 });
      await flushPromises();
    });

    expect(result.current.isAdding).toBe(false);
    expect(result.current.addingPlaceId).toBe(null);
  });
});
