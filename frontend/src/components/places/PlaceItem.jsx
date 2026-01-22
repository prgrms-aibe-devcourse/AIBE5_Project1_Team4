// src/components/places/PlaceItem.jsx
import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { MapPin, Plus } from 'lucide-react'; // 아이콘 추가

const PlaceItem = ({ place, onAdd }) => {
  // 스키마(D. Knowledge Layer)에 맞춘 데이터 매핑
  // place 데이터는 Kakao API 검색 결과 또는 DB의 places 테이블 포맷을 따름
  const { 
    place_name,           // 장소명
    road_address_name,    // 도로명 주소
    address_name,         // 지번 주소 (도로명 없으면 이거 씀)
    category_group_name,  // 카테고리 (예: 카페, 음식점)
    place_url             // 카카오맵 링크
  } = place;

  return (
    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white hover-bg-light">
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <h6 className="mb-0 text-truncate fw-bold">{place_name}</h6>
          {category_group_name && (
            <Badge bg="light" text="secondary" className="border fw-normal">
              {category_group_name}
            </Badge>
          )}
        </div>
        
        <div className="d-flex align-items-center text-muted small text-truncate">
          <MapPin size={14} className="me-1" />
          <span>{road_address_name || address_name}</span>
        </div>
        
        {/* 디버깅용: 나중에 실제 링크 연결 */}
        {place_url && (
           <a href={place_url} target="_blank" rel="noreferrer" className="text-decoration-none small ms-1" style={{ fontSize: '0.75rem' }}>
             (지도 보기)
           </a>
        )}
      </div>
      
      <Button 
        variant="outline-primary" 
        size="sm" 
        className="ms-3 rounded-circle p-2 d-flex align-items-center justify-content-center"
        style={{ width: '32px', height: '32px' }}
        onClick={() => onAdd(place)}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
};

export default PlaceItem;