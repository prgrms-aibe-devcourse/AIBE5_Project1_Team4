//좌표들의 이동경로, 이동시간, 거리 계산해서 표시해주는 컴포넌트

import React, { useEffect } from 'react';
import { Map, MapMarker, Polyline, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useKakaoRoute } from '../../hooks/kakaoMap/useKakaoRoute'; // 훅 임포트
import { useKakaoMap } from '../../hooks/kakaoMap/useKakaoMap'; // 카카오 맵 로더 훅 임포트

const RouteDisplay = ({ markers }) => {
    // 1. 카카오 맵 스크립트 로드
    const { loading: mapLoading, error: mapError } = useKakaoMap();
    // 2. 경로 계산 훅 사용
    const { routeData, calculateRoute, loading: routeLoading, error: routeError } = useKakaoRoute();

    // 마커 데이터가 변경될 때마다 경로를 다시 계산
    useEffect(() => {
        if (markers && markers.length >= 2) {
            calculateRoute(markers);
        }
    }, [markers, calculateRoute]);

    // 로딩 및 에러 처리 UI
    if (mapError || routeError) {
        return <div className="alert alert-danger m-3">지도 로드 또는 경로 계산 중 에러 발생: {mapError || routeError}</div>;
    }
    if (mapLoading) {
        return <div className="p-5 text-center">지도를 불러오는 중입니다...</div>;
    }

    return (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div style={{ position: 'relative' }}>
                <Map 
                    // 마커가 없으면 성남시청 기준으로, 있으면 첫 마커 기준으로 중앙 설정
                    center={markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 37.420, lng: 127.126 }} 
                    style={{ width: '100%', height: '550px' }} 
                    level={7} // 지도 확대/축소 레벨
                >
                    {/* 1. 각 마커 표시 */}
                    {markers.map((marker, index) => (
                        <MapMarker 
                            key={`marker-${index}-${marker.lat}-${marker.lng}`} // 고유 키
                            position={{ lat: marker.lat, lng: marker.lng }}
                        >
                            <div style={{ 
                                padding: "5px", 
                                fontSize: "12px", 
                                textAlign: "center", 
                                minWidth: "80px",
                                color: "#333" 
                            }}>
                                {index === 0 ? "🚩 출발" : index === markers.length - 1 ? "🏁 도착" : `${index}. ${marker.content}`}
                            </div>
                        </MapMarker>
                    ))}

                    {/* 2. 전체 이동 경로선 표시 */}
                    {!routeLoading && routeData.path.length > 0 && (
                        <Polyline
                            path={[routeData.path]}
                            strokeWeight={6}
                            strokeColor="#157EFB" // 파란색 선
                            strokeOpacity={0.8}
                            strokeStyle="solid"
                        />
                    )}

                    {/* 3. 각 구간별 이동 시간/거리 오버레이 표시 */}
                    {!routeLoading && routeData.sections.map((section, idx) => (
                        section.midPoint && ( // 중간 지점 정보가 있을 때만 렌더링
                            <CustomOverlayMap 
                                key={`section-info-${idx}`} 
                                position={section.midPoint} 
                                yAnchor={1.4} // 경로선 위에 뜨도록 조정
                            >
                                <div style={{
                                    backgroundColor: 'white',
                                    border: '1.5px solid #157EFB',
                                    borderRadius: '15px',
                                    padding: '4px 10px',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap' // 텍스트 줄바꿈 방지
                                }}>
                                    <span style={{ color: '#157EFB' }}>{section.duration}분</span>
                                    <span style={{ marginLeft: '4px', color: '#666' }}>({section.distance}km)</span>
                                </div>
                            </CustomOverlayMap>
                        )
                    ))}
                </Map>

                {/* 경로 계산 중 로딩 스피너 */}
                {routeLoading && (
                    <div className="position-absolute top-50 start-50 translate-middle p-3 bg-white rounded-pill shadow-lg" style={{ zIndex: 10 }}>
                        <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                        성남 버스킹 경로 계산 중...
                    </div>
                )}
            </div>

            {/* 하단 요약 정보 (선택 사항: 전체 시간/거리 표시) */}
            {!routeLoading && routeData.totalDuration && (
                <div className="card-footer bg-light p-3 border-top d-flex justify-content-center align-items-center">
                    <span className="me-3 fw-bold text-primary">총 예상 시간: {routeData.totalDuration}분</span>
                    <span className="fw-bold text-secondary">총 예상 거리: {routeData.totalDistance}km</span>
                </div>
            )}
        </div>
    );
};

export default RouteDisplay;