// src/services/_core/errors.js

/**
 * AppError: 서비스 레이어에서 UI로 던지는 표준 에러
 * - name: 'AppError'
 * - kind: UI 분기용 (auth / forbidden / not_found / conflict / validation / network / unknown)
 * - message: 사용자에게 보여줄 수 있는 기본 메시지(너무 자세히 X)
 * - detail: 원본 에러/추가 정보(디버그용)
 * - context: 어떤 작업 중 터졌는지 (예: 'tripService.getTrip')
 */
export class AppError extends Error {
  constructor({ kind, message, detail, context, status }) {
    super(message);
    this.name = 'AppError';
    this.kind = kind || 'unknown';
    this.detail = detail;
    this.context = context;
    this.status = status;
  }
}

// Supabase(PostgREST)에서 자주 보는 케이스들 매핑
export function classifySupabaseError(err) {
  // supabase-js error는 상황에 따라 구조가 다를 수 있어 방어적으로
  const status = err?.status ?? err?.code ?? null;
  const message = err?.message ?? 'Unknown error';

  // PostgREST는 HTTP status를 주는 경우가 많음
  if (err?.status === 401) return { kind: 'auth', status: 401 };
  if (err?.status === 403) return { kind: 'forbidden', status: 403 };
  if (err?.status === 404) return { kind: 'not_found', status: 404 };
  if (err?.status === 409) return { kind: 'conflict', status: 409 };
  if (err?.status >= 500) return { kind: 'server', status: err.status };

  // Postgres error code (예: unique violation 23505)
  // supabase 에러에 code가 들어오는 경우가 있어 대비
  if (err?.code === '23505') return { kind: 'conflict', status: 409 }; // unique_violation
  if (err?.code === '22P02') return { kind: 'validation', status: 400 }; // invalid_text_representation (uuid 파싱 등)

  // 네트워크/연결류(브라우저 fetch 에러)
  if (message.toLowerCase().includes('failed to fetch'))
    return { kind: 'network', status: 0 };

  return { kind: 'unknown', status: status ?? null };
}

export function toAppError(error, context) {
  if (!error) return null;
  if (error instanceof AppError) return error;

  const { kind, status } = classifySupabaseError(error);

  // 사용자 메시지는 너무 내부정보를 노출하지 않는 선에서 기본값 제공
  const messageByKind = {
    auth: '로그인이 필요합니다.',
    forbidden: '권한이 없습니다.',
    not_found: '대상을 찾을 수 없습니다.',
    conflict: '이미 존재하거나 중복된 요청입니다.',
    validation: '요청 값이 올바르지 않습니다.',
    network: '네트워크 연결을 확인해주세요.',
    server: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    unknown: '알 수 없는 오류가 발생했습니다.',
  };

  const appError = new AppError({
    kind,
    status,
    message: messageByKind[kind] || messageByKind.unknown,
    detail: error,
    context,
  });

  return appError;
}

export function logError(err) {
  // prod에서 콘솔이 지저분해지는 걸 막고 싶으면 DEV만
  if (import.meta.env.DEV) {
    // detail 포함해서 디버깅 가능하게
    console.error(`[${err?.name || 'Error'}] ${err?.context || ''}`, err);
  }
}

/**
 * supabase result에서 error 있으면 AppError로 던지고,
 * 없으면 data를 반환한다.
 */
export function unwrap(result, context) {
  if (!result)
    throw new AppError({ kind: 'unknown', message: 'Empty result', context });

  if (result.error) {
    const appErr = toAppError(result.error, context);
    logError(appErr);
    throw appErr;
  }

  return result.data;
}

// UI에서 분기 처리용 가드
export function isAuthError(e) {
  return e?.name === 'AppError' && e?.kind === 'auth';
}
export function isForbiddenError(e) {
  return e?.name === 'AppError' && e?.kind === 'forbidden';
}
export function isConflictError(e) {
  return e?.name === 'AppError' && e?.kind === 'conflict';
}
