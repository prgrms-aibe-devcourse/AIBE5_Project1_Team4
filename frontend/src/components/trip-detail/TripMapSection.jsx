import React from 'react';
import { Plus, Minus } from 'lucide-react'; 
import TripItineraryList from './TripItineraryList'; // 1. 임포트 필수!
import './TripMapSection.css';

const TripMapSection = () => {
  // 테스트를 위해 빈 데이터를 넣어보거나, 나중엔 props로 받습니다.
  // 지금은 '데이터가 없을 때 버튼이 잘 나오는지' 확인해야 하므로 빈 상태로 둡니다.

  return (
    <div className="trip-detail-map-container" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '600px' 
    }}>
      
      {/* 2. 여기에 리스트 컴포넌트를 꼭 넣어줘야 화면에 나옵니다! */}
      <TripItineraryList />
      
      {/* 줌 컨트롤 */}
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