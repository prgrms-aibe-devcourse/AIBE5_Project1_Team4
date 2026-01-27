// src/components/review/ReviewStats.jsx
import { Star } from 'lucide-react';
import { StarRatingDisplay } from './StarRating';

/**
 * 리뷰 통계 표시 컴포넌트
 * @param {number} reviewCount - 리뷰 개수
 * @param {number|null} avgRating - 평균 평점
 * @param {'default' | 'compact' | 'large'} variant - 표시 스타일
 */
export function ReviewStats({
  reviewCount = 0,
  avgRating = null,
  variant = 'default',
}) {
  if (variant === 'compact') {
    return (
      <div className="d-inline-flex align-items-center gap-1 text-muted small">
        <Star size={14} fill="#ffc107" color="#ffc107" />
        <span className="fw-semibold">
          {avgRating ? avgRating.toFixed(1) : '-'}
        </span>
        <span>({reviewCount})</span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className="text-center">
        <div className="display-4 fw-bold text-dark mb-1">
          {avgRating ? avgRating.toFixed(1) : '-'}
        </div>
        <StarRatingDisplay
          value={Math.round(avgRating || 0)}
          size={24}
          showLabel={false}
        />
        <div className="text-muted mt-2">
          {reviewCount > 0
            ? `${reviewCount}개의 리뷰`
            : '아직 리뷰가 없습니다'}
        </div>
      </div>
    );
  }

  // default
  return (
    <div className="d-flex align-items-center gap-2">
      <StarRatingDisplay
        value={Math.round(avgRating || 0)}
        size={18}
        showLabel={false}
      />
      <span className="fw-semibold">
        {avgRating ? avgRating.toFixed(1) : '-'}
      </span>
      <span className="text-muted">
        ({reviewCount}개 리뷰)
      </span>
    </div>
  );
}

/**
 * 리뷰 통계 배지 (카드 등에서 사용)
 */
export function ReviewStatsBadge({ reviewCount = 0, avgRating = null }) {
  if (reviewCount === 0) return null;

  return (
    <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
      <Star size={12} fill="#ffc107" color="#ffc107" />
      <span>{avgRating ? avgRating.toFixed(1) : '-'}</span>
      <span className="text-muted">({reviewCount})</span>
    </span>
  );
}
