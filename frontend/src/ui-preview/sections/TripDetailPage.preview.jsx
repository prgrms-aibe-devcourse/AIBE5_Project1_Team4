import React from 'react';
import TripDetailPage from '../../pages/TripDetailPage';


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