// ============================================================================
// SortBar 컴포넌트 UI 프리뷰
// ============================================================================
// 이 파일은 UI 시스템에서 SortBar 컴포넌트의 다양한 상태를 미리 볼 수 있습니다.
// 인기순(좋아요 순) 정렬 선택 UI를 확인할 수 있습니다.

import { useState } from 'react';
import SortBar from '../../components/SortBar';

const SortBarPreview = () => {
  // 현재 선택된 정렬 옵션
  const [sortBy, setSortBy] = useState('latest');

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    console.log(`정렬이 변경되었습니다: ${newSort}`);
  };

  return (
    <div style={{ padding: '40px 20px' }}>
      {/* 헤드라인 */}
      <h2 style={{ marginBottom: '40px', fontSize: '24px', fontWeight: 'bold' }}>
        SortBar 컴포넌트 미리보기
      </h2>

      {/* 최신순 상태 */}
      <div style={{ marginBottom: '60px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#666' }}>
          1️⃣ 최신순 선택
        </h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <SortBar 
            sortBy={sortBy}
            onSortChange={handleSortChange}
            title="여행 일정"
          />
        </div>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          현재 선택: <strong style={{ color: '#0066cc' }}>{sortBy === 'latest' ? '최신순' : '인기순'}</strong>
        </p>
      </div>

      {/* 인기순 상태 */}
      <div style={{ marginBottom: '60px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#666' }}>
          2️⃣ 인기순 선택
        </h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <SortBar 
            sortBy="popular"
            onSortChange={handleSortChange}
            title="여행 일정"
          />
        </div>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          인기순(좋아요 많은 순)으로 정렬된 상태
        </p>
      </div>
    </div>
  );
};

export default SortBarPreview;
