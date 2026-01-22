// src/components/trips/TripCard.jsx
import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Heart, Bookmark } from 'lucide-react'; // 아이콘(설치 안했으면 일단 텍스트로 대체 가능)

const TripCard = ({ 
  title = "성수동 카페 투어", 
  author = "자바", 
  period = "1박 2일", 
  likes = 12, 
  image = "https://placehold.co/600x400" // 임시 이미지
}) => {
  return (
    <Card className="h-100 shadow-sm" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
      {/* 1. 썸네일 이미지 */}
      <div style={{ position: 'relative' }}>
        <Card.Img variant="top" src={image} style={{ height: '180px', objectFit: 'cover' }} />
        <Badge bg="dark" style={{ position: 'absolute', top: 10, right: 10 }}>
          {period}
        </Badge>
      </div>

      {/* 2. 내용물 */}
      <Card.Body>
        <Card.Title className="fs-5 fw-bold text-truncate">{title}</Card.Title>
        <Card.Text className="text-muted small">
          Edited by {author}
        </Card.Text>
        
        {/* 3. 하단 버튼들 (좋아요, 찜) */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex gap-2">
            <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-1">
              <span>❤️</span> {likes}
            </Button>
            <Button variant="outline-secondary" size="sm">
              <span>🔖</span>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TripCard;