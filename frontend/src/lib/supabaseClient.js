import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY',
  );
}

// 탭 이동/백그라운드 이후 fetch가 영원히 pending 되는 현상 방지
function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초

  return fetch(input, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
  auth: {
    // OAuth callback에서 세션 저장/복원에 도움
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
