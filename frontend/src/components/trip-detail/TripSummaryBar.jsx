import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Bookmark, Share2, User, MapPin, Siren, Heart, Pencil
} from 'lucide-react';
import './TripSummaryBar.css';

/**
 * 여행 상세 정보 상단 요약 바 컴포넌트
 * @param {Object} summary - DB(RPC)에서 받아온 여행 요약 데이터
 */
const TripSummaryBar = ({ summary }) => {
  // 데이터가 로드되지 않았을 경우 렌더링 방지
  if (!summary) return null;

  // 구조 분해 할당을 통해 가독성 확보
  const {
    id,
    title,
    description,
    start_date,
    end_date,
    regions = [],
    themes = [],
    author, // { name, avatar_url } 구조
    like_count = 0,
    bookmark_count = 0
  } = summary;

  return (
    <div className="trip-summary-container">
      <div className="summary-left">
        {/* 여행 제목 */}
        <h1 className="summary-title">{title}</h1>

        {/* 작성자 정보 및 소셜 통계 */}
        <div className="summary-meta-row">
          <div className="meta-item author">
            <User size={18} />
            {/* 작성자 이름 출력 (서일현 등 실명 연동 완료) */}
            <span>{author?.name || '여행자'}</span>
          </div>
          <div className="meta-divider"></div>
          <div className="meta-item">
            <Bookmark size={18} />
            <span>{bookmark_count}</span>
          </div>
          <div className="meta-item">
            <Heart size={18} />
            <span>{like_count}</span>
          </div>
        </div>

        {/* 여행 일정 기간 */}
        <div className="summary-date-row">
          <Calendar size={18} />
          <span>{start_date} ~ {end_date}</span>
        </div>

        {/* 여행 설명 및 테마 태그 */}
        <p className="summary-desc">{description}</p>
        <div className="summary-tags">
          {themes && themes.length > 0 ? (
            themes.map((tag, index) => <span key={index}>#{tag}</span>)
          ) : (
            <span>#여행</span>
          )}
        </div>

        {/* 여행 경로 요약 */}
        <div className="summary-route">
          <MapPin size={16} className="text-muted" />
          <span className="route-text">
            {regions && regions.length > 0 ? regions.join(' → ') : "경로 정보 없음"}
          </span>
        </div>
      </div>

      {/* 우측 액션 버튼 영역 */}
      <div className="summary-right">
        <Link className="summary-btn-flat" to={`/trips/${id}/edit`}>
          <Pencil size={18} strokeWidth={2} /> <span>편집하기</span>
        </Link>
        <button className="summary-btn-flat">
          <Bookmark size={18} strokeWidth={2} /> <span>저장됨</span>
        </button>
        <button className="summary-btn-flat">
          <Siren size={18} strokeWidth={2} /> <span>신고</span>
        </button>
        <button className="summary-btn-flat">
          <Share2 size={18} strokeWidth={2} /> <span>공개하기</span>
        </button>
      </div>
    </div>
  );
};

export default TripSummaryBar;