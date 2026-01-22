import { signInWithOAuth } from '@/services/auth.service';

export function setReturnTo(pathnameWithSearch) {
  localStorage.setItem('auth:returnTo', pathnameWithSearch);
}

export function popReturnTo() {
  let returnTo = localStorage.getItem('auth:returnTo') || '/';
  localStorage.removeItem('auth:returnTo');

  if (!returnTo.startsWith('/')) returnTo = '/';
  if (returnTo.startsWith('/auth/callback')) returnTo = '/';

  return returnTo;
}

export async function signInWithKakao() {
  const ORIGIN = window.location?.origin || '';
  const redirectTo = `${ORIGIN}/auth/callback`;
  await signInWithOAuth('kakao', { redirectTo });
}
