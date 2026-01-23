import { useKakaoMap } from "../../hooks/useKakaoMap";
import { Map, MapMarker } from "react-kakao-maps-sdk";

const TestKakaoMap = () => {
  const [loading, error] = useKakaoMap(); // 우리가 만든 훅 사용

// 1. 로딩 중일 때 메시지
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>성남 지도를 불러오는 중...</h3>
      </div>
    );
  }

  // 2. 에러 발생 시 (주로 API 키 문제)
  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>카카오 지도 로드 에러: {error.message}</div>;
  }

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