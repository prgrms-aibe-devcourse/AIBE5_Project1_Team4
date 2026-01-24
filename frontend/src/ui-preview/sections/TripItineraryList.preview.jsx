import React from 'react';

import TripItineraryList from '../../components/trip-detail/TripItineraryList';

const TripItineraryListPreview = () => {
  return (
    <div className="bg-light p-4">
      <h5 className="mb-4 text-muted border-bottom pb-2">Trip-detail 일정 리스트</h5>
      
      {/* 실제 페이지처럼 좌측엔 지도(가짜), 우측엔 리스트를 배치해봅니다 */}
      <div className="row">
        {/* 가짜 지도 영역 */}
        <div className="col-md-8 text-muted p-5 border rounded bg-white text-center d-flex align-items-center justify-content-center">
           (여기는 지도 섹션이 들어갈 자리입니다)
        </div>

        {/* 👇 우리가 만든 일정 리스트 */}
        <div className="col-md-4">
          <TripItineraryList />
        </div>
      </div>
    </div>
  );
};

TripItineraryListPreview.meta = {
  title: 'Trip Detail Itinerary List', // 프리뷰 목록 이름 변경
  order: 40, // 지도(30) 다음 순서
};

export default TripItineraryListPreview;