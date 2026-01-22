// src/ui-preview/sections/Place.preview.jsx

import { Container } from 'react-bootstrap';
import PlaceItem from '../../components/places/Placeitem';

const PlacePreview = () => {
  // 카카오 API에서 넘어오는 가짜 데이터 (스키마 준수)
  const dummyPlaces = [
    {
      id: 12345,
      place_name: "스타벅스 성수역점",
      road_address_name: "서울 성동구 아차산로 100",
      address_name: "서울 성동구 성수동2가 300-1",
      category_group_name: "카페",
      place_url: "http://place.map.kakao.com/12345"
    },
    {
      id: 67890,
      place_name: "성수족발",
      road_address_name: "서울 성동구 아차산로7길 7",
      address_name: "서울 성동구 성수동2가 289-273",
      category_group_name: "음식점",
      place_url: "http://place.map.kakao.com/67890"
    }
  ];

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>장소 검색 결과 (PlaceItem)</h3>
      <p>Kakao 검색 결과 및 DB 저장된 장소 표시용</p>
      
      <div className="bg-white border rounded shadow-sm" style={{ maxWidth: '500px' }}>
        {dummyPlaces.map((place) => (
          <PlaceItem
            key={place.id} 
            place={place} 
            onAdd={(p) => alert(`${p.place_name} 추가됨!`)} 
          />
        ))}
      </div>
    </Container>
  );
};

export default PlacePreview;