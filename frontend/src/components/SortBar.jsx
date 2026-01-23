import { Button } from 'react-bootstrap';
import { useCallback } from 'react';

/**
 * 정렬 바 컴포넌트 (T-4005)
 * 여행 카드를 좋아요 순(인기순)으로 정렬하는 UI를 제공
 */
const SortBar = ({
  isPopular = true,         // 인기순으로 정렬 중의 여부
  onTogglePopular,          // 인기순 토글 시 호출되는 콜백 함수
  title = '여행 일정',       // 좌측에 표시될 제목
}) => {
  const handleToggle = useCallback(() => {
    onTogglePopular?.();
  }, [onTogglePopular]);

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0" style={{ fontSize: '18px', fontWeight: '600' }}>
        {title}
      </h5>
      <Button
        variant={isPopular ? 'primary' : 'outline-secondary'}
        onClick={handleToggle}
        style={{
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: isPopular ? '600' : '500',
        }}
      >
        ❤️ 인기순
      </Button>
    </div>
  );
};

export default SortBar;
