import { useKakaoMap } from "../../hooks/useKakaoMap";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import MapLoadingPlaceholder from "./MapLoadingPlaceholder";

const TestKakaoMap = () => {
  const [loading, error] = useKakaoMap(); // 우리가 만든 훅 사용

  // 로딩/에러 상태 처리
  if (loading) return <MapLoadingPlaceholder message="성남 지도를 불러오는 중..." />;
  if (error) return <MapLoadingPlaceholder message={`카카오 지도 로드 에러: ${error.message}`} variant="error" />;

  return (
    <Map 
      center={{ lat: 37.444, lng: 127.132 }} 
      style={{ width: "100%", height: "100vh" }} // 브라우저 꽉 차게
      level={3} // 확대 레벨
    >
      {/* 테스트용 마커 하나 추가 */}
      <MapMarker position={{ lat: 37.444, lng: 127.132 }}>
        <div style={{ color: "#000", padding: "5px" }}>성남 테스트 위치</div>
      </MapMarker>
    </Map>
  );
};

export default TestKakaoMap;