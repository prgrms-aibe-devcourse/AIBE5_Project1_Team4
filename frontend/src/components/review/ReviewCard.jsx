// src/components/review/ReviewCard.jsx
import { getTimeAgo } from '@/utils/date';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge, Card, Dropdown } from 'react-bootstrap';
import { StarRatingDisplay } from './StarRating';

/**
 * 개별 리뷰 카드 컴포넌트
 * @param {Object} review - 리뷰 데이터
 * @param {boolean} showActions - 수정/삭제 액션 버튼 표시 여부
 * @param {() => void} onEdit - 수정 버튼 클릭 콜백
 * @param {() => void} onDelete - 삭제 버튼 클릭 콜백
 */
export function ReviewCard({
  review,
  showActions = false,
  onEdit,
  onDelete,
}) {
  if (!review) return null;

  const {
    id,
    rating,
    content,
    created_at,
    updated_at,
    author,
    is_mine,
  } = review;

  const isEdited = updated_at && updated_at !== created_at;
  const displayActions = showActions || is_mine;

  return (
    <Card className="review-card border-0 border-bottom rounded-0 py-3">
      <Card.Body className="p-0">
        {/* 헤더: 작성자 정보 + 액션 버튼 */}
        <div className="d-flex align-items-start justify-content-between mb-2">
          {/* 작성자 정보 */}
          <div className="d-flex align-items-center gap-2">
            {/* 아바타 */}
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.username}
                className="rounded-circle"
                width="40"
                height="40"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: '40px', height: '40px', fontSize: '16px' }}
              >
                {author?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}

            {/* 이름 + 작성일 */}
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">
                  {author?.full_name || author?.username || '익명'}
                </span>
                {is_mine && (
                  <Badge bg="primary" pill className="small">
                    내 리뷰
                  </Badge>
                )}
              </div>
              <div className="text-muted small">
                {getTimeAgo(created_at)}
                {isEdited && (
                  <span className="ms-1 text-muted">(수정됨)</span>
                )}
              </div>
            </div>
          </div>

          {/* 액션 버튼 (내 리뷰일 때만) */}
          {displayActions && (onEdit || onDelete) && (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="p-0 text-muted"
                style={{ boxShadow: 'none' }}
              >
                <MoreVertical size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {onEdit && (
                  <Dropdown.Item onClick={onEdit}>
                    <Pencil size={14} className="me-2" />
                    수정
                  </Dropdown.Item>
                )}
                {onDelete && (
                  <Dropdown.Item onClick={onDelete} className="text-danger">
                    <Trash2 size={14} className="me-2" />
                    삭제
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* 별점 */}
        <div className="mb-2">
          <StarRatingDisplay value={rating} size={18} showLabel={false} />
        </div>

        {/* 리뷰 내용 */}
        {content && (
          <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}
