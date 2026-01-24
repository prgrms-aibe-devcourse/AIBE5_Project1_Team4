import React from 'react';
import { Container } from 'react-bootstrap';
// 아이콘 라이브러리 (프로젝트에 lucide-react가 없다면 설치 필요, 혹은 react-icons 사용)
import { User, Heart, Bookmark, Edit2, Share2, Flag, ChevronUp, Calendar } from 'lucide-react';
import './TripSummaryBar.css'; // 위에서 만든 CSS import

const TripSummaryBar = () => {
  return (
    <div className="trip-summary-container">
      <Container fluid className="p-0">
        
        {/* 1. 제목 */}
        <h1 className="trip-summary-title">서울 3박 4일 미식 여행</h1>

        {/* 2. 작성자 정보 및 우측 액션 버튼 */}
        <div className="trip-summary-info-row">
          {/* 좌측: 작성자, 좋아요, 북마크, 편집 */}
          <div className="trip-summary-meta-left">
            <span className="trip-meta-item">
              <User size={16} strokeWidth={2.5} /> 작성자 A
            </span>
            <span className="trip-meta-item">
              <Heart size={16} strokeWidth={2.5} /> 124
            </span>
            <span className="trip-meta-item">
              <Bookmark size={16} strokeWidth={2.5} /> 38
            </span>
            <span className="trip-meta-item text-secondary">
              <Edit2 size={14} /> 편집
            </span>
          </div>

          {/* 우측: 공유, 신고, 닫기 */}
          <div className="trip-summary-actions-right">
            <button className="trip-action-btn">
              <Share2 size={16} /> 공유
            </button>
            <button className="trip-action-btn">
              <Flag size={16} /> 신고
            </button>
            <button className="trip-action-btn">
              <ChevronUp size={20} /> 닫기
            </button>
          </div>
        </div>

        {/* 3. 날짜 정보 */}
        <div className="trip-summary-date-row">
          <Calendar size={14} />
          <span>2025년 12월 1일 ~ 2025년 12월 4일</span>
        </div>

        {/* 4. 설명 및 태그 */}
        <div className="trip-summary-desc">
          서울의 맛집만 골라 돌아다니는 먹방 여행 루트
        </div>
        <div className="trip-summary-tags">
          #미식 #도보 #혼행
        </div>

        {/* 5. 루트 경로 */}
        <div className="trip-summary-route">
          서울역 <span className="route-arrow">→</span> 성수 <span className="route-arrow">→</span> 강남 <span className="route-arrow">→</span> 홍대 <span className="route-arrow">→</span> 인천공항
          <span className="text-muted ms-2" style={{fontSize: '11px'}}>(총 4개 경유지)</span>
        </div>

      </Container>
    </div>
  );
};

export default TripSummaryBar;