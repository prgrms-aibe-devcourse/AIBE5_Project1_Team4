import { supabase } from '@/lib/supabaseClient';
import { unwrap } from './errors';

/**
 * 공통 Edge Function 호출
 * - body는 object 또는 FormData 모두 가능
 * - unwrap으로 표준 에러 처리 적용
 */
export async function invokeFunction(name, { body, headers, signal } = {}) {
  const res = await supabase.functions.invoke(name, {
    body,
    headers,
    // supabase-js가 signal을 지원하는 버전이면 전달 가능(안 되면 무시해도 됨)
    signal,
  });

  return unwrap(res, `edge.${name}`);
}
