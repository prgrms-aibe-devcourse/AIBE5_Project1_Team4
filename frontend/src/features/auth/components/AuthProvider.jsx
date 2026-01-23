import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import * as authService from '@/services/auth.service';

import { upsertProfile } from '@/services/profiles.service';
import { toProfileUpsertPayload } from '@/features/auth/mappers/profile.mapper';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    let mounted = true;

    async function ensureProfile(u) {
      if (!u) return;
      try {
        await upsertProfile(toProfileUpsertPayload(u));
      } catch (e) {
        // 로그인 흐름을 막진 말고(UX), 기록만
        console.warn('profiles upsert failed:', e);
      }
    }

    async function init() {
      try {
        const s = await authService.getSession();
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);

        // ✅ 앱 시작 시 이미 세션이 있으면 profile 보장
        if (s?.user) await ensureProfile(s.user);

        const { data } = authService.onAuthStateChange(
          async (event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setLoading(false);

            // ✅ 로그인 완료 / 유저 업데이트 때 profile 보장
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
              await ensureProfile(nextSession?.user ?? null);
            }

            // (선택) SIGNED_OUT이면 별도 처리할 거 없으면 패스
          },
        );

        unsub = () => data?.subscription?.unsubscribe?.();
      } catch (e) {
        console.error('Auth init failed:', e);
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      isAuthed: !!user,
      async signOut() {
        await authService.signOut();
        setSession(null);
        setUser(null);
      },
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
