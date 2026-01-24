import React from 'react';
import { Plus, Minus } from 'lucide-react';
import './TripMapSection.css';

const TripMapSection = () => {
  return (
    <div className="trip-detail-map-container">
      {/* 지도 API 연동 전까지는 빈 컨테이너로 둡니다. */}
      
      {/* 줌 컨트롤 (우측 하단) */}
      <div className="map-zoom-controls">
        <button className="zoom-btn" aria-label="Zoom In">
          <Plus size={20} />
        </button>
        <button className="zoom-btn" aria-label="Zoom Out">
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
};

export default TripMapSection;