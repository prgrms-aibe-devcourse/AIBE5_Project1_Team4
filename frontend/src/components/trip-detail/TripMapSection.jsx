import React, { useMemo, useState } from 'react';
import { Plus, Minus } from 'lucide-react'; 
import TripItineraryList from './TripItineraryList';
import MapContainer from '../kakaoMap/MapContainer';
import './TripMapSection.css';

/**
 * 여행 상세 페이지의 지도 및 일정 섹션 컴포넌트
 * 
 * Props:
 *   - schedules: RPC에서 받은 일정 데이터 배열 (days 배열)
 *     구조: [ { dayId, date, items: [ { itemId, time, place: { name, lat, lng } } ] } ]
 *   - members: RPC에서 받은 멤버 데이터 배열
 *     구조: [ { userId, role, displayName, isSelf } ]
 *   - selectedId: 현재 선택된 일정 항목의 ID (지도 마커 강조용)
 */
const TripMapSection = ({ schedules = [], members = [], selectedId = null }) => {
  // 지도 줌 레벨 상태 (향후 지도 라이브러리 연동용)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [routeSummary, setRouteSummary] = useState(null);

  const mapCurrentDayPos = useMemo(() => {
    const points = [];

    schedules.forEach((day) => {
      day?.items?.forEach((item) => {
        const place = item?.place;
        const lat = Number(place?.lat);
        const lng = Number(place?.lng);

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          points.push({
            id: item?.itemId || place?.id,
            name: place?.name || '장소',
            lat,
            lng,
          });
        }
      });
    });

    return points;
  }, [schedules]);

  // 지도 확대 처리 (최대 3배까지)
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  // 지도 축소 처리 (최소 0.5배까지)
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className="trip-detail-map-container" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '600px' 
    }}>
      {/* 지도 */}
      <div className="trip-map-layer">
        <MapContainer
          mapCurrentDayPos={mapCurrentDayPos}
          mapSearchPlacePos={[]}
          drawSimplePath
          onRouteData={(data) => {
            if (data?.path?.length > 0) {
              setRouteSummary({
                totalDuration: data.totalDuration,
                totalDistance: data.totalDistance,
              });
            } else {
              setRouteSummary(null);
            }
          }}
        />
      </div>
      
      {/* 일정 리스트 컴포넌트: schedules, members, selectedId props를 전달 */}
      <TripItineraryList
        schedules={schedules}
        members={members}
        selectedId={selectedId}
        routeSummary={routeSummary}
      />
      
      {/* 줌 컨트롤 */}
      <div className="map-zoom-controls">
        <button className="zoom-btn" aria-label="Zoom In">
          <Plus size={20} />
        </button>
        <button className="zoom-btn" aria-label="Zoom Out">
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
};

export default TripMapSection;