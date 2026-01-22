import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthContext } from '../../../context/AuthContext';

describe('useAuth', () => {
  // 1) Provider 없이 쓰면 에러 나는지
  it('throws error when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within <AuthProvider />',
    );
  });

  // 2) Provider 안에서 정상 동작하는지
  it('returns context value when used inside AuthProvider', () => {
    const mockValue = {
      loading: false,
      user: { id: 'user-1' },
      session: { access_token: 'token' },
      isAuthed: true,
      signOut: async () => {},
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockValue);
    expect(result.current.user).toEqual({ id: 'user-1' });
    expect(result.current.isAuthed).toBe(true);
  });
});
