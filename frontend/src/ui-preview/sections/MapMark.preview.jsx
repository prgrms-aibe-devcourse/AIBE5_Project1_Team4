import RouteDisplay from '../../components/kakaoMap/MapMark';

const tourPoints = [
  { lat: 37.368846, lng: 127.106509, content: "정자역" },
  { lat: 37.400588, lng: 127.108422, content: "판교역" },
  { lat: 37.387062, lng: 127.127602, content: "야탑역" },
  { lat: 37.44754, lng: 127.16431, content: "모란역" }, // 추가 지점
];

const MapMarkerPreview = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>성남 버스킹 투어 경로</h1>
      <RouteDisplay markers={tourPoints} />
    </div>
  );

};

export default MapMarkerPreview;