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

vi.mock('@/services/profiles.service', () => ({
  upsertProfile: vi.fn(),
}));

vi.mock('@/features/auth/mappers/profile.mapper', () => ({
  toProfileUpsertPayload: vi.fn(),
}));

import * as authService from '@/services/auth.service';
import { upsertProfile } from '@/services/profiles.service';
import { toProfileUpsertPayload } from '@/features/auth/mappers/profile.mapper';

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

  // 초기 세션이 있을 때 upsert 호출
  it('upserts profile on init when session exists', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'a@a.com',
      user_metadata: { name: 'A' },
    };
    const fakeSession = { user: fakeUser };

    authService.getSession.mockResolvedValue(fakeSession);

    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    toProfileUpsertPayload.mockReturnValue({
      id: 'user-1',
      email: 'a@a.com',
      display_name: 'A',
      avatar_url: null,
    });

    upsertProfile.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // 유저 렌더가 됐다는 건 init이 끝났다는 뜻
    await screen.findByText('user:user-1');

    expect(toProfileUpsertPayload).toHaveBeenCalledWith(fakeUser);
    expect(upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1' }),
    );
  });

  // signed_in 이벤트에서 upsert호출
  it('upserts profile on SIGNED_IN event', async () => {
    let callback;

    authService.getSession.mockResolvedValue(null);

    authService.onAuthStateChange.mockImplementation((cb) => {
      callback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const user2 = {
      id: 'user-2',
      email: 'b@b.com',
      user_metadata: { name: 'B' },
    };
    const session2 = { user: user2 };

    toProfileUpsertPayload.mockReturnValue({
      id: 'user-2',
      email: 'b@b.com',
      display_name: 'B',
      avatar_url: null,
    });

    upsertProfile.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // 초기: guest
    await screen.findByText('guest');

    // 로그인 이벤트 시뮬레이션
    await act(async () => {
      await callback('SIGNED_IN', session2);
    });

    await screen.findByText('user:user-2');

    expect(toProfileUpsertPayload).toHaveBeenCalledWith(user2);
    expect(upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-2' }),
    );
  });

  // user 없을때 upsert 안함
  it('does not upsert profile when there is no user', async () => {
    authService.getSession.mockResolvedValue(null);

    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await screen.findByText('guest');

    expect(upsertProfile).not.toHaveBeenCalled();
    expect(toProfileUpsertPayload).not.toHaveBeenCalled();
  });
});
