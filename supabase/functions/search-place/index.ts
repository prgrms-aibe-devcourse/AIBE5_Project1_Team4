// search-place Edge Function
// =====================================================
// 카카오 장소 검색 API 프록시 (DB 쓰기 없음)
//
// 역할:
//   - 프론트엔드에서 카카오 API 키를 노출하지 않기 위한 프록시
//   - 검색 결과를 Place DTO 형태로 변환하여 반환
//   - DB에는 일체 쓰지 않음 (DB 쓰기는 add-schedule-item에서 수행)
// =====================================================

import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse, KakaoPlace } from '../_shared/types.ts'

interface SearchPlaceRequest {
  query: string
  latitude?: number
  longitude?: number
  radius?: number
  page?: number
  size?: number
}

interface KakaoApiResponse {
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
  documents: KakaoPlace[]
}

interface SearchPlaceResult {
  provider: string
  provider_place_id: string
  name: string
  category?: string
  address?: string
  road_address?: string
  phone?: string
  latitude: number
  longitude: number
  raw_data?: Record<string, unknown>
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // =====================================================
    // STEP 1: 인증 확인
    // =====================================================
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401)
    }

    // 토큰 유효성만 확인 (DB 접근 안 하므로 user 정보는 불필요)
    const userClient = createSupabaseClient(authHeader)
    const { error: userError } = await userClient.auth.getUser()
    if (userError) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401)
    }

    // =====================================================
    // STEP 2: 요청 파싱 및 검증
    // =====================================================
    const body: SearchPlaceRequest = await req.json()

    if (!body.query || body.query.trim().length === 0) {
      return jsonResponse({ error: 'Query parameter is required' }, 400)
    }

    // =====================================================
    // STEP 3: 카카오 API 호출
    // =====================================================
    const kakaoApiKey = Deno.env.get('KAKAO_REST_API_KEY')
    if (!kakaoApiKey) {
      console.error('KAKAO_REST_API_KEY not configured')
      return jsonResponse({ error: 'Search service not configured' }, 500)
    }

    const params = new URLSearchParams({
      query: body.query,
      page: (body.page || 1).toString(),
      size: Math.min(body.size || 15, 15).toString(),
    })

    if (body.latitude && body.longitude) {
      params.append('x', body.longitude.toString())
      params.append('y', body.latitude.toString())
      if (body.radius) {
        params.append('radius', Math.min(body.radius, 20000).toString())
      }
    }

    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`

    const kakaoResponse = await fetch(kakaoUrl, {
      headers: { 'Authorization': `KakaoAK ${kakaoApiKey}` },
    })

    if (!kakaoResponse.ok) {
      const errorText = await kakaoResponse.text()
      console.error('Kakao API error:', kakaoResponse.status, errorText)
      return jsonResponse({ error: 'Search service error' }, 502)
    }

    const kakaoData: KakaoApiResponse = await kakaoResponse.json()

    // =====================================================
    // STEP 4: Place DTO로 변환 (DB 쓰기 없음)
    // =====================================================
    const places: SearchPlaceResult[] = kakaoData.documents.map((doc) => ({
      provider: 'kakao',
      provider_place_id: doc.id,
      name: doc.place_name,
      category: doc.category_name || undefined,
      address: doc.address_name || undefined,
      road_address: doc.road_address_name || undefined,
      phone: doc.phone || undefined,
      latitude: parseFloat(doc.y),
      longitude: parseFloat(doc.x),
      raw_data: doc as Record<string, unknown>,
    }))

    // =====================================================
    // STEP 5: 결과 반환
    // =====================================================
    return jsonResponse({
      data: {
        places,
        meta: {
          total: kakaoData.meta.total_count,
          page: body.page || 1,
          size: places.length,
          is_end: kakaoData.meta.is_end,
        },
      },
    }, 200)

  } catch (error) {
    console.error('search-place error:', error)

    if (error instanceof SyntaxError) {
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400)
    }

    return jsonResponse({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

// =====================================================
// Helper
// =====================================================
function jsonResponse(body: ApiResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
