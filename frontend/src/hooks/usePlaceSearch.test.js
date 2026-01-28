import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlaceSearch } from './usePlaceSearch';

// ✅ hoist-safe mock
vi.mock('@/services/places.service', () => {
  return {
    searchPlaces: vi.fn(),
  };
});

import { searchPlaces } from '@/services/places.service';

function flushPromises() {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('usePlaceSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('query가 minLength 미만이면 검색 호출 없이 상태를 초기화한다', () => {
    const { result, rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { minLength: 2, debounceMs: 10 }),
      { initialProps: { q: '' } },
    );

    expect(result.current.places).toEqual([]);
    expect(result.current.canLoadMore).toBe(false);
    expect(result.current.error).toBe(null);
    expect(searchPlaces).not.toHaveBeenCalled();

    // q = 'a' (길이 1) -> 여전히 minLength 미만
    rerender({ q: 'a' });
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(searchPlaces).not.toHaveBeenCalled();
    expect(result.current.places).toEqual([]);
  });

  it('query 변경 시 debounceMs 후 page=1로 검색하고 places를 set한다', async () => {
    searchPlaces.mockResolvedValueOnce({
      places: [{ id: 'p1' }],
      meta: { is_end: true },
    });

    const { result, rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { debounceMs: 500, minLength: 1, size: 15 }),
      { initialProps: { q: '' } },
    );

    rerender({ q: '테스트' });

    // debounce 전에는 호출 X
    expect(searchPlaces).not.toHaveBeenCalled();

    // debounce 경과
    await act(async () => {
      vi.advanceTimersByTime(500);
      await flushPromises();
    });

    expect(searchPlaces).toHaveBeenCalledTimes(1);
    expect(searchPlaces).toHaveBeenCalledWith({
      query: '테스트',
      page: 1,
      size: 15,
    });

    expect(result.current.places).toEqual([{ id: 'p1' }]);
    expect(result.current.canLoadMore).toBe(false); // is_end=true
    expect(result.current.error).toBe(null);
  });

  it('debounce 중 query가 바뀌면 마지막 query로만 검색한다', async () => {
    searchPlaces.mockResolvedValueOnce({
      places: [{ id: 'final' }],
      meta: { is_end: true },
    });

    const { rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { debounceMs: 500 }),
      { initialProps: { q: '' } },
    );

    rerender({ q: 'a' });
    act(() => vi.advanceTimersByTime(300));

    rerender({ q: 'ab' });
    act(() => vi.advanceTimersByTime(300));

    // 아직 500ms 안 지났으니 호출 X
    expect(searchPlaces).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
      await flushPromises();
    });

    expect(searchPlaces).toHaveBeenCalledTimes(1);
    expect(searchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'ab', page: 1 }),
    );
  });

  it('meta.is_end=false면 canLoadMore=true, loadMore 호출 시 다음 page를 누적한다', async () => {
    searchPlaces
      .mockResolvedValueOnce({
        places: [{ id: 'p1' }],
        meta: { is_end: false },
      })
      .mockResolvedValueOnce({
        places: [{ id: 'p2' }],
        meta: { is_end: true },
      });

    const { result, rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { debounceMs: 10 }),
      { initialProps: { q: '' } },
    );

    rerender({ q: '카페' });

    await act(async () => {
      vi.advanceTimersByTime(10);
      await flushPromises();
    });

    expect(result.current.places).toEqual([{ id: 'p1' }]);
    expect(result.current.canLoadMore).toBe(true);

    // loadMore -> page 2
    await act(async () => {
      result.current.loadMore();
      await flushPromises();
    });

    expect(searchPlaces).toHaveBeenCalledTimes(2);
    expect(searchPlaces).toHaveBeenLastCalledWith({
      query: '카페',
      page: 2,
      size: 15,
    });

    expect(result.current.places).toEqual([{ id: 'p1' }, { id: 'p2' }]);
    expect(result.current.canLoadMore).toBe(false);
  });

  it('canLoadMore=false 또는 isLoading=true면 loadMore는 아무것도 하지 않는다', async () => {
    searchPlaces.mockResolvedValueOnce({
      places: [{ id: 'p1' }],
      meta: { is_end: true },
    });

    const { result, rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { debounceMs: 10 }),
      { initialProps: { q: '' } },
    );

    rerender({ q: '맛집' });
    await act(async () => {
      vi.advanceTimersByTime(10);
      await flushPromises();
    });

    expect(result.current.canLoadMore).toBe(false);

    await act(async () => {
      result.current.loadMore();
      await flushPromises();
    });

    // 호출 1회 유지
    expect(searchPlaces).toHaveBeenCalledTimes(1);
  });

  it('searchPlaces가 throw하면 error를 set한다', async () => {
    const err = new Error('network');
    searchPlaces.mockRejectedValueOnce(err);

    const { result, rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { debounceMs: 10 }),
      { initialProps: { q: '' } },
    );

    rerender({ q: '테스트' });

    await act(async () => {
      vi.advanceTimersByTime(10);
      await flushPromises();
    });

    expect(result.current.error).toBe(err);
    expect(result.current.places).toEqual([]); // page=1 실패
  });

  it('reset()은 places/error/loading/canLoadMore를 초기화한다', async () => {
    searchPlaces.mockResolvedValueOnce({
      places: [{ id: 'p1' }],
      meta: { is_end: false },
    });

    const { result, rerender } = renderHook(
      ({ q }) => usePlaceSearch(q, { debounceMs: 10 }),
      { initialProps: { q: '' } },
    );

    rerender({ q: '카페' });

    await act(async () => {
      vi.advanceTimersByTime(10);
      await flushPromises();
    });

    expect(result.current.places.length).toBe(1);
    expect(result.current.canLoadMore).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.places).toEqual([]);
    expect(result.current.canLoadMore).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('enabled=false면 query가 바뀌어도 검색하지 않는다', async () => {
    const { rerender } = renderHook(
      ({ q, enabled }) => usePlaceSearch(q, { debounceMs: 10, enabled }),
      { initialProps: { q: '', enabled: false } },
    );

    rerender({ q: '테스트', enabled: false });

    await act(async () => {
      vi.advanceTimersByTime(10);
      await flushPromises();
    });

    expect(searchPlaces).not.toHaveBeenCalled();
  });
});
