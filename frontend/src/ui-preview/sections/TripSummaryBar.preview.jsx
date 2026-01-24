import TripSummaryBar from '../../components/trip-detail/TripSummaryBar';

const TripSummaryBarPreview = () => {
  return (
    <div className="bg-light p-4" style={{ minHeight: '400px' }}>
      <h5 className="mb-4 text-muted border-bottom pb-2">Trip-detail 상단 정보 바 </h5>
      
      <div className="border rounded-0 overflow-hidden shadow-sm">
        <TripSummaryBar />
        
        {/* 지도 영역 예시 (배경) */}
        <div style={{ height: '300px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          MAP AREA
        </div>
      </div>
    </div>
  );
};

TripSummaryBarPreview.meta = {
  title: 'Trip Detail Summary Bar',
  order: 20,
};

export default TripSummaryBarPreview;