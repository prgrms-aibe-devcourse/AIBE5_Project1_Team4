import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ✅ hoist-safe mock handles
const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  clearReturnTo: vi.fn(),
}));

// ✅ A안 핵심: overlay.toast만 mock
vi.mock('@/shared/ui/overlay', () => ({
  toast: vi.fn(),
}));

// overlay.toast를 테스트에서 검증하려면 import 해와야 함 (mocked 버전으로 들어옴)
import { toast } from '@/shared/ui/overlay';

vi.mock('./useAuth', () => ({
  useAuth: () => ({ signOut: mocks.signOut }),
}));

vi.mock('@/features/auth/auth.feature', () => ({
  clearReturnTo: mocks.clearReturnTo,
}));

import { useLogout } from './useLogout';

describe('useLogout (A: mock overlay.toast)', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it('clears returnTo then signs out and shows success toast', async () => {
    mocks.signOut.mockResolvedValueOnce();

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mocks.clearReturnTo).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);

    // ✅ 성공 토스트
    expect(toast).toHaveBeenCalledWith('로그아웃되었습니다', {
      icon: 'success',
    });

    // (선택) 호출 순서
    expect(mocks.clearReturnTo.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.signOut.mock.invocationCallOrder[0],
    );

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('shows error toast when signOut fails', async () => {
    mocks.signOut.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mocks.clearReturnTo).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);

    // ✅ 실패 토스트
    expect(toast).toHaveBeenCalledWith('로그아웃에 실패했습니다', {
      icon: 'error',
    });

    // ✅ useLogout가 에러 로깅을 하는게 의도라면 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[logout failed]',
      expect.any(Error),
    );
  });
});
