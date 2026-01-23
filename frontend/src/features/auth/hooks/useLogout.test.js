import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ✅ hoist-safe mock handles
const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  clearReturnTo: vi.fn(),
  toastFire: vi.fn(),
}));

vi.mock('./useAuth', () => ({
  useAuth: () => ({ signOut: mocks.signOut }),
}));

vi.mock('@/features/auth/auth.feature', () => ({
  clearReturnTo: mocks.clearReturnTo,
}));

vi.mock('@/shared/ui/toast', () => ({
  Toast: { fire: mocks.toastFire },
}));

import { useLogout } from './useLogout';

describe('useLogout', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    // ✅ 에러 케이스 테스트에서 console.error가 stderr로 찍히는 걸 방지
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

    // ✅ 성공 토스트 (useLogout에 success toast가 실제로 있어야 함)
    expect(mocks.toastFire).toHaveBeenCalledWith({
      icon: 'success',
      title: '로그아웃되었습니다',
    });

    // (선택) clearReturnTo가 signOut보다 먼저 호출되는지
    expect(mocks.clearReturnTo.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.signOut.mock.invocationCallOrder[0],
    );

    // 성공 케이스에서는 로그가 찍히지 않는 게 자연스러움
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

    expect(mocks.toastFire).toHaveBeenCalledWith({
      icon: 'error',
      title: '로그아웃에 실패했습니다',
    });

    // ✅ 에러 로깅도 "의도된 동작"이라면 여기서 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[logout failed]',
      expect.any(Error),
    );
  });
});
