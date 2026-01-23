import { useKakaoMap } from "../../hooks/useKakaoMap";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import MapLoadingPlaceholder from "./MapLoadingPlaceholder";

const MarkerMap = ({
    center = { lat: 37.366, lng: 127.108 }, // 기본값: 정자역
    level = 6,
    markers = [],
    width = "100%",
    height = "500vh"
})=> {
    const [loading, error] = useKakaoMap();

    if (loading) return <MapLoadingPlaceholder width={width} height={height} />;
    if (error) return <MapLoadingPlaceholder width={width} height={height} message="에러가 발생했습니다." variant="error" />;

    return (
        <Map center={center} style={{ width, height }} level={level}>
            {/* 1. 마커 표시 */}
            {markers.length > 0 && markers.map((marker, index) => (
                <MapMarker
                    key={`marker-${index}-${marker.lat}-${marker.lng}`}
                    position={{ lat: marker.lat, lng: marker.lng }}
                >
                    {marker.content && (
                        <div style={{ color: "#000", padding: "5px", fontSize: "12px", minWidth: "100px", textAlign: "center" }}>
                            {index + 1}. {marker.content} {/* 순번 표시 */}
                        </div>
                    )}
                </MapMarker>
            ))}
        </Map>
    );
};

export default MarkerMap;