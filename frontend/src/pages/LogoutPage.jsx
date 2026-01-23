import { Container, Spinner } from 'react-bootstrap';

function LogoutPage() {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" className="mb-3" />
        <p>로그아웃 중입니다...</p>
      </div>
    </Container>
  );
}

export default LogoutPage;
