import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';

// useAuth를 원하는 상태로 mock
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/features/auth/hooks/useAuth';

// returnTo 저장 함수 mock
vi.mock('@/features/auth/auth.feature', () => ({
  setReturnTo: vi.fn(),
}));

import { setReturnTo } from '@/features/auth/auth.feature';

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loader when loading=true', () => {
    useAuth.mockReturnValue({ loading: true, user: null });

    render(
      <MemoryRouter initialEntries={['/protected?a=1']}>
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>
      </MemoryRouter>,
    );

    // 너희 로더 문구에 맞춰서 체크
    expect(screen.getByText(/세션 확인 중|loading/i)).toBeTruthy();
  });

  it('redirects to /login and sets returnTo when user is null', async () => {
    useAuth.mockReturnValue({ loading: false, user: null });

    render(
      <MemoryRouter initialEntries={['/protected?a=1']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>protected</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // /login으로 이동했는지
    expect(await screen.findByText('login page')).toBeTruthy();

    // returnTo가 저장됐는지
    expect(setReturnTo).toHaveBeenCalledWith('/protected?a=1');
  });

  it('renders children when user exists', () => {
    useAuth.mockReturnValue({
      loading: false,
      user: { id: 'u1' },
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>
      </MemoryRouter>,
    );

    expect(screen.getByText('protected')).toBeTruthy();
  });
});
