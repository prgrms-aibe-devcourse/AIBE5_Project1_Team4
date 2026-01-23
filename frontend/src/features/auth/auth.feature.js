import { signInWithOAuth } from '@/services/auth.service';

const KEY = 'auth:returnTo';

export function setReturnTo(pathnameWithSearch) {
  localStorage.setItem(KEY, pathnameWithSearch);
}

export function popReturnTo() {
  let returnTo = localStorage.getItem(KEY) || '/';
  localStorage.removeItem(KEY);

  // open redirect 방지: 절대경로만 허용
  if (!returnTo.startsWith('/')) returnTo = '/';

  // callback으로 되돌아가는 루프 방지
  if (returnTo.startsWith('/auth/callback')) returnTo = '/';

  return returnTo;
}

export function clearReturnTo() {
  localStorage.removeItem(KEY);
}

export async function signInWithKakao() {
  const ORIGIN = window.location?.origin || '';
  const redirectTo = `${ORIGIN}/auth/callback`;
  await signInWithOAuth('kakao', { redirectTo });
}
