// src/hooks/reviews/useReviewForm.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import {
  useReviewForm,
  useTripReviewForm,
  usePlaceReviewForm,
} from './useReviewForm';

vi.mock('@/services/reviews.service', () => ({
  getMyTripReview: vi.fn(),
  getMyPlaceReview: vi.fn(),
  upsertTripReview: vi.fn(),
  upsertPlaceReview: vi.fn(),
  deleteTripReview: vi.fn(),
  deletePlaceReview: vi.fn(),
}));

import {
  getMyTripReview,
  getMyPlaceReview,
  upsertTripReview,
  upsertPlaceReview,
  deleteTripReview,
  deletePlaceReview,
} from '@/services/reviews.service';

describe('useReviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('targetId 없으면 loadExisting가 실질적으로 아무 것도 하지 않고 초기 상태를 유지한다', async () => {
    const { result } = renderHook(() => useReviewForm('trip', null));

    // effect가 돌더라도 targetId 체크로 early return
    await waitFor(() => {
      expect(result.current.loadingExisting).toBe(false);
    });

    expect(getMyTripReview).not.toHaveBeenCalled();
    expect(result.current.existingReview).toBe(null);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.rating).toBe(0);
    expect(result.current.content).toBe('');
    expect(result.current.error).toBe(null);
  });

  it('trip: 기존 내 리뷰가 있으면 자동 로드 후 폼이 채워지고 isEditing=true', async () => {
    const tripId = 't1';
    const my = {
      id: 'r1',
      rating: 4,
      content: 'hi',
      created_at: 'a',
      updated_at: 'b',
    };
    getMyTripReview.mockResolvedValueOnce(my);

    const { result } = renderHook(() => useReviewForm('trip', tripId));

    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    expect(getMyTripReview).toHaveBeenCalledWith(tripId);
    expect(result.current.existingReview).toEqual(my);
    expect(result.current.rating).toBe(4);
    expect(result.current.content).toBe('hi');
    expect(result.current.isEditing).toBe(true);
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
  });

  it('place: 기존 내 리뷰가 없으면 폼이 초기화되고 isEditing=false', async () => {
    const placeId = 'p1';
    getMyPlaceReview.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useReviewForm('place', placeId));

    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    expect(getMyPlaceReview).toHaveBeenCalledWith(placeId);
    expect(result.current.existingReview).toBe(null);
    expect(result.current.rating).toBe(0);
    expect(result.current.content).toBe('');
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('loadExisting 실패 시 error가 세팅된다', async () => {
    const tripId = 't1';
    const err = new Error('load fail');
    getMyTripReview.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useReviewForm('trip', tripId));

    await waitFor(() => expect(result.current.loadingExisting).toBe(false));
    expect(result.current.error).toBe(err);
    expect(result.current.existingReview).toBe(null);
  });

  it('targetId 변경 시 자동으로 다시 로드한다', async () => {
    getMyTripReview.mockResolvedValueOnce(null); // first id
    getMyTripReview.mockResolvedValueOnce({
      id: 'r2',
      rating: 5,
      content: '',
      created_at: 'a',
      updated_at: 'b',
    }); // second id

    const { result, rerender } = renderHook(
      ({ id }) => useReviewForm('trip', id),
      { initialProps: { id: 't1' } },
    );

    await waitFor(() => expect(result.current.loadingExisting).toBe(false));
    expect(getMyTripReview).toHaveBeenCalledWith('t1');
    expect(result.current.existingReview).toBe(null);

    rerender({ id: 't2' });

    await waitFor(() => expect(result.current.existingReview?.id).toBe('r2'));
    expect(getMyTripReview).toHaveBeenCalledWith('t2');
    expect(result.current.rating).toBe(5);
    expect(result.current.isEditing).toBe(true);
  });

  it('reset: 현재 existingReview 기준으로 폼을 되돌린다', async () => {
    const tripId = 't1';
    const my = {
      id: 'r1',
      rating: 3,
      content: 'old',
      created_at: 'a',
      updated_at: 'b',
    };
    getMyTripReview.mockResolvedValueOnce(my);

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    // dirty 만들기
    act(() => {
      result.current.setRating(5);
      result.current.setContent('new');
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.rating).toBe(3);
    expect(result.current.content).toBe('old');
    expect(result.current.isDirty).toBe(false);
  });

  it('submit: rating 유효하지 않으면 API 호출 없이 error를 세팅한다', async () => {
    const tripId = 't1';
    getMyTripReview.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    // rating=0 기본값
    await act(async () => {
      await result.current.submit();
    });

    expect(upsertTripReview).not.toHaveBeenCalled();
    expect(result.current.error).toEqual({
      message: '평점을 선택해주세요 (1~5)',
    });
    expect(result.current.submitting).toBe(false);
  });

  it('submit: trip은 upsertTripReview를 호출하고 existingReview를 갱신하며 onSuccess를 호출한다', async () => {
    const tripId = 't1';
    getMyTripReview.mockResolvedValueOnce(null);

    const onSuccess = vi.fn();
    const created = {
      id: 'r1',
      rating: 5,
      content: 'hello',
      created_at: 'a',
      updated_at: 'b',
    };
    upsertTripReview.mockResolvedValueOnce(created);

    const { result } = renderHook(() =>
      useReviewForm('trip', tripId, { onSuccess }),
    );
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    act(() => {
      result.current.setRating(5);
      result.current.setContent('hello');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(upsertTripReview).toHaveBeenCalledWith(tripId, {
      rating: 5,
      content: 'hello',
    });
    expect(result.current.existingReview).toEqual(created);
    expect(result.current.isEditing).toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('submit: place는 upsertPlaceReview를 호출한다', async () => {
    const placeId = 'p1';
    getMyPlaceReview.mockResolvedValueOnce(null);

    const updated = {
      id: 'r1',
      rating: 4,
      content: '',
      created_at: 'a',
      updated_at: 'b',
    };
    upsertPlaceReview.mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useReviewForm('place', placeId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    act(() => {
      result.current.setRating(4);
      result.current.setContent('');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(upsertPlaceReview).toHaveBeenCalledWith(placeId, {
      rating: 4,
      content: '',
    });
    expect(result.current.existingReview).toEqual(updated);
    expect(result.current.isEditing).toBe(true);
  });

  it('submit: 실패하면 error를 세팅하고 throw한다', async () => {
    const tripId = 't1';
    getMyTripReview.mockResolvedValueOnce(null);

    const err = new Error('submit fail');
    upsertTripReview.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    act(() => {
      result.current.setRating(5);
    });

    let thrown;
    await act(async () => {
      try {
        await result.current.submit();
      } catch (e) {
        thrown = e;
      }
    });

    expect(thrown).toBe(err);

    await waitFor(() => {
      expect(result.current.error).toBe(err);
    });

    expect(result.current.submitting).toBe(false);
  });

  it('remove: existingReview 없으면 아무 것도 하지 않는다', async () => {
    const tripId = 't1';
    getMyTripReview.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    await act(async () => {
      await result.current.remove();
    });

    expect(deleteTripReview).not.toHaveBeenCalled();
    expect(result.current.deleting).toBe(false);
  });

  it('remove: trip은 deleteTripReview를 호출하고 성공 시 폼/상태를 초기화하며 onSuccess를 호출한다', async () => {
    const tripId = 't1';
    const my = {
      id: 'r1',
      rating: 4,
      content: 'x',
      created_at: 'a',
      updated_at: 'b',
    };
    getMyTripReview.mockResolvedValueOnce(my);

    deleteTripReview.mockResolvedValueOnce(true);
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useReviewForm('trip', tripId, { onSuccess }),
    );
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    expect(result.current.isEditing).toBe(true);

    await act(async () => {
      await result.current.remove();
    });

    expect(deleteTripReview).toHaveBeenCalledWith(tripId);
    expect(result.current.existingReview).toBe(null);
    expect(result.current.rating).toBe(0);
    expect(result.current.content).toBe('');
    expect(result.current.isEditing).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.deleting).toBe(false);
  });

  it('remove: place는 deletePlaceReview를 호출한다', async () => {
    const placeId = 'p1';
    const my = {
      id: 'r1',
      rating: 2,
      content: '',
      created_at: 'a',
      updated_at: 'b',
    };
    getMyPlaceReview.mockResolvedValueOnce(my);

    deletePlaceReview.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useReviewForm('place', placeId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    await act(async () => {
      await result.current.remove();
    });

    expect(deletePlaceReview).toHaveBeenCalledWith(placeId);
    expect(result.current.existingReview).toBe(null);
    expect(result.current.isEditing).toBe(false);
  });

  it('remove: 실패하면 error를 세팅하고 throw한다', async () => {
    const tripId = 't1';
    const my = {
      id: 'r1',
      rating: 4,
      content: 'x',
      created_at: 'a',
      updated_at: 'b',
    };
    getMyTripReview.mockResolvedValueOnce(my);

    const err = new Error('delete fail');
    deleteTripReview.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    let thrown;
    await act(async () => {
      try {
        await result.current.remove();
      } catch (e) {
        thrown = e;
      }
    });

    expect(thrown).toBe(err);

    await waitFor(() => {
      expect(result.current.error).toBe(err);
    });

    expect(result.current.deleting).toBe(false);
  });

  it('reload: loadExisting를 다시 실행한다', async () => {
    const tripId = 't1';
    getMyTripReview.mockResolvedValueOnce(null);
    getMyTripReview.mockResolvedValueOnce({
      id: 'r2',
      rating: 5,
      content: 'x',
      created_at: 'a',
      updated_at: 'b',
    });

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));
    expect(result.current.existingReview).toBe(null);

    await act(async () => {
      await result.current.reload();
    });

    expect(getMyTripReview).toHaveBeenCalledTimes(2);
    expect(result.current.existingReview?.id).toBe('r2');
  });

  it('isDirty: rating/content 변경 여부를 정확히 반영한다', async () => {
    const tripId = 't1';
    const my = {
      id: 'r1',
      rating: 3,
      content: 'abc',
      created_at: 'a',
      updated_at: 'b',
    };
    getMyTripReview.mockResolvedValueOnce(my);

    const { result } = renderHook(() => useReviewForm('trip', tripId));
    await waitFor(() => expect(result.current.loadingExisting).toBe(false));

    expect(result.current.isDirty).toBe(false);

    act(() => result.current.setContent('abcd'));
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.reset());
    expect(result.current.isDirty).toBe(false);

    act(() => result.current.setRating(4));
    expect(result.current.isDirty).toBe(true);
  });

  it('shorthand: useTripReviewForm/usePlaceReviewForm은 targetType을 고정한다', async () => {
    getMyTripReview.mockResolvedValueOnce(null);
    const { result: tripResult } = renderHook(() => useTripReviewForm('t1'));
    await waitFor(() => expect(tripResult.current.loadingExisting).toBe(false));
    expect(getMyTripReview).toHaveBeenCalledWith('t1');

    getMyPlaceReview.mockResolvedValueOnce(null);
    const { result: placeResult } = renderHook(() => usePlaceReviewForm('p1'));
    await waitFor(() =>
      expect(placeResult.current.loadingExisting).toBe(false),
    );
    expect(getMyPlaceReview).toHaveBeenCalledWith('p1');
  });
});
