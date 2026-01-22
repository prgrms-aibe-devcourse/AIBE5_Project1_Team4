import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from '@/features/auth/hooks/useAuth';

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
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>protected</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    expect(setReturnTo).not.toHaveBeenCalled(); // 로딩 중엔 저장/리다이렉트 금지 보장(선택이지만 좋음)
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

    expect(await screen.findByText('login page')).toBeTruthy();
    expect(setReturnTo).toHaveBeenCalledWith('/protected?a=1');
  });

  it('renders children when user exists', () => {
    useAuth.mockReturnValue({
      loading: false,
      user: { id: 'u1' },
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>protected</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('protected')).toBeTruthy();
    expect(setReturnTo).not.toHaveBeenCalled(); // 로그인 상태면 returnTo 저장할 이유 없음
  });
});
