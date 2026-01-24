import React from 'react';
import { Plus, Minus, Maximize } from 'lucide-react'; // 아이콘
import './TripMapSection.css'; // 독립 CSS import

const TripMapSection = () => {
  return (
    <section className="trip-detail-map-container">
      {/* 1. 지도 뷰 (Placeholder) */}
      <div className="trip-detail-map-view">
        {/* 실제 지도 연동 전 보여줄 플레이스홀더 */}
        <svg 
          className="trip-map-placeholder-icon"
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <h5 className="fw-bold text-secondary">MAP VIEW</h5>
        <p className="small text-muted mb-0">여행 경로가 지도에 표시됩니다.</p>
      </div>

      {/* 2. 지도 컨트롤 버튼 (우측 상단) */}
      <div className="trip-detail-map-controls">
        <button className="trip-map-control-btn" aria-label="확대">
          <Plus size={20} />
        </button>
        <button className="trip-map-control-btn" aria-label="축소">
          <Minus size={20} />
        </button>
        <button className="trip-map-control-btn" aria-label="전체화면">
          <Maximize size={18} />
        </button>
      </div>
    </section>
  );
};

export default TripMapSection;