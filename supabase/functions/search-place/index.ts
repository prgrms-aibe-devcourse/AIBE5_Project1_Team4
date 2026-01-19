// search-place Edge Function
// Searches for places using Kakao Local API and caches results in database

import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse, KakaoPlace, Place } from '../_shared/types.ts'

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

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: SearchPlaceRequest = await req.json()

    if (!body.query || body.query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Kakao API key from environment
    const kakaoApiKey = Deno.env.get('KAKAO_REST_API_KEY')
    if (!kakaoApiKey) {
      console.error('KAKAO_REST_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Search service not configured' } as ApiResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build Kakao API URL
    const params = new URLSearchParams({
      query: body.query,
      page: (body.page || 1).toString(),
      size: Math.min(body.size || 15, 15).toString(), // Kakao max is 15
    })

    if (body.latitude && body.longitude) {
      params.append('x', body.longitude.toString())
      params.append('y', body.latitude.toString())
      if (body.radius) {
        params.append('radius', Math.min(body.radius, 20000).toString()) // Max 20km
      }
    }

    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`

    // Call Kakao API
    const kakaoResponse = await fetch(kakaoUrl, {
      headers: {
        'Authorization': `KakaoAK ${kakaoApiKey}`,
      },
    })

    if (!kakaoResponse.ok) {
      const errorText = await kakaoResponse.text()
      console.error('Kakao API error:', kakaoResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Search service error' } as ApiResponse),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const kakaoData: KakaoApiResponse = await kakaoResponse.json()

    // Transform and upsert places
    const supabase = createSupabaseClient(authHeader)
    const places: Place[] = []

    for (const doc of kakaoData.documents) {
      const place: Place = {
        provider: 'kakao',
        provider_place_id: doc.id,
        name: doc.place_name,
        category: doc.category_name,
        address: doc.address_name,
        road_address: doc.road_address_name,
        phone: doc.phone,
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
        raw_data: doc as Record<string, unknown>,
      }

      // Upsert into database (cache)
      const { data: upserted, error } = await supabase
        .from('places')
        .upsert(
          place,
          {
            onConflict: 'provider,provider_place_id',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Error upserting place:', error)
        // Continue with other places even if one fails
        places.push(place)
      } else {
        places.push(upserted)
      }
    }

    // Return response with places and pagination info
    return new Response(
      JSON.stringify({
        data: {
          places,
          meta: {
            total: kakaoData.meta.total_count,
            page: body.page || 1,
            size: places.length,
            is_end: kakaoData.meta.is_end,
          },
        },
      } as ApiResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('search-place error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
