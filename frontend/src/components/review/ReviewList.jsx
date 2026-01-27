// src/components/review/ReviewList.jsx
import { Button, Spinner } from 'react-bootstrap';
import { ReviewCard } from './ReviewCard';

/**
 * 리뷰 목록 컴포넌트
 * @param {Array} reviews - 리뷰 배열
 * @param {boolean} loading - 로딩 중 여부
 * @param {boolean} hasMore - 더 불러올 데이터 있는지
 * @param {() => void} onLoadMore - 더 불러오기 콜백
 * @param {(review) => void} onEdit - 수정 콜백
 * @param {(review) => void} onDelete - 삭제 콜백
 * @param {string} emptyMessage - 리뷰 없을 때 메시지
 */
export function ReviewList({
  reviews = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onEdit,
  onDelete,
  emptyMessage = '아직 리뷰가 없습니다.',
}) {
  // 로딩 중 (첫 로딩)
  if (loading && reviews.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="text-muted mt-2 mb-0 small">리뷰를 불러오는 중...</p>
      </div>
    );
  }

  // 리뷰 없음
  if (reviews.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-0">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {/* 리뷰 목록 */}
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onEdit={review.is_mine && onEdit ? () => onEdit(review) : undefined}
          onDelete={
            review.is_mine && onDelete ? () => onDelete(review) : undefined
          }
        />
      ))}

      {/* 더 불러오기 버튼 */}
      {hasMore && (
        <div className="text-center py-3">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-1" />
                불러오는 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
