import TripMapSection from '../../components/trip-detail/TripMapSection';

const TripMapSectionPreview = () => {
  return (
    <div className="bg-light p-4">
      <h5 className="mb-4 text-muted border-bottom pb-2">T-4023 지도 섹션 (TripMapSection)</h5>
      
      {/* 지도 컴포넌트 렌더링 */}
      <div className="border rounded-3 overflow-hidden shadow-sm">
        <TripMapSection />
      </div>
    </div>
  );
};

TripMapSectionPreview.meta = {
  title: 'Trip Detail Map Section',
  order: 30, // TripSummaryBar(20) 다음 순서
};

export default TripMapSectionPreview;