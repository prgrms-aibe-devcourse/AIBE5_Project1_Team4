import { AuthContext } from '@/context/AuthContext';
import * as authService from '@/services/auth.service';
import { useEffect, useMemo, useState } from 'react';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    let mounted = true;

    async function init() {
      try {
        const s = await authService.getSession();
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);

        const { data } = authService.onAuthStateChange(
          (_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setLoading(false);
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
