import { supabase } from '@/lib/supabaseClient';
import { unwrap } from './_core/errors';

const CONTEXT = 'authService';

// 회원가입 (data는 user_metadata로 들어감)
export async function signUp({ email, password, data }) {
  const result = await supabase.auth.signUp({
    email,
    password,
    options: data ? { data } : undefined,
  });
  return unwrap(result, `${CONTEXT}.signUp`);
}

// 이메일/패스워드 로그인
export async function signIn({ email, password }) {
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return unwrap(result, `${CONTEXT}.signIn`);
}

// OAuth 로그인 시작 (redirectTo 등은 feature에서 만들어서 options로 넘김)
export async function signInWithOAuth(provider, options = {}) {
  const result = await supabase.auth.signInWithOAuth({
    provider,
    options,
  });
  return unwrap(result, `${CONTEXT}.signInWithOAuth`);
}

// 로그아웃
export async function signOut() {
  const result = await supabase.auth.signOut();
  if (result.error) {
    unwrap(result, `${CONTEXT}.signOut`);
  }
}

// 세션 조회: session만 반환 (없으면 null)
export async function getSession() {
  const result = await supabase.auth.getSession();
  const data = unwrap(result, `${CONTEXT}.getSession`);
  return data.session;
}

// auth 상태 변경 구독
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// callback에서 code 교환
export async function exchangeCodeForSession(code) {
  const result = await supabase.auth.exchangeCodeForSession(code);
  if (result.error) {
    unwrap(result, `${CONTEXT}.exchangeCodeForSession`);
  }
}

// 이메일 OTP(매직링크) 로그인 요청
export async function signInWithEmailOtp(email, options = {}) {
  const redirectTo =
    options.emailRedirectTo ?? `${window.location.origin}/auth/callback`;

  const result = await supabase.auth.signInWithOtp({
    email,
    options: { ...options, emailRedirectTo: redirectTo },
  });

  return unwrap(result, `${CONTEXT}.signInWithEmailOtp`);
}
