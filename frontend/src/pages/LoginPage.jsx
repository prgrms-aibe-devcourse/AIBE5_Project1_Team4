import { Mail, PlaneTakeoff } from 'lucide-react';
import { useState } from 'react';
import {
  Alert as BsAlert,
  Button,
  Card,
  Container,
  Form,
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { KakaoLoginButton } from '../components/KakaoLoginButton';
import { signInWithEmailOtp } from '../services/auth.service';
import { alert, toast } from '../shared/ui/overlay'; // ✅ alert 다시 추가

function notifyAuthError(e) {
  if (e?.name === 'AppError') {
    if (e.kind === 'validation') return toast(e.message, { icon: 'warning' });
    if (e.kind === 'network') return toast(e.message, { icon: 'warning' });

    // ✅ 모달(alert)로 표시
    return alert({
      title: '요청 실패',
      text: e.message,
      icon: 'error',
    });
  }

  // fallback
  return alert({
    title: '요청 실패',
    text: e?.message ?? '알 수 없는 오류가 발생했습니다.',
    icon: 'error',
  });
}

/**
 * NOTE:
 * - 이 페이지는 이메일 로그인과 카카오 로그인 기능만 제공합니다.
 */
const LoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = new URLSearchParams(location.search).get('returnTo');

  // ✅ submit 이벤트를 받아 preventDefault 처리
  async function onEmailOtpLogin(e) {
    e?.preventDefault?.();

    if (loading) return;

    if (!email) {
      toast('이메일을 입력해주세요.', { icon: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailOtp(email);
      toast(
        '메일을 보냈어요! 메일함(스팸함 포함)에서 로그인 링크를 확인해주세요.',
        {
          icon: 'success',
          timer: 2500,
        },
      );
    } catch (err) {
      notifyAuthError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
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
          <Card.Body className="p-5 d-flex flex-column align-items-center">
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <PlaneTakeoff size={32} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark">Trip Planner</h3>
              <p className="text-muted small">당신의 여행을 계획해보세요</p>
            </div>

            {returnTo && (
              <BsAlert
                variant="info"
                className="py-2 small border-0 text-center w-100"
                style={{ maxWidth: '300px' }}
              >
                로그인 후 이전 페이지로 이동합니다.
              </BsAlert>
            )}

            <Form
              onSubmit={onEmailOtpLogin}
              className="w-100 d-flex flex-column align-items-center"
            >
              <Form.Group
                className="mb-3 position-relative w-100"
                style={{ maxWidth: '300px' }}
              >
                <Form.Label className="small fw-semibold text-muted">
                  이메일
                </Form.Label>
                <div className="position-relative">
                  <Mail
                    size={18}
                    className="position-absolute text-muted"
                    style={{ left: '12px', top: '13px' }}
                  />
                  <Form.Control
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    style={{
                      paddingLeft: '40px',
                      height: '48px',
                      borderRadius: '12px',
                    }}
                    className="border-light-subtle shadow-sm"
                  />
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="fw-bold shadow-sm"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: '48px',
                  borderRadius: '12px',
                }}
              >
                {loading ? '메일 발송 중...' : '로그인'}
              </Button>
            </Form>

            <div
              className="d-flex align-items-center gap-2 my-4 opacity-50 w-100"
              style={{ maxWidth: '300px' }}
            >
              <hr className="flex-grow-1" />
              <span className="small text-muted fw-bold">OR</span>
              <hr className="flex-grow-1" />
            </div>

            <div className="d-flex justify-content-center w-100">
              <KakaoLoginButton />
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;
