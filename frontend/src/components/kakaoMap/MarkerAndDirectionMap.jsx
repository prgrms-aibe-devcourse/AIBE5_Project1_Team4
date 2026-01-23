// src/components/kakaoMap/MarkerAndDirectionMap.jsx
import React, { useEffect } from "react";
import { useKakaoMap } from "../../hooks/useKakaoMap";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import { useKakaoDirections } from "../../hooks/useKakaoDirections";
import MapLoadingPlaceholder from "./MapLoadingPlaceholder";

const MarkerAndDirectionMap = ({
    center = { lat: 37.366, lng: 127.108 }, //초기 지도 중심 좌표
    level = 6,                              //지도 확대 레벨
    markers = [],                           // 화면에 표시할 장소들. [{ lat, lng, content }, ...] 형태의 배열
    width = "100%",
    height = "100vh"
}) => {

    const [loadingMap, mapError] = useKakaoMap();
    const { path, getDirections, loading: loadingRoute } = useKakaoDirections();

    useEffect(() => {
        if (markers.length >= 2) {
            getDirections(markers);
        }
    }, [markers, getDirections]);

    if (loadingMap) return <MapLoadingPlaceholder width={width} height={height} />;
    if (mapError) return <MapLoadingPlaceholder width={width} height={height} message="지도 로드 에러!" variant="error" />;

    return (
        <Map center={center} style={{ width, height }} level={level}>
            {/* 로딩 중일 때 표시할 UI (선택사항) */}
            {loadingRoute && (
                <div style={{ position: 'absolute', zIndex: 10, background: 'white', padding: '5px' }}>
                    경로 계산 중...
                </div>
            )}

            {/* 마커 표시 로직 */}
            {markers.map((marker, index) => {
                const isStart = index === 0;
                const isEnd = index === markers.length - 1;
                
                return (
                    <MapMarker 
                        key={`marker-${index}-${marker.lat}`} 
                        position={{ lat: marker.lat, lng: marker.lng }}
                    >
                        <div style={{ 
                            padding: "5px", 
                            color: isStart ? "blue" : isEnd ? "red" : "#333", 
                            fontSize: "12px",
                            minWidth: "100px",
                            textAlign: "center"
                        }}>
                            {isStart ? "출발: " : isEnd ? "도착: " : `${index}. `}
                            {marker.content}
                        </div>
                    </MapMarker>
                );
            })}

            {/* 계산된 경로 그리기 */}
            {path.length > 0 && (
                <Polyline
                    path={[path]}
                    strokeWeight={6}
                    strokeColor={"#157EFB"}
                    strokeOpacity={0.8}
                />
            )}
        </Map>
    );
};

export default MarkerAndDirectionMap;