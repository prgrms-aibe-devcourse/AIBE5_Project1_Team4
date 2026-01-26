import React from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Badge } from 'react-bootstrap';
import { User, ChevronRight, Map, Settings, LogOut, Heart, Bookmark, Calendar } from 'lucide-react';

const MyPage = () => {
  // 샘플 데이터 (나중에 Supabase 연결)
  const myTrips = [
    { id: 1, title: '제주 올레길 트레킹', date: '12월 8일 - 12월 14일', location: '제주' },
    { id: 2, title: '도쿄 쇼핑 & 맛집', date: '6월 19일 - 6월 24일', location: '도쿄' },
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}> {/* 배경색으로 공간 분리 */}
      <Container className="py-5" style={{ maxWidth: '1000px' }}> {/* 너비를 1000px로 확장 */}
        <Row className="g-4">
          
          {/* 왼쪽 사이드: 프로필 및 메뉴 (Col 4) */}
          <Col lg={4}>
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="bg-light rounded-circle p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                  <User size={60} className="text-secondary" />
                </div>
                <h5 className="fw-bold">여행자</h5>
                <p className="text-muted small">traveler@example.com</p>
                <Button variant="outline-primary" size="sm" className="w-100 rounded-pill">
                  프로필 수정
                </Button>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
              <ListGroup variant="flush">
                <ListGroup.Item action className="d-flex align-items-center py-3">
                  <Settings size={18} className="me-3 text-muted" />
                  <span>계정 설정</span>
                </ListGroup.Item>
                <ListGroup.Item action className="d-flex align-items-center py-3 text-danger border-top">
                  <LogOut size={18} className="me-3" />
                  <span>로그아웃</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          {/* 오른쪽 메인: 통계 및 활동 (Col 8) */}
          <Col lg={8}>
            {/* 상단 통계 수치 */}
            <Row className="g-3 mb-4">
              {[
                { label: '찜', count: 12, icon: <Heart size={20} />, color: 'text-danger' },
                { label: '내 여행', count: 5, icon: <Map size={20} />, color: 'text-primary' },
                { label: '북마크', count: 8, icon: <Bookmark size={20} />, color: 'text-warning' }
              ].map((item, idx) => (
                <Col key={idx} xs={4}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body className="py-3">
                      <div className={`${item.color} mb-1`}>{item.icon}</div>
                      <div className="fw-bold fs-5">{item.count}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>{item.label}</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 내 여행 미리보기 섹션 (화면을 꽉 채워줌) */}
            <h6 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
              최근 나의 여행
              <Button variant="link" className="text-decoration-none text-muted p-0 small">전체보기</Button>
            </h6>
            
            {myTrips.map((trip) => (
              <Card key={trip.id} className="mb-3 border-0 shadow-sm hover-shadow" style={{ cursor: 'pointer' }}>
                <Card.Body className="p-3">
                  <Row className="align-items-center">
                    <Col xs={"auto"} className="pe-0">
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

            {/* 데이터가 없을 때의 가이드 (빈 공간 방지) */}
            {myTrips.length === 0 && (
              <Card className="border-0 shadow-sm bg-white text-center py-5">
                <Card.Body>
                  <Map size={40} className="text-light mb-3" />
                  <p className="text-muted">아직 생성된 여행 일정이 없습니다.</p>
                  <Button variant="primary" size="sm">첫 여행 계획하기</Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MyPage;