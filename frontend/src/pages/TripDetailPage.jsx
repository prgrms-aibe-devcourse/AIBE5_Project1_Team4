import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useTripDetail } from '../hooks/trips/useTripDetail';

import TripSummaryBar from '../components/trip-detail/TripSummaryBar';
import TripMapSection from '../components/trip-detail/TripMapSection';
import { TripReviewSection } from '../components/review';
import './TripDetailPage.css';

/**
 * 여행 상세 페이지 컴포넌트
 * URL 파라미터로 받은 ID를 이용해 여행 정보를 로드하고 화면에 표시합니다.
 */
const TripDetailPage = () => {
  const { id } = useParams();

  // 진입 시 스크롤 위치 초기화 (이전 페이지 스크롤 유지되는 이슈 대응)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 커스텀 훅을 통해 DB 데이터 로드 (작성자 프로필 포함)
  const { tripData, loading, error } = useTripDetail(id);

  // 로딩 상태 및 에러 처리
  if (loading) return <div className="text-center mt-5">로딩 중... ⏳</div>;
  if (error || !tripData) {
    return <div className="text-center mt-5">데이터를 불러올 수 없습니다. 😢</div>;
  }

  return (
    <div className="trip-detail-page">
      {/* 상단 요약 바 영역 (제목, 작성자, 태그 등) */}
      <div className="trip-detail-header">
        <TripSummaryBar summary={tripData.summary} />
      </div>

      {/* 메인 바디 영역 (지도 및 일정 섹션) */}
      <div className="trip-detail-body">
        <TripMapSection schedules={tripData.schedule?.days} selectedId={null} />
      </div>

      {/* 리뷰 섹션 */}
      <Container className="py-4">
        <TripReviewSection tripId={id} />
      </Container>
    </div>
  );
};

export default TripDetailPage;
