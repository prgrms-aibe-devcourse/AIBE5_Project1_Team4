import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
// lucide-react가 없다면 npm install lucide-react 하세요. 일단 텍스트로 대체 가능.
// import { Map, User } from 'lucide-react'; 

const MainLayout = () => {
  return (
    <div className="d-flex flex-column vh-100">
      {/* 상단 GNB (Global Navigation Bar) */}
      <Navbar bg="white" expand="lg" className="border-bottom flex-shrink-0" style={{ height: '60px' }}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
            ✈️ Trip Planner
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/trips">여행 탐색</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Button variant="outline-primary" size="sm">로그인</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 여기가 핵심: 하위 페이지들이 렌더링될 영역 */}
      {/* 여행 편집 페이지처럼 꽉 찬 화면을 위해 flex-grow-1 적용 */}
      <main className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;