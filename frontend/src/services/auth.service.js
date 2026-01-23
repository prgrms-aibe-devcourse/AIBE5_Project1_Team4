import { supabase } from '@/lib/supabaseClient';

function throwIfError(error) {
  if (error) throw error;
}

// 회원가입 (data는 user_metadata로 들어감)
export async function signUp({ email, password, data }) {
  const { data: result, error } = await supabase.auth.signUp({
    email,
    password,
    options: data ? { data } : undefined,
  });
  throwIfError(error);
  return result;
}

// 이메일/패스워드 로그인
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  throwIfError(error);
  return data;
}

// OAuth 로그인 시작 (redirectTo 등은 feature에서 만들어서 options로 넘김)
export async function signInWithOAuth(provider, options = {}) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  });
  throwIfError(error);
  return data;
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  throwIfError(error);
}

// 세션 조회: session만 반환 (없으면 null)
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  throwIfError(error);
  return data.session;
}

// auth 상태 변경 구독
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// (선택) callback에서 code 교환을 서비스로 뺄 때
export async function exchangeCodeForSession(code) {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  throwIfError(error);
}
