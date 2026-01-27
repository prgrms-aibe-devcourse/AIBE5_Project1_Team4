// src/hooks/reviews/usePlaceReviews.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import { usePlaceReviews } from './usePlaceReviews';

vi.mock('@/services/reviews.service', () => ({
  listPlaceReviews: vi.fn(),
  getPlaceReviewStats: vi.fn(),
}));

import {
  listPlaceReviews,
  getPlaceReviewStats,
} from '@/services/reviews.service';

describe('usePlaceReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('placeId 없으면 idle 초기화 상태를 유지한다', () => {
    const { result } = renderHook(() => usePlaceReviews(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.reviews).toEqual([]);
    expect(result.current.stats).toEqual({ review_count: 0, avg_rating: null });
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(listPlaceReviews).not.toHaveBeenCalled();
    expect(getPlaceReviewStats).not.toHaveBeenCalled();
  });

  it('placeId가 생기면 자동 refresh를 수행하고 상태/데이터를 세팅한다', async () => {
    const placeId = 'place-1';

    listPlaceReviews.mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 2,
      avg_rating: 4.5,
    });

    const { result } = renderHook(() =>
      usePlaceReviews(placeId, { limit: 20 }),
    );

    // 로딩 상태로 전환되었다가
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(listPlaceReviews).toHaveBeenCalledTimes(1);
    expect(listPlaceReviews).toHaveBeenCalledWith(placeId, {
      limit: 20,
      offset: 0,
    });

    expect(getPlaceReviewStats).toHaveBeenCalledTimes(1);
    expect(getPlaceReviewStats).toHaveBeenCalledWith(placeId);

    expect(result.current.reviews).toEqual([{ id: 'r1' }, { id: 'r2' }]);
    expect(result.current.stats).toEqual({ review_count: 2, avg_rating: 4.5 });
    expect(result.current.hasMore).toBe(false); // 2 < 20
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('refresh: 처음부터 다시 로드하고 offset/hasMore를 재계산한다', async () => {
    const placeId = 'place-1';

    // mount auto refresh 1st
    listPlaceReviews.mockResolvedValueOnce([{ id: 'r1' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 5,
    });

    const { result } = renderHook(() => usePlaceReviews(placeId, { limit: 1 }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toEqual([{ id: 'r1' }]);
    expect(result.current.hasMore).toBe(true); // 1 >= 1

    // manual refresh 2nd
    listPlaceReviews.mockResolvedValueOnce([{ id: 'r2' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 10,
      avg_rating: 3.2,
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(listPlaceReviews).toHaveBeenLastCalledWith(placeId, {
      limit: 1,
      offset: 0,
    });
    expect(getPlaceReviewStats).toHaveBeenLastCalledWith(placeId);

    expect(result.current.reviews).toEqual([{ id: 'r2' }]);
    expect(result.current.stats).toEqual({ review_count: 10, avg_rating: 3.2 });
    expect(result.current.hasMore).toBe(true); // 1 >= 1
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBe(null);
  });

  it('loadMore: hasMore=true이면 다음 페이지를 붙인다', async () => {
    const placeId = 'place-1';
    const limit = 2;

    // initial refresh returns full page => hasMore true, offset=2
    listPlaceReviews.mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 2,
      avg_rating: 4,
    });

    const { result } = renderHook(() => usePlaceReviews(placeId, { limit }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.hasMore).toBe(true);

    // loadMore returns 1 => hasMore false
    listPlaceReviews.mockResolvedValueOnce([{ id: 'r3' }]);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(listPlaceReviews).toHaveBeenLastCalledWith(placeId, {
      limit,
      offset: 2,
    });
    expect(result.current.reviews).toEqual([
      { id: 'r1' },
      { id: 'r2' },
      { id: 'r3' },
    ]);
    expect(result.current.hasMore).toBe(false); // 1 < 2
  });

  it('loadMore: hasMore=false이면 호출하지 않는다', async () => {
    const placeId = 'place-1';
    const limit = 20;

    // initial refresh returns < limit => hasMore false
    listPlaceReviews.mockResolvedValueOnce([{ id: 'r1' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 5,
    });

    const { result } = renderHook(() => usePlaceReviews(placeId, { limit }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    // still only 1 call from initial refresh
    expect(listPlaceReviews).toHaveBeenCalledTimes(1);
  });

  it('에러: refresh 중 실패하면 status=error, error 세팅', async () => {
    const placeId = 'place-1';
    const err = new Error('fail');

    listPlaceReviews.mockRejectedValueOnce(err);
    // stats는 Promise.all이라 같이 실패로 떨어질 수 있음. 그래도 호출은 시도된다.
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 0,
      avg_rating: null,
    });

    const { result } = renderHook(() =>
      usePlaceReviews(placeId, { limit: 20 }),
    );

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.error).toBe(err);
    expect(result.current.reviews).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('에러: loadMore 실패하면 status는 유지되고 error만 세팅', async () => {
    const placeId = 'place-1';
    const limit = 1;

    // initial refresh => hasMore true
    listPlaceReviews.mockResolvedValueOnce([{ id: 'r1' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 4,
    });

    const { result } = renderHook(() => usePlaceReviews(placeId, { limit }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.hasMore).toBe(true);

    const err = new Error('loadMore fail');
    listPlaceReviews.mockRejectedValueOnce(err);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.status).toBe('success'); // loadMore는 status를 변경하지 않음
    expect(result.current.error).toBe(err);
    expect(result.current.reviews).toEqual([{ id: 'r1' }]); // 변경 없음
  });

  it('placeId가 바뀌면 자동으로 refresh하고, placeId가 null이면 상태를 초기화한다', async () => {
    const limit = 2;

    // first place
    listPlaceReviews.mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 2,
      avg_rating: 4,
    });

    const { result, rerender } = renderHook(
      ({ placeId }) => usePlaceReviews(placeId, { limit }),
      { initialProps: { placeId: 'pA' } },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toEqual([{ id: 'a1' }, { id: 'a2' }]);

    // change place
    listPlaceReviews.mockResolvedValueOnce([{ id: 'b1' }]);
    getPlaceReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 5,
    });

    rerender({ placeId: 'pB' });

    await waitFor(() => expect(result.current.reviews[0]?.id).toBe('b1'));
    expect(listPlaceReviews).toHaveBeenLastCalledWith('pB', {
      limit,
      offset: 0,
    });

    // set to null => reset to idle
    rerender({ placeId: null });

    expect(result.current.status).toBe('idle');
    expect(result.current.reviews).toEqual([]);
    expect(result.current.stats).toEqual({ review_count: 0, avg_rating: null });
    expect(result.current.hasMore).toBe(true);
  });

  it('동시 호출 방지: refresh 중 loadMore/refresh를 연속 호출해도 추가 요청이 나가지 않는다', async () => {
    const placeId = 'place-1';
    const limit = 20;

    let resolveList;
    let resolveStats;

    listPlaceReviews.mockImplementationOnce(
      () => new Promise((res) => (resolveList = res)),
    );
    getPlaceReviewStats.mockImplementationOnce(
      () => new Promise((res) => (resolveStats = res)),
    );

    const { result } = renderHook(() => usePlaceReviews(placeId, { limit }));

    // mount 직후 refresh가 시작된 상태 (아직 resolve 안됨)
    expect(result.current.status).toBe('loading');

    await act(async () => {
      // refresh 중에 추가로 호출해도 막혀야 함
      result.current.refresh();
      result.current.loadMore();
    });

    // initial 1회만 호출되어야 함
    expect(listPlaceReviews).toHaveBeenCalledTimes(1);
    expect(getPlaceReviewStats).toHaveBeenCalledTimes(1);

    // resolve
    await act(async () => {
      resolveList([{ id: 'r1' }]);
      resolveStats({ review_count: 1, avg_rating: 5 });
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toEqual([{ id: 'r1' }]);
  });
});
