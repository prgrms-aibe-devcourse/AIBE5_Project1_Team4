// src/hooks/reviews/useReviewForm.js
import { useCallback, useEffect, useState } from 'react';
import {
  getMyTripReview,
  getMyPlaceReview,
  upsertTripReview,
  upsertPlaceReview,
  deleteTripReview,
  deletePlaceReview,
} from '@/services/reviews.service';

/**
 * 리뷰 작성/수정 폼 훅
 * - 기존 내 리뷰 자동 로드
 * - upsert (생성/수정)
 * - delete
 *
 * @param {'trip' | 'place'} targetType
 * @param {string} targetId - tripId 또는 placeId
 * @param {{ onSuccess?: () => void }} options
 */
export function useReviewForm(targetType, targetId, { onSuccess } = {}) {
  // 폼 상태
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');

  // 기존 리뷰 존재 여부
  const [existingReview, setExistingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 로딩/에러 상태
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // 기존 내 리뷰 로드
  const loadExisting = useCallback(async () => {
    if (!targetId) return;

    setLoadingExisting(true);
    setError(null);

    try {
      const myReview =
        targetType === 'trip'
          ? await getMyTripReview(targetId)
          : await getMyPlaceReview(targetId);

      setExistingReview(myReview);

      if (myReview) {
        setRating(myReview.rating);
        setContent(myReview.content || '');
        setIsEditing(true);
      } else {
        setRating(0);
        setContent('');
        setIsEditing(false);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoadingExisting(false);
    }
  }, [targetType, targetId]);

  // targetId 변경 시 자동 로드
  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  // 폼 리셋
  const reset = useCallback(() => {
    setRating(existingReview?.rating || 0);
    setContent(existingReview?.content || '');
    setError(null);
  }, [existingReview]);

  // 제출 (생성/수정)
  const submit = useCallback(async () => {
    if (!targetId) return;
    if (rating < 1 || rating > 5) {
      setError({ message: '평점을 선택해주세요 (1~5)' });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result =
        targetType === 'trip'
          ? await upsertTripReview(targetId, { rating, content })
          : await upsertPlaceReview(targetId, { rating, content });

      setExistingReview(result);
      setIsEditing(true);
      onSuccess?.();
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [targetType, targetId, rating, content, onSuccess]);

  // 삭제
  const remove = useCallback(async () => {
    if (!targetId) return;
    if (!existingReview) return;

    setDeleting(true);
    setError(null);

    try {
      const deleted =
        targetType === 'trip'
          ? await deleteTripReview(targetId)
          : await deletePlaceReview(targetId);

      if (deleted) {
        setExistingReview(null);
        setRating(0);
        setContent('');
        setIsEditing(false);
        onSuccess?.();
      }
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setDeleting(false);
    }
  }, [targetType, targetId, existingReview, onSuccess]);

  // 유효성 검사
  const isValid = rating >= 1 && rating <= 5;
  const isDirty =
    rating !== (existingReview?.rating || 0) ||
    content !== (existingReview?.content || '');

  return {
    // 폼 값
    rating,
    setRating,
    content,
    setContent,

    // 상태
    existingReview,
    isEditing,
    isValid,
    isDirty,

    // 로딩 상태
    loadingExisting,
    submitting,
    deleting,
    isLoading: loadingExisting || submitting || deleting,

    // 에러
    error,

    // 액션
    submit,
    remove,
    reset,
    reload: loadExisting,
  };
}

/**
 * Trip 리뷰 폼 훅 (shorthand)
 */
export function useTripReviewForm(tripId, options) {
  return useReviewForm('trip', tripId, options);
}

/**
 * Place 리뷰 폼 훅 (shorthand)
 */
export function usePlaceReviewForm(placeId, options) {
  return useReviewForm('place', placeId, options);
}
