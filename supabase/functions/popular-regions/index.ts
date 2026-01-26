// popular-regions Edge Function
// GET /popular-regions?days=30&page_size=20&cursor_score=...&cursor_region_id=...
// 인기 여행지(지역) 리스트를 최근 좋아요 기준으로 조회하는 엔드포인트

// Supabase 클라이언트 / CORS 공통 유틸
import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse } from '../_shared/types.ts'

// RPC 결과 타입 정의
type PopularRegionRow = {
  region_id: string
  region_name: string
  score: number
  trip_count: number
}

// 정수형 쿼리 파라미터 파싱 유틸
function parseIntParam(value: string | null, fallback: number) {
  if (!value) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

// bigint 커서(score) 파싱 유틸
function parseBigIntParam(value: string | null) {
  if (!value) return null
  // supabase-js에서 bigint가 number로 내려오는 경우를 고려
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

// Edge Function 엔트리 포인트
Deno.serve(async (req: Request) => {
  // CORS preflight 및 공통 처리
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // GET 메서드만 허용
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' } satisfies ApiResponse),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // URL 및 쿼리 파라미터 파싱
    const url = new URL(req.url)
    const days = parseIntParam(url.searchParams.get('days'), 30)
    const page_size = parseIntParam(url.searchParams.get('page_size'), 20)
    const cursor_score = parseBigIntParam(url.searchParams.get('cursor_score'))
    const cursor_region_id = url.searchParams.get('cursor_region_id')

    // MVP 기준 입력값 범위 제한
    const safeDays = Math.min(Math.max(days, 1), 365)
    const safePageSize = Math.min(Math.max(page_size, 1), 50)

    // Authorization 헤더가 있으면 그대로 Supabase 클라이언트에 전달
    const authHeader = req.headers.get('Authorization') ?? undefined
    const supabase = createSupabaseClient(authHeader)

    // 인기 여행지 리스트 RPC 호출
    const { data, error } = await supabase.rpc('get_popular_regions', {
      days: safeDays,
      page_size: safePageSize,
      cursor_score: cursor_score ?? null,
      cursor_region_id: cursor_region_id ?? null,
    })

    // RPC 에러 처리
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message } satisfies ApiResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 결과 목록 및 다음 페이지 커서 계산
    const rows = (data ?? []) as PopularRegionRow[]
    const last = rows.at(-1)
    const nextCursor = last
      ? { score: last.score, region_id: last.region_id }
      : null

    // 성공 응답 반환
    return new Response(
      JSON.stringify({ data: { items: rows, nextCursor } } satisfies ApiResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    // 예외 발생 시 공통 에러 응답
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' } satisfies ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})