import React from 'react';
import { 
  Calendar, Bookmark, Share2, User, MapPin, Siren, Heart 
} from 'lucide-react';
import './TripSummaryBar.css';

const TripSummaryBar = () => {
  return (
    <div className="trip-summary-container">
      {/* --- 좌측: 여행 상세 정보 --- */}
      <div className="summary-left">
        {/* 1. 제목 */}
        <h1 className="summary-title">서울 2박 3일 맛집 여행</h1>

        {/* 2. 작성자 및 통계 */}
        <div className="summary-meta-row">
          <div className="meta-item author">
            <User size={18} />
            <span>작성자 A</span>
          </div>
          <div className="meta-divider"></div>
          <div className="meta-item">
            <Bookmark size={18} />
            <span>38</span>
          </div>
          <div className="meta-item">
            {/* 👁️ 대신 좋아요(Heart) 아이콘 적용 */}
            <Heart size={18} />
            <span>1,240</span>
          </div>
        </div>

        {/* 3. 날짜 */}
        <div className="summary-date-row">
          <Calendar size={18} />
          <span>2025년 12월 1일 ~ 2025년 12월 4일</span>
        </div>

        {/* 4. 설명 & 태그 */}
        <p className="summary-desc">
          서울의 맛집만 골라 돌아다니는 먹방 여행 루트
        </p>
        <div className="summary-tags">
          <span>#미식</span>
          <span>#도보</span>
          <span>#혼행</span>
        </div>

        {/* 5. 루트 요약 */}
        <div className="summary-route">
          <MapPin size={16} className="text-muted" />
          <span className="route-text">서울역 → 성수 → 강남 → 홍대 → 인천공항</span>
        </div>
      </div>


      {/* --- 우측: 액션 버튼 그룹 (3개) --- */}
      <div className="summary-right">
        {/* 1. 저장됨 */}
        <button className="summary-btn-flat">
          <Bookmark size={18} strokeWidth={2} />
          <span>저장됨</span>
        </button>
        
        {/* 2. 신고 */}
        <button className="summary-btn-flat">
          <Siren size={18} strokeWidth={2} />
          <span>신고</span>
        </button>
        
        {/* 3. 공개하기 */}
        <button className="summary-btn-flat">
          <Share2 size={18} strokeWidth={2} />
          <span>공개하기</span>
        </button>
      </div>
    </div>
  );
};

export default TripSummaryBar;