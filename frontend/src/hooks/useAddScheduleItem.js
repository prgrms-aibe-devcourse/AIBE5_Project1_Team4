// src/hooks/useAddScheduleItem.js
import { useState, useRef, useCallback } from 'react';
import { addScheduleItemWithPlace } from '@/services/scheduleItems.service';

/**
 * 일정에 장소 추가 훅
 *
 * - 중복 요청 방지 (lockRef)
 * - place별 로딩 상태 추적 (addingPlaceId)
 * - 성공 시 onSuccess(result, place) 콜백
 * - 실패 시 onError(error, place) 콜백
 *
 * @param {string} tripDayId - 추가할 trip_day UUID
 * @param {object} [options]
 * @param {(result, place) => void} [options.onSuccess]
 * @param {(error, place) => void} [options.onError]
 */
export function useAddScheduleItem(tripDayId, options = {}) {
  const { onSuccess, onError } = options;

  const [isAdding, setIsAdding] = useState(false);
  const [addingPlaceId, setAddingPlaceId] = useState(null);
  const [error, setError] = useState(null);
  const lockRef = useRef(false);

  const add = useCallback(
    async (place, itemOptions = {}) => {
      if (lockRef.current || !tripDayId) return null;
      lockRef.current = true;
      setIsAdding(true);
      setAddingPlaceId(place.provider_place_id);
      setError(null);

      try {
        const result = await addScheduleItemWithPlace(tripDayId, place, itemOptions);
        onSuccess?.(result, place);
        return result;
      } catch (e) {
        setError(e);
        onError?.(e, place);
        return null;
      } finally {
        lockRef.current = false;
        setIsAdding(false);
        setAddingPlaceId(null);
      }
    },
    [tripDayId, onSuccess, onError],
  );

  return {
    add,
    isAdding,
    addingPlaceId,
    error,
  };
}
