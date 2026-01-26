import React from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
// 찜(Heart)과 북마크(Bookmark) 아이콘 추가
import { User, ChevronRight, Map, Settings, LogOut, Heart, Bookmark } from 'lucide-react';

const MyPage = () => {
  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      {/* 1. 상단 프로필 섹션 */}
      <Card className="mb-4 border-0 shadow-sm bg-white">
        <Card.Body className="d-flex align-items-center p-4">
          <div className="bg-light rounded-circle p-3 me-3">
            <User size={40} className="text-secondary" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold">여행자</h5>
            <small className="text-muted">내 정보 확인 및 수정</small>
          </div>
          <Button variant="outline-primary" size="sm" className="ms-auto px-3">
            편집
          </Button>
        </Card.Body>
      </Card>

      {/* 2. 중단 활동 요약 (서비스 아이콘 맞춤형) */}
      <Row className="g-3 mb-4">
        {/* 찜 목록 */}
        <Col xs={4}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="text-primary mb-1"><Heart size={20} /></div>
              <div className="text-muted" style={{ fontSize: '12px' }}>찜</div>
              <div className="fw-bold">12</div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* 나의 여행 */}
        <Col xs={4}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="text-primary mb-1"><Map size={20} /></div>
              <div className="text-muted" style={{ fontSize: '12px' }}>내 여행</div>
              <div className="fw-bold">5</div>
            </Card.Body>
          </Card>
        </Col>

        {/* 북마크 (새로 추가) */}
        <Col xs={4}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="text-primary mb-1"><Bookmark size={20} /></div>
              <div className="text-muted" style={{ fontSize: '12px' }}>북마크</div>
              <div className="fw-bold">8</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. 메뉴 리스트 */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <ListGroup variant="flush">
          <ListGroup.Item action className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <Settings size={18} className="me-3 text-muted" />
              <span>계정 설정</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </ListGroup.Item>
          
          <ListGroup.Item action className="d-flex justify-content-between align-items-center py-3 text-danger">
            <div className="d-flex align-items-center">
              <LogOut size={18} className="me-3" />
              <span>로그아웃</span>
            </div>
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </Container>
  );
};

export default MyPage;