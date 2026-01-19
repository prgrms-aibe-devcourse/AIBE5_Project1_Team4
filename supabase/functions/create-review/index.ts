// create-review Edge Function
// Handles review creation with validation and permission checks

import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse, Review } from '../_shared/types.ts'

interface CreateReviewRequest {
  target_type: 'trip' | 'place'
  trip_id?: string
  place_id?: string
  rating: number
  content?: string
  visited_on?: string // ISO date string
  photo_urls?: string[]
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

    const supabase = createSupabaseClient(authHeader)

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CreateReviewRequest = await req.json()

    // Validate target_type
    if (!body.target_type || !['trip', 'place'].includes(body.target_type)) {
      return new Response(
        JSON.stringify({ error: 'target_type must be "trip" or "place"' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate target ID
    if (body.target_type === 'trip' && !body.trip_id) {
      return new Response(
        JSON.stringify({ error: 'trip_id is required for trip reviews' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.target_type === 'place' && !body.place_id) {
      return new Response(
        JSON.stringify({ error: 'place_id is required for place reviews' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating)) {
      return new Response(
        JSON.stringify({ error: 'rating must be an integer between 1 and 5' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate visited_on date format if provided
    if (body.visited_on) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(body.visited_on)) {
        return new Response(
          JSON.stringify({ error: 'visited_on must be in YYYY-MM-DD format' } as ApiResponse),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Permission check for trip reviews
    if (body.target_type === 'trip' && body.trip_id) {
      const { data: canView } = await supabase
        .rpc('can_view_trip', { p_trip_id: body.trip_id })

      if (!canView) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to review this trip' } as ApiResponse),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check for existing review (one review per user per target)
    const existingReviewQuery = supabase
      .from('reviews')
      .select('id')
      .eq('author_id', user.id)
      .eq('target_type', body.target_type)

    if (body.target_type === 'trip') {
      existingReviewQuery.eq('trip_id', body.trip_id!)
    } else {
      existingReviewQuery.eq('place_id', body.place_id!)
    }

    const { data: existingReview } = await existingReviewQuery.single()

    if (existingReview) {
      return new Response(
        JSON.stringify({
          error: 'You have already reviewed this ' + body.target_type,
          message: 'Please update your existing review instead'
        } as ApiResponse),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create review object
    const review: Review = {
      author_id: user.id,
      target_type: body.target_type,
      rating: body.rating,
      content: body.content || null,
      visited_on: body.visited_on || null,
      photo_urls: body.photo_urls || null,
    }

    if (body.target_type === 'trip') {
      review.trip_id = body.trip_id
      review.place_id = null
    } else {
      review.place_id = body.place_id
      review.trip_id = null
    }

    // Insert review
    const { data: createdReview, error: insertError } = await supabase
      .from('reviews')
      .insert(review)
      .select(`
        *,
        author:profiles!reviews_author_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating review:', insertError)
      return new Response(
        JSON.stringify({
          error: 'Failed to create review',
          message: insertError.message
        } as ApiResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return created review
    return new Response(
      JSON.stringify({
        data: createdReview,
        message: 'Review created successfully'
      } as ApiResponse),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('create-review error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
