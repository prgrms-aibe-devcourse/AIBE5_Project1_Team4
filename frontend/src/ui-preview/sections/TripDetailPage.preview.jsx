import React from 'react';
import TripDetailPage from '../../pages/TripDetailPage';

// (선택사항) 메타 정보 - 나중에 다시 리스트 형태가 필요할 때를 대비해 남겨둠
export const meta = {
  title: '여행 상세 페이지 통합 프리뷰',
  order: 1,
};

// 프리뷰 컴포넌트
const TripDetailPagePreview = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <TripDetailPage />
    </div>
  );
};

export default TripDetailPagePreview;