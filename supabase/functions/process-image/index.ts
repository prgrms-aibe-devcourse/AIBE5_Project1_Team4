// process-image Edge Function
// Handles image uploads to Supabase Storage with validation and permission checks

import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse } from '../_shared/types.ts'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface ProcessImageRequest {
  kind: 'cover' | 'review' // Type of image
  trip_id?: string // Required for kind=cover
  review_id?: string // Required for kind=review
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

    // Parse multipart form data
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be multipart/form-data' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const kind = formData.get('kind') as string
    const trip_id = formData.get('trip_id') as string | null
    const review_id = formData.get('review_id') as string | null

    // Validate file
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File is required' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
        } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate kind
    if (!kind || !['cover', 'review'].includes(kind)) {
      return new Response(
        JSON.stringify({ error: 'Invalid kind. Must be "cover" or "review"' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate permission based on kind
    if (kind === 'cover') {
      if (!trip_id) {
        return new Response(
          JSON.stringify({ error: 'trip_id is required for cover images' } as ApiResponse),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user can edit this trip
      const { data: canEdit } = await supabase
        .rpc('can_edit_trip', { p_trip_id: trip_id })

      if (!canEdit) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to edit this trip' } as ApiResponse),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (kind === 'review') {
      if (!review_id) {
        return new Response(
          JSON.stringify({ error: 'review_id is required for review images' } as ApiResponse),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user owns this review
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .select('author_id')
        .eq('id', review_id)
        .single()

      if (reviewError || review?.author_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to upload images for this review' } as ApiResponse),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomString = crypto.randomUUID().split('-')[0]
    const fileName = `${user.id}_${timestamp}_${randomString}.${fileExt}`

    let storagePath: string
    if (kind === 'cover') {
      storagePath = `trips/${trip_id}/${fileName}`
    } else {
      storagePath = `reviews/${review_id}/${fileName}`
    }

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images') // bucket name
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({
          error: 'Failed to upload image',
          message: uploadError.message
        } as ApiResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // Update database if kind=cover
    if (kind === 'cover' && trip_id) {
      const { error: updateError } = await supabase
        .from('trips')
        .update({ cover_image_url: publicUrl })
        .eq('id', trip_id)

      if (updateError) {
        console.error('Failed to update trip cover_image_url:', updateError)
        // Image is uploaded but DB update failed - still return success with URL
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        data: {
          url: publicUrl,
          path: storagePath,
          kind,
          trip_id,
          review_id,
        }
      } as ApiResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('process-image error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
