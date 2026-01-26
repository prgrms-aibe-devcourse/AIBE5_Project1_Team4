import { PlaneTakeoff } from 'lucide-react';
import { Card, Container } from 'react-bootstrap';

export default function FullScreenLoader({ message = '처리 중...' }) {
  return (
    <div
      data-testid="auth-loading"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Container>
        <Card
          className="mx-auto border-0 shadow-lg"
          style={{ maxWidth: '400px', borderRadius: '20px' }}
        >
          <Card.Body className="p-5 d-flex flex-column align-items-center text-center">
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <PlaneTakeoff size={32} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark">Trip Planner</h3>
              <p className="text-muted small mb-0">{message}</p>
            </div>

            <div
              className="spinner-border"
              role="status"
              aria-label="loading"
            />
            <p className="text-muted small mt-3 mb-0">
              잠시만 기다려주세요. 곧 이동합니다.
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
