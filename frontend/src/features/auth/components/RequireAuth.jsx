// src/features/auth/components/RequireAuth.jsx

import FullScreenLoader from '@/components/FullScreenLoader'; // 있으면 사용, 없으면 아래 fallback 사용
import { setReturnTo } from '@/features/auth/auth.feature';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

const SHOULD_NOT_SAVE_PREFIXES = ['/login', '/auth/callback'];

function shouldSaveReturnTo(path) {
  return !SHOULD_NOT_SAVE_PREFIXES.some((p) => path.startsWith(p));
}

export default function RequireAuth({ children, redirectTo = '/login' }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  // ✅ 초기화 완료 전에는 판단 보류 (리다이렉트 금지)
  if (loading) {
    return <FullScreenLoader message="세션 확인 중..." />;
  }

  // ✅ 로그인 안 됨 → returnTo 저장 후 로그인 페이지로
  if (!user) {
    const current = location.pathname + location.search;

    if (shouldSaveReturnTo(location.pathname)) {
      setReturnTo(current);
    }

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
