import { Container, Form, Button } from 'react-bootstrap';

function LoginPage() {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '360px' }}>
        <h3 className="mb-4 text-center">로그인</h3>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>이메일</Form.Label>
            <Form.Control type="email" placeholder="email@example.com" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>비밀번호</Form.Label>
            <Form.Control type="password" placeholder="비밀번호" />
          </Form.Group>

          <Button variant="primary" className="w-100" disabled>
            로그인 (임시)
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default LoginPage;
