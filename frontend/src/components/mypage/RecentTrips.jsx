import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Map, Calendar, ChevronRight } from 'lucide-react';

const RecentTrips = ({ trips = [] }) => {
  // 샘플 데이터 (데이터가 없을 때를 대비)
  const displayTrips = trips.length > 0 ? trips : [
    { id: 1, title: '제주 올레길 트레킹', date: '12월 8일 - 12월 14일', location: '제주' },
    { id: 2, title: '도쿄 쇼핑 & 맛집', date: '6월 19일 - 6월 24일', location: '도쿄' },
  ];

  return (
    <>
      <h6 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
        최근 나의 여행
        <Button variant="link" className="text-decoration-none text-muted p-0 small">전체보기</Button>
      </h6>
      
      {displayTrips.map((trip) => (
        <Card key={trip.id} className="mb-3 border-0 shadow-sm hover-shadow" style={{ cursor: 'pointer' }}>
          <Card.Body className="p-3">
            <Row className="align-items-center">
              <Col xs="auto" className="pe-0">
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <Map size={24} className="text-primary" />
                </div>
              </Col>
              <Col>
                <div className="fw-bold text-dark">{trip.title}</div>
                <div className="text-muted small d-flex align-items-center mt-1">
                  <Calendar size={14} className="me-1" /> {trip.date}
                  <Badge bg="light" text="dark" className="ms-2 fw-normal">{trip.location}</Badge>
                </div>
              </Col>
              <Col xs="auto">
                <ChevronRight size={18} className="text-muted" />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

// ◀ 이 문장이 없으면 MyPage.jsx에서 에러가 발생해!
export default RecentTrips;