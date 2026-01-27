// src/hooks/reviews/useTripReviews.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import { useTripReviews } from './useTripReviews';

vi.mock('@/services/reviews.service', () => ({
  listTripReviews: vi.fn(),
  getTripReviewStats: vi.fn(),
}));

import {
  listTripReviews,
  getTripReviewStats,
} from '@/services/reviews.service';

describe('useTripReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tripId 없으면 idle 초기화 상태를 유지한다', () => {
    const { result } = renderHook(() => useTripReviews(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.reviews).toEqual([]);
    expect(result.current.stats).toEqual({ review_count: 0, avg_rating: null });
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);

    expect(listTripReviews).not.toHaveBeenCalled();
    expect(getTripReviewStats).not.toHaveBeenCalled();
  });

  it('tripId가 생기면 자동 refresh를 수행하고 상태/데이터를 세팅한다', async () => {
    const tripId = 'trip-1';

    listTripReviews.mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 2,
      avg_rating: 4.5,
    });

    const { result } = renderHook(() => useTripReviews(tripId, { limit: 20 }));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(listTripReviews).toHaveBeenCalledTimes(1);
    expect(listTripReviews).toHaveBeenCalledWith(tripId, {
      limit: 20,
      offset: 0,
    });

    expect(getTripReviewStats).toHaveBeenCalledTimes(1);
    expect(getTripReviewStats).toHaveBeenCalledWith(tripId);

    expect(result.current.reviews).toEqual([{ id: 'r1' }, { id: 'r2' }]);
    expect(result.current.stats).toEqual({ review_count: 2, avg_rating: 4.5 });
    expect(result.current.hasMore).toBe(false); // 2 < 20
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('refresh: 처음부터 다시 로드하고 offset/hasMore를 재계산한다', async () => {
    const tripId = 'trip-1';

    // mount auto refresh 1st
    listTripReviews.mockResolvedValueOnce([{ id: 'r1' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 5,
    });

    const { result } = renderHook(() => useTripReviews(tripId, { limit: 1 }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toEqual([{ id: 'r1' }]);
    expect(result.current.hasMore).toBe(true); // 1 >= 1

    // manual refresh 2nd
    listTripReviews.mockResolvedValueOnce([{ id: 'r2' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 10,
      avg_rating: 3.2,
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(listTripReviews).toHaveBeenLastCalledWith(tripId, {
      limit: 1,
      offset: 0,
    });
    expect(getTripReviewStats).toHaveBeenLastCalledWith(tripId);

    expect(result.current.reviews).toEqual([{ id: 'r2' }]);
    expect(result.current.stats).toEqual({ review_count: 10, avg_rating: 3.2 });
    expect(result.current.hasMore).toBe(true); // 1 >= 1
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBe(null);
  });

  it('loadMore: hasMore=true이면 다음 페이지를 붙인다', async () => {
    const tripId = 'trip-1';
    const limit = 2;

    // initial refresh returns full page => hasMore true, offset=2
    listTripReviews.mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 2,
      avg_rating: 4,
    });

    const { result } = renderHook(() => useTripReviews(tripId, { limit }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.hasMore).toBe(true);

    // loadMore returns 1 => hasMore false
    listTripReviews.mockResolvedValueOnce([{ id: 'r3' }]);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(listTripReviews).toHaveBeenLastCalledWith(tripId, {
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
    const tripId = 'trip-1';
    const limit = 20;

    // initial refresh returns < limit => hasMore false
    listTripReviews.mockResolvedValueOnce([{ id: 'r1' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 5,
    });

    const { result } = renderHook(() => useTripReviews(tripId, { limit }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    // still only 1 call from initial refresh
    expect(listTripReviews).toHaveBeenCalledTimes(1);
  });

  it('에러: refresh 중 실패하면 status=error, error 세팅', async () => {
    const tripId = 'trip-1';
    const err = new Error('fail');

    listTripReviews.mockRejectedValueOnce(err);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 0,
      avg_rating: null,
    });

    const { result } = renderHook(() => useTripReviews(tripId, { limit: 20 }));

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.error).toBe(err);
    expect(result.current.reviews).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('에러: loadMore 실패하면 status는 유지되고 error만 세팅', async () => {
    const tripId = 'trip-1';
    const limit = 1;

    // initial refresh => hasMore true
    listTripReviews.mockResolvedValueOnce([{ id: 'r1' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 4,
    });

    const { result } = renderHook(() => useTripReviews(tripId, { limit }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.hasMore).toBe(true);

    const err = new Error('loadMore fail');
    listTripReviews.mockRejectedValueOnce(err);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.status).toBe('success'); // loadMore는 status를 변경하지 않음
    expect(result.current.error).toBe(err);
    expect(result.current.reviews).toEqual([{ id: 'r1' }]); // 변경 없음
  });

  it('tripId가 바뀌면 자동 refresh하고, tripId가 null이면 상태를 초기화한다', async () => {
    const limit = 2;

    // first trip
    listTripReviews.mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 2,
      avg_rating: 4,
    });

    const { result, rerender } = renderHook(
      ({ tripId }) => useTripReviews(tripId, { limit }),
      { initialProps: { tripId: 'tA' } },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toEqual([{ id: 'a1' }, { id: 'a2' }]);

    // change trip
    listTripReviews.mockResolvedValueOnce([{ id: 'b1' }]);
    getTripReviewStats.mockResolvedValueOnce({
      review_count: 1,
      avg_rating: 5,
    });

    rerender({ tripId: 'tB' });

    await waitFor(() => expect(result.current.reviews[0]?.id).toBe('b1'));
    expect(listTripReviews).toHaveBeenLastCalledWith('tB', {
      limit,
      offset: 0,
    });

    // set to null => reset to idle
    rerender({ tripId: null });

    expect(result.current.status).toBe('idle');
    expect(result.current.reviews).toEqual([]);
    expect(result.current.stats).toEqual({ review_count: 0, avg_rating: null });
    expect(result.current.hasMore).toBe(true);
  });

  it('동시 호출 방지: refresh 중 loadMore/refresh를 연속 호출해도 추가 요청이 나가지 않는다', async () => {
    const tripId = 'trip-1';
    const limit = 20;

    let resolveList;
    let resolveStats;

    listTripReviews.mockImplementationOnce(
      () => new Promise((res) => (resolveList = res)),
    );
    getTripReviewStats.mockImplementationOnce(
      () => new Promise((res) => (resolveStats = res)),
    );

    const { result } = renderHook(() => useTripReviews(tripId, { limit }));

    // mount 직후 refresh가 시작된 상태
    expect(result.current.status).toBe('loading');

    await act(async () => {
      result.current.refresh();
      result.current.loadMore();
    });

    expect(listTripReviews).toHaveBeenCalledTimes(1);
    expect(getTripReviewStats).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveList([{ id: 'r1' }]);
      resolveStats({ review_count: 1, avg_rating: 5 });
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.reviews).toEqual([{ id: 'r1' }]);
  });
});
