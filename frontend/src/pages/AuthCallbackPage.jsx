import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import FullScreenLoader from '../components/FullScreenLoader';
import { popReturnTo } from '../features/auth/auth.feature';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('loading'); // "loading" | "success" | "error"
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // PKCE code 교환
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // 세션 확인
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data.session;
        if (!session) {
          throw new Error('세션이 생성되지 않았어요. 다시 로그인해 주세요.');
        }

        if (cancelled) return;

        setStatus('success');
        setMessage('로그인 완료!');

        // returnTo 처리
        let returnTo = popReturnTo();
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

  if (status === 'loading')
    return <FullScreenLoader message="로그인 처리중..." />;

  if (status === 'error') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div
          className="card shadow-sm border-0"
          style={{ maxWidth: 520, width: '100%' }}
        >
          <div className="card-body p-4">
            {/* 헤더 */}
            <div className="d-flex align-items-start gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(220,53,69,0.12)', // bootstrap danger 느낌
                  flex: '0 0 auto',
                }}
                aria-hidden="true"
              >
                <span style={{ fontSize: 22 }}>⚠️</span>
              </div>

              <div className="flex-grow-1">
                <h4 className="mb-1">로그인 처리에 실패했어요</h4>
                <p className="text-muted mb-0">
                  일시적인 문제일 수 있어요. 아래 버튼으로 다시 시도해 주세요.
                </p>
              </div>
            </div>

            {/* 메시지 */}
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              <div className="fw-semibold mb-1">에러 메시지</div>
              <div style={{ wordBreak: 'break-word' }}>{message}</div>
            </div>

            {/* 액션 */}
            <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => window.location.replace('/')}
              >
                홈으로
              </button>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.location.replace('/login')}
              >
                로그인으로 이동
              </button>
            </div>

            {/* 보조 안내 */}
            <div className="text-muted small mt-3">
              계속 문제가 발생하면 잠시 후 다시 시도하거나, 브라우저를
              새로고침해 보세요.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center text-center">
      <div>
        <div className="spinner-border" role="status" />
        <p className="mt-3 mb-0">{message}</p>
      </div>
    </div>
  );
}
