// update-trip-member-role Edge Function
// Updates trip member role via RPC (owner/editor) with owner transfer support.

import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse } from '../_shared/types.ts'

interface UpdateTripMemberRoleRequest {
  tripId: string
  memberId: string
  role: 'owner' | 'editor'
}

const errorStatusMap: Record<string, number> = {
  unauthorized: 401,
  not_trip_owner: 403,
  member_not_found: 404,
  invalid_role: 400,
  cannot_demote_owner: 409,
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createSupabaseClient(authHeader)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' } as ApiResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: UpdateTripMemberRoleRequest = await req.json()
    const tripId = body?.tripId?.trim()
    const memberId = body?.memberId?.trim()
    const role = body?.role

    if (!tripId || !memberId || !role) {
      return new Response(
        JSON.stringify({ error: 'tripId, memberId, and role are required' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (role !== 'owner' && role !== 'editor') {
      return new Response(
        JSON.stringify({ error: 'role must be owner or editor' } as ApiResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase.rpc('rpc_update_trip_member_role', {
      p_trip_id: tripId,
      p_member_id: memberId,
      p_role: role,
    })

    if (error) {
      const status = errorStatusMap[error.message] ?? 400
      return new Response(
        JSON.stringify({ error: error.message, message: error.details } as ApiResponse),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data, message: 'Member role updated' } as ApiResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('update-trip-member-role error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
