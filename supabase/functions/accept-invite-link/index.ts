import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import type { ApiResponse } from '../_shared/types.ts'

interface AcceptInviteRequest {
  token: string
}

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight(OPTIONS) 처리 - 이 부분이 명확해야 에러가 안 납니다.
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. 인증 헤더 확인
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 유저 정보 조회
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. 바디 파싱 및 토큰 검증
    const body: AcceptInviteRequest = await req.json()
    if (!body.token) {
      return new Response(
        JSON.stringify({ error: 'Invitation token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. 초대 링크 조회
    const { data: inviteLink, error: inviteError } = await supabase
      .from('trip_invite_links')
      .select('*, trip:trips(*)')
      .eq('token', body.token)
      .single()

    if (inviteError || !inviteLink) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 만료 여부 및 사용 횟수 체크 (마스터의 기존 로직 유지)
    if (inviteLink.expires_at && new Date(inviteLink.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Link expired' }), { status: 410, headers: corsHeaders })
    }

    // 5. 이미 멤버인지 확인
    const { data: existingMember } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', inviteLink.trip_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return new Response(
        JSON.stringify({ trip_id: inviteLink.trip_id, message: 'Already a member' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

// 6. 멤버 추가 (Editor 역할) - 직접 Insert 대신 관리자 권한 RPC 호출
const { error: rpcError } = await supabase.rpc('accept_trip_invitation', {
  p_trip_id: inviteLink.trip_id,
  p_user_id: user.id
})

if (rpcError) {
  console.error('RPC Error:', rpcError)
  throw rpcError
}

    // 7. 사용 횟수 증가
    await supabase
      .from('trip_invite_links')
      .update({ use_count: inviteLink.use_count + 1 })
      .eq('id', inviteLink.id)

    // 8. 최종 성공 응답 - trip_id를 꼭 넘겨줘야 리다이렉트가 가능합니다!
    return new Response(
      JSON.stringify({ trip_id: inviteLink.trip_id, message: 'Joined successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Accept invite error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})