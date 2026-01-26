import { useState, useEffect } from 'react';
import { getTripDetail } from '../../services/trips.detail.service';

/**
 * 여행 상세 데이터를 가져오는 커스텀 훅
 * @param {string|number} tripId - 여행 고유 ID
 */
export const useTripDetail = (tripId) => {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ID가 없으면 실행하지 않음
    if (!tripId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null); // 에러 상태 초기화

      try {
        // ID 길이에 따라 서버 통신 여부 결정 (5자 초과는 UUID로 간주)
        if (tripId.toString().length > 5) {
          const data = await getTripDetail(tripId);
          setTripData(data);
        } 
        else {
          // ID가 짧은 경우(테스트용 숫자 ID) 처리 로직
          // 필요 시 MOCK_DB 연동 혹은 기본값 처리
          setTripData(null); 
        }
      } catch (err) {
        console.error("[useTripDetail] Failed to fetch trip details:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  return { tripData, loading, error };
};