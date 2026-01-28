import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Bookmark, Share2, User, MapPin, Siren, Heart, Pencil
} from 'lucide-react';
import { alert, toast } from '@/shared/ui/overlay';
import './TripSummaryBar.css';

/**
 * 여행 상세 정보 상단 요약 바 컴포넌트
 * @param {Object} summary - 정규화된 summary 데이터
 * @param {Function} onLikeClick - 좋아요 토글 핸들러
 * @param {Function} onBookmarkClick - 북마크 토글 핸들러
 */
const TripSummaryBar = ({ summary, onLikeClick, onBookmarkClick }) => {
  if (!summary) return null;

  const {
    id,
    title,
    description,
    start_date,
    end_date,
    regions = [],
    themes = [],
    author,
    like_count = 0,
    bookmark_count = 0,
    is_liked = false,
    is_bookmarked = false,
  } = summary;

    const handleShare = async () => {
    const url = window.location.href;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard-not-available');
      }

      await navigator.clipboard.writeText(url);
      await toast('상세페이지 링크가 복사되었습니다.');
    } catch (error) {
      await alert({
        title: '링크 복사 실패',
        text: `아래 링크를 복사해 주세요.

${url}`,
        icon: 'info',
        confirmText: '확인',
      });
    }
  };

  return (
    <div className="trip-summary-container">
      <div className="summary-left">
        <h1 className="summary-title">{title}</h1>

        {/* 작성자 + 카운트 */}
        <div className="summary-meta-row">
          <div className="meta-item author">
            <User size={18} />
            <span>{author?.name || '여행자'}</span>
          </div>

          <div className="meta-divider"></div>

          {/* 좋아요(아이콘+숫자) */}
          <button
            type="button"
            className="meta-item summary-icon-btn"
            onClick={onLikeClick}
            aria-pressed={is_liked}
            title="좋아요"
          >
            <Heart size={18} fill={is_liked ? 'currentColor' : 'none'} />
            <span>{like_count}</span>
          </button>

          {/* 북마크(아이콘+숫자) */}
          <button
            type="button"
            className="meta-item summary-icon-btn"
            onClick={onBookmarkClick}
            aria-pressed={is_bookmarked}
            title="북마크"
          >
            <Bookmark size={18} fill={is_bookmarked ? 'currentColor' : 'none'} />
            <span>{bookmark_count}</span>
          </button>
        </div>

        <div className="summary-date-row">
          <Calendar size={18} />
          <span>
            {start_date} ~ {end_date}
          </span>
        </div>

        <p className="summary-desc">{description}</p>

        <div className="summary-tags">
          {themes && themes.length > 0 ? (
            themes.map((tag, index) => <span key={index}>#{tag}</span>)
          ) : (
            <span>#여행</span>
          )}
        </div>

        <div className="summary-route">
          <MapPin size={16} className="text-muted" />
          <span className="route-text">
            {regions && regions.length > 0 ? regions.join(' → ') : '경로 정보 없음'}
          </span>
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="summary-right">
        <Link className="summary-btn-flat" to={`/trips/${id}/edit`}>
          <Pencil size={18} strokeWidth={2} /> <span>편집하기</span>
        </Link>
        
        <button className="summary-btn-flat">
          <Siren size={18} strokeWidth={2} /> <span>신고</span>
        </button>
        <button className="summary-btn-flat" onClick={handleShare} type="button">
          <Share2 size={18} strokeWidth={2} /> <span>공유하기</span>
        </button>
      </div>
    </div>
  );
};

export default TripSummaryBar;