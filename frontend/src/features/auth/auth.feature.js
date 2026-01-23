import { signInWithOAuth } from '@/services/auth.service';

const KEY = 'auth:returnTo';
const DEFAULT_RETURN_TO = '/';

// 여기 포함된 경로로는 returnTo를 절대 저장/복원하지 않음(루프 방지)
const BLOCKLIST_PREFIXES = ['/auth/callback', '/login'];

// 외부 이동/스킴/프로토콜 상대(//) 차단
const DISALLOWED = /^(?:https?:|javascript:|data:|vbscript:|file:|\/\/)/i;

// 절대 허용하지 않을 “스킴/프로토콜” 패턴(외부 이동 차단)
const DISALLOWED_SCHEMES =
  /^(?:https?:|javascript:|data:|vbscript:|file:|\/\/)/i;

export function setReturnTo(pathnameWithSearch) {
  localStorage.setItem(KEY, sanitizeReturnTo(pathnameWithSearch));
}

export function popReturnTo() {
  const raw = localStorage.getItem(KEY);
  localStorage.removeItem(KEY);
  return sanitizeReturnTo(raw);
}

export function clearReturnTo() {
  localStorage.removeItem(KEY);
}

export function sanitizeReturnTo(input) {
  if (!input || typeof input !== 'string') return DEFAULT_RETURN_TO;

  const v = input.trim();
  if (!v) return DEFAULT_RETURN_TO;

  // 1) 스킴/외부/프로토콜 상대 차단
  if (DISALLOWED.test(v)) return DEFAULT_RETURN_TO;

  // 2) 절대경로만 허용
  if (!v.startsWith('/')) return DEFAULT_RETURN_TO;

  // 3) 제어문자(개행 등) 차단
  if (/[\u0000-\u001F\u007F]/.test(v)) return DEFAULT_RETURN_TO;

  // 4) 루프 방지
  for (const p of BLOCKLIST_PREFIXES) {
    if (v.startsWith(p)) return DEFAULT_RETURN_TO;
  }

  return v;
}

export function setReturnToIfEmpty(pathnameWithSearch) {
  const existing = localStorage.getItem(KEY);
  if (existing) return;
  setReturnTo(pathnameWithSearch);
}

export async function signInWithKakao() {
  const ORIGIN = window.location?.origin || '';
  const redirectTo = `${ORIGIN}/auth/callback`;
  await signInWithOAuth('kakao', { redirectTo });
}
