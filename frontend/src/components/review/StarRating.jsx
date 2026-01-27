// src/components/review/StarRating.jsx
import { Star } from 'lucide-react';
import { useCallback } from 'react';

/**
 * 별점 컴포넌트 (표시/입력 모드 지원)
 * @param {number} value - 현재 별점 (1~5)
 * @param {(rating: number) => void} onChange - 별점 변경 콜백 (없으면 읽기 전용)
 * @param {number} size - 별 크기 (px)
 * @param {string} color - 별 색상
 * @param {boolean} showLabel - 숫자 라벨 표시 여부
 */
export function StarRating({
  value = 0,
  onChange,
  size = 20,
  color = '#ffc107',
  emptyColor = '#e0e0e0',
  showLabel = false,
  disabled = false,
}) {
  const isEditable = !!onChange && !disabled;

  const handleClick = useCallback(
    (rating) => {
      if (isEditable) {
        onChange(rating);
      }
    },
    [isEditable, onChange]
  );

  const handleKeyDown = useCallback(
    (e, rating) => {
      if (isEditable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onChange(rating);
      }
    },
    [isEditable, onChange]
  );

  return (
    <div
      className="d-inline-flex align-items-center gap-1"
      role={isEditable ? 'radiogroup' : 'img'}
      aria-label={`별점 ${value}점`}
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= value;

        return (
          <span
            key={rating}
            onClick={() => handleClick(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            role={isEditable ? 'radio' : undefined}
            aria-checked={isEditable ? isFilled : undefined}
            aria-label={isEditable ? `${rating}점` : undefined}
            tabIndex={isEditable ? 0 : undefined}
            style={{
              cursor: isEditable ? 'pointer' : 'default',
              transition: 'transform 0.1s ease',
            }}
            className={isEditable ? 'star-rating__star' : ''}
            onMouseEnter={(e) => {
              if (isEditable) {
                e.currentTarget.style.transform = 'scale(1.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (isEditable) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Star
              size={size}
              fill={isFilled ? color : 'none'}
              color={isFilled ? color : emptyColor}
              strokeWidth={1.5}
            />
          </span>
        );
      })}

      {showLabel && (
        <span className="ms-1 small text-muted">
          {value > 0 ? value.toFixed(1) : '-'}
        </span>
      )}
    </div>
  );
}

/**
 * 별점 표시 전용 (읽기 모드)
 */
export function StarRatingDisplay({ value, size = 16, showLabel = true }) {
  return (
    <StarRating value={value} size={size} showLabel={showLabel} disabled />
  );
}
