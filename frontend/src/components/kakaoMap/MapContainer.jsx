import React, { useMemo, useEffect, useRef } from 'react';
import {
  Map,
  MapMarker,
  Polyline,
  CustomOverlayMap,
} from 'react-kakao-maps-sdk';
import { useKakaoRoute } from '../../hooks/kakaoMap/useKakaoRoute';
import { useKakaoMap } from '../../hooks/kakaoMap/useKakaoMap';
import './map.css';

const MapContainer = ({
  mapCurrentDayPos = [],
  mapSearchPlacePos = [],
  onRouteData,
  drawSimplePath = false,
  selectedLocation = null,
}) => {
  // 1. 카카오 지도 SDK 로드 (JS API 키를 통해 지도를 실제 호출)
  const [loading, error] = useKakaoMap();

  // 2. 경로 계산 훅
  const {
    routeData,
    calculateRoute,
    loading: isRouteLoading,
  } = useKakaoRoute();

  // 3. 지도 인스턴스 참조
  const mapRef = useRef(null);

  // 4. 지도 중심 좌표 결정
  const center = useMemo(() => {
    // 선택된 위치가 있으면 우선적으로 사용
    if (selectedLocation) {
      return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }

    const firstSearch = mapSearchPlacePos[0];
    const firstItinerary = mapCurrentDayPos[0];

    if (firstSearch) return { lat: firstSearch.lat, lng: firstSearch.lng };
    if (firstItinerary)
      return { lat: firstItinerary.lat, lng: firstItinerary.lng };

    return { lat: 37.5665, lng: 126.978 }; // 기본값: 서울시청
  }, [mapSearchPlacePos, mapCurrentDayPos, selectedLocation]);

  const simplePath = useMemo(() => {
    return (mapCurrentDayPos || [])
      .map((point) => ({
        lat: Number(point?.lat),
        lng: Number(point?.lng),
      }))
      .filter((point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lng));
  }, [mapCurrentDayPos]);

  // 선택된 위치가 변경되면 지도 중심을 부드럽게 이동
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      const map = mapRef.current;
      const moveLatLng = new window.kakao.maps.LatLng(
        selectedLocation.lat,
        selectedLocation.lng
      );
      map.panTo(moveLatLng);
    }
  }, [selectedLocation]);

  //데이터 잘 들어오는지 확인-----------------------------------------------
  useEffect(() => {
    console.group('📍 MapContainer 데이터 유입 확인');
    console.log('📅 현재 일정 (mapCurrentDayPos):', mapCurrentDayPos);
    console.log('🔍 검색 장소 (mapSearchPlacePos):', mapSearchPlacePos);
    console.groupEnd();
  }, [mapCurrentDayPos, mapSearchPlacePos]);

  useEffect(() => {
    if (routeData.path.length > 0) {
      console.group('🚗 경로 계산 결과 (calculateRoute)');
      console.log('🛣 전체 경로 좌표 수:', routeData.path.length);
      console.log('⏱ 구간 정보:', routeData.sections);
      console.groupEnd();
    }

    if (typeof onRouteData === 'function') {
      onRouteData(routeData);
    }
  }, [routeData, onRouteData]);
  //------------------------------------------------------------------------

  // 4. 경로 계산 트리거
  useEffect(() => {
    if (mapCurrentDayPos.length >= 2) {
      calculateRoute(mapCurrentDayPos);
    }
  }, [mapCurrentDayPos, calculateRoute]);

  // --- [로딩 및 에러 상태 처리] ---
  if (loading)
    return (
      <div
        className="map-loading-state"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
        }}
      >
        <p>지도를 불러오는 중입니다...</p>
      </div>
    );

  if (error)
    return (
      <div
        className="map-error-state"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff0f0',
        }}
      >
        <p>지도를 로드할 수 없습니다. API 키를 확인해주세요.</p>
      </div>
    );

  return (
    <div className="trip-map" style={{ width: '100%', height: '100%' }}>
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={6}
        onCreate={(map) => {
          mapRef.current = map;
          map.relayout();
        }}
      >
        {/* --- [1] 검색 결과 마킹 --- */}
        {mapSearchPlacePos.map((place, i) => (
          <MapMarker
            key={`search-${place.id || i}`}
            position={{ lat: place.lat, lng: place.lng }}
            image={{
              src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              size: { width: 24, height: 35 },
            }}
            title={place.name}
          />
        ))}

        {/* --- [2] 현재 요일 일정 마킹 --- */}
        {mapCurrentDayPos.map((item, i) => (
          <MapMarker
            key={`itinerary-${item.id || i}`}
            position={{ lat: item.lat, lng: item.lng }}
          >
            <div className="marker-with-label">
              <div className="badge">{i + 1}</div>
              <div className="marker-place-name">{item.name || '장소'}</div>
            </div>
          </MapMarker>
        ))}

        {/* --- [3] 경로선 --- */}
        {(routeData.path.length > 0 || (drawSimplePath && simplePath.length > 1)) && (
          <Polyline
            path={routeData.path.length > 0 ? routeData.path : simplePath}
            strokeWeight={5}
            strokeColor="#4A90E2"
            strokeOpacity={0.8}
          />
        )}

        {/* --- [4] 구간 정보 --- */}
        {!isRouteLoading &&
          routeData.sections.map((section, index) => (
            <CustomOverlayMap
              key={`route-info-${index}`}
              position={section.midPoint}
              yAnchor={1.5}
            >
              <div className="route-info-bubble">
                {section.duration}분 | {section.distance}km
              </div>
            </CustomOverlayMap>
          ))}
      </Map>
    </div>
  );
};

export default MapContainer;
