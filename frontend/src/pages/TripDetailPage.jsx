import React from 'react';
import TripSummaryBar from '../components/trip-detail/TripSummaryBar';
import TripMapSection from '../components/trip-detail/TripMapSection';
import TripItineraryList from '../components/trip-detail/TripItineraryList';

const TripDetailPage = () => {
  return (
    <div className="d-flex flex-column vh-100">
      
      {/* 1. 상단 정보 바 (고정 높이) */}
      <div style={{ flexShrink: 0, zIndex: 102, position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}> 
        <TripSummaryBar />
      </div>

      {/* 2. 지도 + 일정 패널 영역 */}
      {/* position-relative 필수: 내부 버튼(absolute)의 기준점이 됩니다. */}
      <div className="position-relative flex-grow-1 overflow-hidden">
        
        {/* (1) 지도 섹션 */}
        <TripMapSection />

        {/* (2) 일정 리스트 패널 (지도 우측 상단에 배치됨) */}
        <TripItineraryList />

      </div>
    </div>
  );
};

export default TripDetailPage;