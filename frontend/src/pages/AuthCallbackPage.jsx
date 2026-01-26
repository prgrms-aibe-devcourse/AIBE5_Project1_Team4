import { PlaneTakeoff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { exchangeCodeForSession, getSession } from '@/services/auth.service';
import FullScreenLoader from '../components/FullScreenLoader';
import { popReturnTo } from '../features/auth/auth.feature';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('loading'); // "loading" | "success" | "error"
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          await exchangeCodeForSession(code);
        }

        const session = await getSession();
        if (!session) {
          throw new Error('세션이 생성되지 않았어요. 다시 로그인해 주세요.');
        }

        if (cancelled) return;

        setStatus('success');
        setMessage('로그인 완료!');

        const returnTo = popReturnTo();
        window.location.replace(returnTo);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setMessage(e?.message || '로그인 처리 중 오류가 발생했어요.');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return <FullScreenLoader message="로그인 처리중..." />;
  }

  if (status === 'error') {
    return (
      <div
        className="min-vh-100 d-flex align-items-center"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <Container>
          <Card
            className="mx-auto border-0 shadow-lg"
            style={{ maxWidth: '400px', borderRadius: '20px' }}
          >
            <Card.Body className="p-5 d-flex flex-column align-items-center">
              <div className="text-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <PlaneTakeoff size={32} className="text-primary" />
                </div>
                <h3 className="fw-bold text-dark mb-1">
                  로그인 처리에 실패했어요
                </h3>
                <p className="text-muted small mb-0">
                  일시적인 문제일 수 있어요. 아래 버튼으로 다시 시도해 주세요.
                </p>
              </div>

              <div
                className="alert alert-danger w-100 small"
                role="alert"
                style={{ maxWidth: '300px' }}
              >
                <div className="fw-semibold mb-1">에러 메시지</div>
                <div style={{ wordBreak: 'break-word' }}>{message}</div>
              </div>

              <div
                className="d-grid gap-2 w-100 mt-2"
                style={{ maxWidth: '300px' }}
              >
                <Button
                  variant="primary"
                  onClick={() => window.location.replace('/login')}
                >
                  로그인으로 이동
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                >
                  다시 시도
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => window.location.replace('/')}
                >
                  홈으로
                </Button>
              </div>

              <div
                className="text-muted small mt-3 text-center"
                style={{ maxWidth: '300px' }}
              >
                계속 문제가 발생하면 잠시 후 다시 시도하거나, 브라우저를
                새로고침해 보세요.
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  // success (대부분 replace로 바로 넘어가지만, 톤 통일)
  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ backgroundColor: '#f8f9fa' }}
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
              <p className="text-muted small mb-0">
                {message || '로그인 완료!'}
              </p>
            </div>

            <div
              className="spinner-border"
              role="status"
              aria-label="redirecting"
            />
            <p className="text-muted small mt-3 mb-0">이동 중...</p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
