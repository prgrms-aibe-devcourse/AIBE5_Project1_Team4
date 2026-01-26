import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Heart, Map, Bookmark } from 'lucide-react';

/**
 * StatGroup 컴포넌트
 * @param {Object} stats - 부모로부터 전달받은 {likes, trips, bookmarks} 수치 데이터
 * @param {Function} onStatClick - 카드 클릭 시 실행될 핸들러 함수 (라벨과 타입을 인자로 보냄)
 */
const StatGroup = ({ stats, onStatClick }) => {
  
  // 📊 화면에 표시할 통계 항목 정의 (부모의 stats 데이터가 바뀌면 자동으로 리렌더링됨)
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
          // 🖱️ 클릭 이벤트: MyPage의 handleStatClick 순서(title, type)에 맞춰 인자 전달
          onClick={() => onStatClick(item.label, item.type)} 
          style={{ cursor: 'pointer' }}
        >
          {/* 부트스트랩 Card를 활용한 깔끔한 UI 구성 */}
          <Card className="text-center border-0 shadow-sm hover-shadow transition-all">
            <Card.Body className="py-3">
              {/* 루사이드 아이콘과 컬러 적용 */}
              <div className={`${item.color} mb-1`}>{item.icon}</div>
              
              {/* 실시간 DB 데이터 수치 표시 (0일 경우 기본값 0) */}
              <div className="fw-bold fs-5">{item.count}</div>
              
              {/* 항목 라벨 (찜, 내 여행, 북마크) */}
              <div className="text-muted" style={{ fontSize: '12px' }}>{item.label}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatGroup;