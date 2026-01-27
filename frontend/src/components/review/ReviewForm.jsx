// src/components/review/ReviewForm.jsx
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { StarRating } from './StarRating';

/**
 * 리뷰 작성/수정 폼 컴포넌트
 * @param {number} rating - 별점 (1~5)
 * @param {(rating: number) => void} onRatingChange
 * @param {string} content - 리뷰 내용
 * @param {(content: string) => void} onContentChange
 * @param {() => void} onSubmit - 제출 콜백
 * @param {() => void} onCancel - 취소 콜백
 * @param {() => void} onDelete - 삭제 콜백 (수정 모드일 때)
 * @param {boolean} isEditing - 수정 모드 여부
 * @param {boolean} submitting - 제출 중 여부
 * @param {boolean} deleting - 삭제 중 여부
 * @param {Object} error - 에러 객체
 * @param {boolean} isValid - 유효성 검사 통과 여부
 * @param {boolean} isDirty - 변경 사항 있는지
 */
export function ReviewForm({
  rating = 0,
  onRatingChange,
  content = '',
  onContentChange,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
  submitting = false,
  deleting = false,
  error = null,
  isValid = false,
  isDirty = false,
  placeholder = '이 여행/장소에 대한 경험을 공유해주세요.',
  maxLength = 1000,
}) {
  const isLoading = submitting || deleting;
  const canSubmit = isValid && isDirty && !isLoading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit?.();
    }
  };

  return (
    <Card className="review-form border shadow-sm">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* 별점 선택 */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">
              평점
            </Form.Label>
            <div>
              <StarRating
                value={rating}
                onChange={onRatingChange}
                size={28}
                disabled={isLoading}
              />
              {rating > 0 && (
                <span className="ms-2 text-muted small">
                  {getRatingLabel(rating)}
                </span>
              )}
            </div>
            {rating === 0 && (
              <Form.Text className="text-muted">
                별을 클릭하여 평점을 선택해주세요
              </Form.Text>
            )}
          </Form.Group>

          {/* 리뷰 내용 */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted">
              리뷰 내용 <span className="text-muted fw-normal">(선택)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={isLoading}
              style={{ resize: 'vertical' }}
            />
            <div className="d-flex justify-content-end mt-1">
              <Form.Text className="text-muted">
                {content.length} / {maxLength}
              </Form.Text>
            </div>
          </Form.Group>

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="danger" className="py-2 small">
              {error.message || '오류가 발생했습니다.'}
            </Alert>
          )}

          {/* 버튼 그룹 */}
          <div className="d-flex gap-2 justify-content-end">
            {/* 삭제 버튼 (수정 모드일 때만) */}
            {isEditing && onDelete && (
              <Button
                variant="outline-danger"
                onClick={onDelete}
                disabled={isLoading}
                size="sm"
              >
                {deleting ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </Button>
            )}

            {/* 취소 버튼 */}
            {onCancel && (
              <Button
                variant="outline-secondary"
                onClick={onCancel}
                disabled={isLoading}
                size="sm"
              >
                취소
              </Button>
            )}

            {/* 제출 버튼 */}
            <Button
              variant="primary"
              type="submit"
              disabled={!canSubmit}
              size="sm"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  저장 중...
                </>
              ) : isEditing ? (
                '수정'
              ) : (
                '작성'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

/**
 * 별점 라벨
 */
function getRatingLabel(rating) {
  const labels = {
    1: '별로예요',
    2: '그저 그래요',
    3: '괜찮아요',
    4: '좋아요',
    5: '최고예요!',
  };
  return labels[rating] || '';
}

/**
 * 훅과 연동된 리뷰 폼 (편의용)
 */
export function ReviewFormWithHook({ form, onCancel, placeholder }) {
  return (
    <ReviewForm
      rating={form.rating}
      onRatingChange={form.setRating}
      content={form.content}
      onContentChange={form.setContent}
      onSubmit={form.submit}
      onCancel={onCancel}
      onDelete={form.existingReview ? form.remove : undefined}
      isEditing={form.isEditing}
      submitting={form.submitting}
      deleting={form.deleting}
      error={form.error}
      isValid={form.isValid}
      isDirty={form.isDirty}
      placeholder={placeholder}
    />
  );
}
