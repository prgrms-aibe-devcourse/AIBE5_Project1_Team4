import { ButtonGroup, Button } from 'react-bootstrap';
import { useCallback } from 'react';

/**
 * 정렬 바 컴포넌트 (T-4005)
 * 여행 카드를 최신순/인기순으로 정렬하는 UI를 제공
 */
const SortBar = ({
  sortBy = 'latest',        // 현재 선택된 정렬 방식 ('latest' 또는 'popular')
  onSortChange,             // 정렬 변경 시 호출되는 콜백 함수
  title = '여행 일정',       // 좌측에 표시될 제목
}) => {
  const handleSortChange = useCallback((newSort) => {
    onSortChange?.(newSort);
  }, [onSortChange]);

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0" style={{ fontSize: '18px', fontWeight: '600' }}>
        {title}
      </h5>
      <ButtonGroup size="sm">
        <Button
          variant={sortBy === 'latest' ? 'primary' : 'outline-secondary'}
          onClick={() => handleSortChange('latest')}
          style={{
            borderRadius: '6px 0 0 6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: sortBy === 'latest' ? '600' : '500',
          }}
        >
          ⏱️ 최신순
        </Button>
        <Button
          variant={sortBy === 'popular' ? 'primary' : 'outline-secondary'}
          onClick={() => handleSortChange('popular')}
          style={{
            borderRadius: '0 6px 6px 0',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: sortBy === 'popular' ? '600' : '500',
          }}
        >
          ❤️ 인기순
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default SortBar;
