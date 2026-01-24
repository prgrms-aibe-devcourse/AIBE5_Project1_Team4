import React from 'react';
import TripSummaryBar from '../components/trip-detail/TripSummaryBar';
import TripMapSection from '../components/trip-detail/TripMapSection';
import TripItineraryList from '../components/trip-detail/TripItineraryList';
import './TripDetailPage.css'; // CSS 파일 import

const TripDetailPage = () => {
  return (
    <div className="trip-detail-page">
      
      {/* 1. 상단 정보 바 */}
      <div className="trip-detail-header"> 
        <TripSummaryBar />
      </div>

      {/* 2. 지도 + 일정 패널 영역 */}
      <div className="trip-detail-body">
        <TripMapSection />
        <TripItineraryList />
      </div>

    </div>
  );
};

export default TripDetailPage;