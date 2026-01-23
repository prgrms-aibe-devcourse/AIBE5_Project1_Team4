import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import * as authService from '@/services/auth.service';

import { upsertProfile } from '@/services/profiles.service';
import { toProfileUpsertPayload } from '@/features/auth/mappers/profile.mapper';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ 추가

  const unsubRef = useRef(null);
  const mountedRef = useRef(false);

  const ensureProfile = useCallback(async (u) => {
    if (!u) return;
    try {
      await upsertProfile(toProfileUpsertPayload(u));
    } catch (e) {
      console.warn('profiles upsert failed:', e);
    }
  }, []);

  const cleanup = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    setError(null);
    cleanup();

    try {
      const s = await authService.getSession();
      if (!mountedRef.current) return;

      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) await ensureProfile(s.user);

      const { data } = authService.onAuthStateChange(
        async (event, nextSession) => {
          if (!mountedRef.current) return;

          setSession(nextSession);
          setUser(nextSession?.user ?? null);

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            await ensureProfile(nextSession?.user ?? null);
          }
        },
      );

      unsubRef.current = () => data?.subscription?.unsubscribe?.();
    } catch (e) {
      if (!mountedRef.current) return;
      console.error('Auth init failed:', e);
      setSession(null);
      setUser(null);
      setError(e); // ✅ 실패 상태 저장
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [cleanup, ensureProfile]);

  useEffect(() => {
    mountedRef.current = true;
    init();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [init, cleanup]);

  const value = useMemo(
    () => ({
      loading,
      error, // ✅ 노출
      session,
      user,
      isAuthed: !!user,

      async signOut() {
        await authService.signOut();
        setSession(null);
        setUser(null);
      },

      async retry() {
        await init(); // ✅ 재시도
      },
    }),
    [loading, error, session, user, init],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
