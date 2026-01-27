// src/components/review/ReviewSection.jsx
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTripReviewForm, usePlaceReviewForm } from '@/hooks/reviews';
import { useTripReviews } from '@/hooks/reviews/useTripReviews';
import { usePlaceReviews } from '@/hooks/reviews/usePlaceReviews';
import { useState } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { ReviewFormWithHook } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { ReviewStats } from './ReviewStats';

/**
 * Trip 리뷰 섹션 (통합 컴포넌트)
 * - 통계 표시
 * - 리뷰 작성 폼
 * - 리뷰 목록
 */
export function TripReviewSection({ tripId }) {
  const { isAuthed } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { reviews, stats, hasMore, status, loadMore, refresh } =
    useTripReviews(tripId);

  const form = useTripReviewForm(tripId, {
    onSuccess: () => {
      refresh();
      setShowForm(false);
    },
  });

  const handleEditReview = () => {
    setShowForm(true);
  };

  const handleDeleteReview = async () => {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      await form.remove();
      refresh();
    }
  };

  return (
    <Card className="review-section border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0 fw-bold">리뷰</h5>
          <ReviewStats
            reviewCount={stats.review_count}
            avgRating={stats.avg_rating}
            variant="compact"
          />
        </div>

        {/* 리뷰 작성 버튼 */}
        {isAuthed && !showForm && !form.existingReview && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            리뷰 작성
          </Button>
        )}

        {/* 내 리뷰 수정 버튼 */}
        {isAuthed && !showForm && form.existingReview && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            내 리뷰 수정
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {/* 로그인 안내 */}
        {!isAuthed && (
          <Alert variant="light" className="text-center mb-3 border">
            <a href="/login" className="text-primary text-decoration-none">
              로그인
            </a>
            하고 리뷰를 작성해보세요!
          </Alert>
        )}

        {/* 리뷰 작성/수정 폼 */}
        {showForm && (
          <div className="mb-4">
            <ReviewFormWithHook
              form={form}
              onCancel={() => {
                form.reset();
                setShowForm(false);
              }}
              placeholder="이 여행에 대한 경험을 공유해주세요."
            />
          </div>
        )}

        {/* 리뷰 목록 */}
        <ReviewList
          reviews={reviews}
          loading={status === 'loading'}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          emptyMessage="첫 번째 리뷰를 작성해보세요!"
        />
      </Card.Body>
    </Card>
  );
}

/**
 * Place 리뷰 섹션 (통합 컴포넌트)
 */
export function PlaceReviewSection({ placeId }) {
  const { isAuthed } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { reviews, stats, hasMore, status, loadMore, refresh } =
    usePlaceReviews(placeId);

  const form = usePlaceReviewForm(placeId, {
    onSuccess: () => {
      refresh();
      setShowForm(false);
    },
  });

  const handleEditReview = () => {
    setShowForm(true);
  };

  const handleDeleteReview = async () => {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      await form.remove();
      refresh();
    }
  };

  return (
    <Card className="review-section border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0 fw-bold">리뷰</h5>
          <ReviewStats
            reviewCount={stats.review_count}
            avgRating={stats.avg_rating}
            variant="compact"
          />
        </div>

        {isAuthed && !showForm && !form.existingReview && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            리뷰 작성
          </Button>
        )}

        {isAuthed && !showForm && form.existingReview && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            내 리뷰 수정
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {!isAuthed && (
          <Alert variant="light" className="text-center mb-3 border">
            <a href="/login" className="text-primary text-decoration-none">
              로그인
            </a>
            하고 리뷰를 작성해보세요!
          </Alert>
        )}

        {showForm && (
          <div className="mb-4">
            <ReviewFormWithHook
              form={form}
              onCancel={() => {
                form.reset();
                setShowForm(false);
              }}
              placeholder="이 장소에 대한 경험을 공유해주세요."
            />
          </div>
        )}

        <ReviewList
          reviews={reviews}
          loading={status === 'loading'}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          emptyMessage="첫 번째 리뷰를 작성해보세요!"
        />
      </Card.Body>
    </Card>
  );
}
