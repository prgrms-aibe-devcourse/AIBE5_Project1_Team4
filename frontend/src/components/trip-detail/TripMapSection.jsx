import React, { useMemo, useState, useRef } from 'react'; // 👈 useRef 추가됨
import { Plus, Minus } from 'lucide-react'; 
import TripItineraryList from './TripItineraryList';
import MapContainer from '../kakaoMap/MapContainer';
import './TripMapSection.css';

/**
 * 여행 상세 페이지의 지도 및 일정 섹션 컴포넌트
 */
const TripMapSection = ({ schedules = [], members = [], selectedId = null, onScheduleClick }) => {
  // ✅ [수정됨] 지도를 조종할 리모컨(Ref) 생성
  const mapRef = useRef(null);

  const [routeSummary, setRouteSummary] = useState(null);
  // 선택된 일정 항목의 좌표 (null이면 기본값 사용)
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  // ✅ [수정됨] 지도 확대 처리 (레벨 숫자가 작을수록 확대됨)
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentLevel = mapRef.current.getLevel();
      mapRef.current.setLevel(currentLevel - 1, { animate: true });
    }
  };

  // ✅ [수정됨] 지도 축소 처리 (레벨 숫자가 클수록 축소됨)
  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentLevel = mapRef.current.getLevel();
      mapRef.current.setLevel(currentLevel + 1, { animate: true });
    }
  };

  // 일정 항목 클릭 시 지도 중심 이동
  const handleScheduleClick = (itemId) => {
    if (onScheduleClick) {
      onScheduleClick(itemId);
    }

    for (const day of schedules) {
      const item = day?.items?.find(i => i?.itemId === itemId);
      if (item && item?.place) {
        const lat = Number(item.place.lat);
        const lng = Number(item.place.lng);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          setSelectedLocation({ lat, lng, name: item.place.name });
          return;
        }
      }
    }
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
          mapRef={mapRef} // 👈 [수정됨] 자식에게 리모컨 전달!
          mapCurrentDayPos={mapCurrentDayPos}
          mapSearchPlacePos={[]}
          drawSimplePath
          selectedLocation={selectedLocation}
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
      
      {/* 일정 리스트 컴포넌트 */}
      <TripItineraryList
        schedules={schedules}
        members={members}
        selectedId={selectedId}
        routeSummary={routeSummary}
        onScheduleClick={handleScheduleClick}
      />
      
      {/* 줌 컨트롤 */}
      <div className="map-zoom-controls">
        {/* ✅ [수정됨] onClick 이벤트 연결 */}
        <button className="zoom-btn" aria-label="Zoom In" onClick={handleZoomIn}>
          <Plus size={20} />
        </button>
        <button className="zoom-btn" aria-label="Zoom Out" onClick={handleZoomOut}>
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
};

export default TripMapSection;