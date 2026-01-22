import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/useAuth';

// 🔥 auth.service 전부 mock
vi.mock('@/services/auth.service', () => {
  return {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signOut: vi.fn(),
  };
});

import * as authService from '@/services/auth.service';

// 테스트용 상태를 보여주는 컴포넌트
function Probe() {
  const { loading, user, isAuthed } = useAuth();

  if (loading) return <div>loading</div>;
  if (!user) return <div>guest</div>;
  return <div>user:{user.id}</div>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows guest when there is no session', async () => {
    // getSession → null 세션
    authService.getSession.mockResolvedValue(null);

    // onAuthStateChange → 아무것도 안 하는 구독
    authService.onAuthStateChange.mockReturnValue({
      data: {
        subscription: { unsubscribe: vi.fn() },
      },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // 처음엔 loading
    expect(screen.getByText('loading')).toBeInTheDocument();

    // 비동기 init 끝나면 guest
    await screen.findByText('guest');
  });

  it('shows user when there is a session', async () => {
    const fakeSession = {
      user: { id: 'user-1' },
    };

    authService.getSession.mockResolvedValue(fakeSession);

    authService.onAuthStateChange.mockReturnValue({
      data: {
        subscription: { unsubscribe: vi.fn() },
      },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // loading → user:user-1
    await screen.findByText('user:user-1');
  });

  it('reacts to auth state change', async () => {
    let callback;

    authService.getSession.mockResolvedValue(null);

    authService.onAuthStateChange.mockImplementation((cb) => {
      callback = cb;
      return {
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      };
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // 초기: guest
    await screen.findByText('guest');

    // 로그인 이벤트 시뮬레이션
    const nextSession = { user: { id: 'user-2' } };

    await act(async () => {
      callback('SIGNED_IN', nextSession);
    });

    // 상태 업데이트 반영
    await screen.findByText('user:user-2');
  });
});
