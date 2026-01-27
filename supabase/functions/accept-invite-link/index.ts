// accept-invite-link/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2' // 클라이언트 직접 생성을 위해 임포트
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse } from '../_shared/types.ts'

interface AcceptInviteRequest {
  token: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // ✅ [수정] JWT 인증 에러 우회를 위해 SERVICE_ROLE_KEY(마스터키) 사용 클라이언트 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ✅ [수정] 마스터키로 유저 정보를 조회하여 신분증 검사를 유연하게 통과
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const body: AcceptInviteRequest = await req.json()

    if (!body.token || body.token.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Token is required' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Look up invite link
    const { data: inviteLink, error: inviteError } = await supabase
      .from('trip_invite_links')
      .select('*, trip:trips(*)')
      .eq('token', body.token)
      .single()

    if (inviteError || !inviteLink) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired invitation link',
          message: 'This invitation link does not exist or has been deleted'
        } as ApiResponse),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if link is expired
    if (inviteLink.expires_at) {
      const expiresAt = new Date(inviteLink.expires_at)
      if (expiresAt < new Date()) {
        return new Response(
          JSON.stringify({
            error: 'Invitation link expired',
            message: 'This invitation link has expired'
          } as ApiResponse),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check if max uses reached
    if (inviteLink.max_uses && inviteLink.use_count >= inviteLink.max_uses) {
      return new Response(
        JSON.stringify({
          error: 'Invitation link exhausted',
          message: 'This invitation link has reached its maximum number of uses'
        } as ApiResponse),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('trip_members')
      .select('id, role')
      .eq('trip_id', inviteLink.trip_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      // User is already a member - return success anyway with trip info
      return new Response(
        JSON.stringify({
          data: {
            trip: inviteLink.trip,
            role: existingMember.role,
            already_member: true,
          },
          message: 'You are already a member of this trip'
        } as ApiResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add user to trip_members as editor
    const { data: newMember, error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: inviteLink.trip_id,
        user_id: user.id,
        role: 'editor',
      })
      .select()
      .single()

    if (memberError) {
      console.error('Error adding member:', memberError)
      return new Response(
        JSON.stringify({
          error: 'Failed to join trip',
          message: memberError.message
        } as ApiResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Increment use_count
    const { error: updateError } = await supabase
      .from('trip_invite_links')
      .update({
        use_count: inviteLink.use_count + 1
      })
      .eq('id', inviteLink.id)

    if (updateError) {
      console.error('Error updating use_count:', updateError)
      // Don't fail the request - member was added successfully
    }

    // Return success with trip info
    return new Response(
      JSON.stringify({
        data: {
          trip: inviteLink.trip,
          membership: newMember,
          role: 'editor',
        },
        message: 'Successfully joined the trip'
      } as ApiResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('accept-invite-link error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})