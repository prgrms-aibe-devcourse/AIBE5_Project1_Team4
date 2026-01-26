import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Heart, Map, Bookmark } from 'lucide-react';

/**
 * StatGroup 컴포넌트
 * - 마이페이지 상단에 찜, 내 여행, 북마크 수치를 표시함
 * - 각 카드를 클릭하면 상세 목록 모달을 띄우기 위해 onStatClick 함수를 호출함
 */
const StatGroup = ({ stats, onStatClick }) => {
  const items = [
    { type: 'likes', label: '찜', count: stats?.likes || 0, icon: <Heart size={20} />, color: 'text-danger' },
    { type: 'trips', label: '내 여행', count: stats?.trips || 0, icon: <Map size={20} />, color: 'text-primary' },
    { type: 'bookmarks', label: '북마크', count: stats?.bookmarks || 0, icon: <Bookmark size={20} />, color: 'text-warning' }
  ];

  return (
    <Row className="g-3 mb-4">
      {items.map((item, idx) => (
        <Col 
          key={idx} 
          xs={4} 
          onClick={() => onStatClick(item.type, item.label)} // ◀ 클릭 시 상위(MyPage)로 타입과 라벨 전달
          style={{ cursor: 'pointer' }}
        >
          <Card className="text-center border-0 shadow-sm hover-shadow">
            <Card.Body className="py-3">
              <div className={`${item.color} mb-1`}>{item.icon}</div>
              <div className="fw-bold fs-5">{item.count}</div>
              <div className="text-muted" style={{ fontSize: '12px' }}>{item.label}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ◀ 에러 해결의 핵심! default로 내보내기
export default StatGroup;