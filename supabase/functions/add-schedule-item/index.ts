// add-schedule-item Edge Function
// =====================================================
// "장소 검색 결과 → 일정에 추가" 엔드포인트
//
// 플로우:
//   1. Authorization 헤더에서 유저 토큰 추출
//   2. 유저 토큰 클라이언트로 auth.getUser() → user_id 확보
//   3. service-role 클라이언트로 add_schedule_item_with_place RPC 호출
//      (RPC 내부에서 권한 체크 + places upsert + schedule_items insert)
//   4. 결과 반환
//
// 권한 체크 전략:
//   - Edge Function: 유저 인증 확인 (토큰 유효성)
//   - RPC 내부: 해당 trip_day의 trip에 대해 editor/owner인지 확인
//   → 이중 체크로 안전성 확보
// =====================================================

import { createSupabaseClient, createServiceRoleClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse, Place } from '../_shared/types.ts'

interface AddScheduleItemRequest {
  trip_day_id: string
  place: {
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
  time?: string | null
  duration_minutes?: number | null
  notes?: string | null
}

interface AddScheduleItemResponse {
  schedule_item_id: string
  place_id: string
  order_index: number
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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

    // 유저 토큰 클라이언트로 user_id 확보
    const userClient = createSupabaseClient(authHeader)
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401)
    }

    // =====================================================
    // STEP 2: 요청 파싱 및 검증
    // =====================================================
    const body: AddScheduleItemRequest = await req.json()

    if (!body.trip_day_id) {
      return jsonResponse({ error: 'trip_day_id is required' }, 400)
    }

    if (!body.place) {
      return jsonResponse({ error: 'place object is required' }, 400)
    }

    const { place } = body

    if (!place.provider || !place.provider_place_id || !place.name) {
      return jsonResponse({
        error: 'place.provider, place.provider_place_id, place.name are required',
      }, 400)
    }

    if (place.latitude == null || place.longitude == null) {
      return jsonResponse({
        error: 'place.latitude, place.longitude are required',
      }, 400)
    }

    // =====================================================
    // STEP 3: service-role로 RPC 호출
    // (RPC 내부에서 권한 체크 + places upsert + schedule_items insert)
    // =====================================================
    const serviceClient = createServiceRoleClient()

    const { data, error: rpcError } = await serviceClient.rpc(
      'add_schedule_item_with_place',
      {
        p_user_id: user.id,
        p_trip_day_id: body.trip_day_id,
        // place 정보
        p_provider: place.provider,
        p_provider_place_id: place.provider_place_id,
        p_place_name: place.name,
        p_place_category: place.category ?? null,
        p_place_address: place.address ?? null,
        p_place_road_address: place.road_address ?? null,
        p_place_phone: place.phone ?? null,
        p_place_latitude: place.latitude,
        p_place_longitude: place.longitude,
        p_place_raw_data: place.raw_data ?? null,
        // schedule_item 정보
        p_time: body.time ?? null,
        p_duration_minutes: body.duration_minutes ?? null,
        p_notes: body.notes ?? null,
      }
    )

    if (rpcError) {
      console.error('RPC error:', rpcError)

      // RPC 에러 메시지에서 에러 유형 판별
      const msg = rpcError.message ?? ''

      if (msg.includes('UNAUTHORIZED')) {
        return jsonResponse({ error: 'Authentication required' }, 401)
      }
      if (msg.includes('FORBIDDEN')) {
        return jsonResponse({ error: 'You do not have permission to edit this trip' }, 403)
      }
      if (msg.includes('NOT_FOUND')) {
        return jsonResponse({ error: 'Trip day not found' }, 404)
      }
      if (msg.includes('BAD_REQUEST')) {
        return jsonResponse({ error: 'Invalid request parameters' }, 400)
      }

      return jsonResponse({ error: 'Failed to add schedule item' }, 500)
    }

    // =====================================================
    // STEP 4: 결과 반환
    // =====================================================
    const row = Array.isArray(data) ? data[0] : data

    if (!row) {
      return jsonResponse({ error: 'No result returned from RPC' }, 500)
    }

    const result: AddScheduleItemResponse = {
      schedule_item_id: row.schedule_item_id,
      place_id: row.place_id,
      order_index: row.order_index,
    }

    return jsonResponse({ data: result }, 200)

  } catch (error) {
    console.error('add-schedule-item error:', error)

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
