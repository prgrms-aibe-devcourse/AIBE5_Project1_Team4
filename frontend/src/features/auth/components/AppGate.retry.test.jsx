import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AuthProvider } from '@/features/auth/components/AuthProvider';
import AppGate from '@/features/auth/components/AppGate';

vi.mock('@/services/auth.service', () => {
  return {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signOut: vi.fn(),
  };
});

vi.mock('@/services/profiles.service', () => ({ upsertProfile: vi.fn() }));
vi.mock('@/features/auth/mappers/profile.mapper', () => ({
  toProfileUpsertPayload: vi.fn(() => ({})),
}));

import * as authService from '@/services/auth.service';

function renderWithAuth(ui) {
  return render(
    <AuthProvider>
      <AppGate>{ui}</AppGate>
    </AuthProvider>,
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

describe('AppGate retry (real FullScreenLoader)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('세션 부트 실패 후 재시도하면 getSession()이 재호출되고 정상 진입한다', async () => {
    // ✅ 1회차: 로딩이 잡히도록 "지연 후 실패"
    authService.getSession.mockImplementationOnce(async () => {
      await delay(20);
      throw new Error('boot failed');
    });

    // ✅ 2회차: 성공
    authService.getSession.mockResolvedValueOnce(null);

    renderWithAuth(<div>APP_OK</div>);

    // 1) 최초 로딩 화면 (지연 덕분에 반드시 존재)
    expect(await screen.findByTestId('auth-loading')).toBeInTheDocument();

    // 2) 실패 화면으로 전환
    expect(await screen.findByText('세션 확인 실패')).toBeInTheDocument();
    expect(authService.getSession).toHaveBeenCalledTimes(1);

    // 3) 재시도 클릭
    fireEvent.click(screen.getByRole('button', { name: '재시도' }));

    // 4) retry로 다시 로딩 (이건 환경 따라 순간이라 findBy보다 query + waitFor가 안정적)
    await waitFor(() => {
      expect(screen.queryByTestId('auth-loading')).toBeInTheDocument();
    });

    // 5) getSession 재호출 확인
    await waitFor(() => {
      expect(authService.getSession).toHaveBeenCalledTimes(2);
    });

    // 6) 성공 후 children 렌더링
    expect(await screen.findByText('APP_OK')).toBeInTheDocument();
  });
});
