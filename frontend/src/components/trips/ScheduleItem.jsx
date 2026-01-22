import React from 'react';
import { Card } from 'react-bootstrap';
import { MapPin, Utensils, Bed, Ticket, Coffee } from 'lucide-react';

// 카테고리별 아이콘 & 색상 설정
const getCategoryConfig = (category) => {
  switch (category) {
    case 'food': return { icon: <Utensils size={18} />, color: 'text-warning' }; // 식당 (주황)
    case 'cafe': return { icon: <Coffee size={18} />, color: 'text-brown' };     // 카페 (브라운)
    case 'hotel': return { icon: <Bed size={18} />, color: 'text-primary' };     // 숙소 (파랑)
    case 'activity': return { icon: <Ticket size={18} />, color: 'text-success' }; // 명소 (초록)
    default: return { icon: <MapPin size={18} />, color: 'text-secondary' };     // 기본 (회색)
  }
};

const ScheduleItem = ({ item, onClick }) => {
  const { startTime, placeName, category, memo } = item;
  const { icon, color } = getCategoryConfig(category);

  // 시간 포맷팅 (시간이 없으면 --:-- 표시)
  const displayTime = startTime ? startTime.substring(0, 5) : '--:--';

  return (
    <Card 
      className="mb-2 border-0 shadow-sm" 
      onClick={() => onClick && onClick(item)}
      style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
    >
      <Card.Body className="p-3">
        <div className="d-flex align-items-start">
          {/* 1. 시간 영역 */}
          <div className="d-flex flex-col align-items-center me-3" style={{ minWidth: '45px' }}>
            <span className={`fw-bold ${startTime ? 'text-dark' : 'text-muted'}`}>
              {displayTime}
            </span>
          </div>

          {/* 2. 아이콘 영역 */}
          <div className={`me-3 mt-1 ${color}`}>
            {icon}
          </div>

          {/* 3. 정보 영역 */}
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
              {placeName}
            </h6>
            {memo && (
              <div className="text-muted small bg-light p-2 rounded mt-1">
                {memo}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ScheduleItem;