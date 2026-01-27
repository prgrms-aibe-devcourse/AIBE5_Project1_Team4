// create-invite-link/index.ts
import { createSupabaseClient } from '../_shared/supabase.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createSupabaseClient(authHeader ?? undefined)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: '로그인이 필요한 서비스입니다.' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { trip_id } = await req.json()
    if (!trip_id) throw new Error('trip_id is required')

    // ✅ [추가] 방장(Owner) 권한 체크 로직
    // trip_members 테이블에서 현재 유저가 이 여행의 'owner'인지 확인합니다.
    const { data: memberData, error: memberError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', trip_id)
      .eq('user_id', user.id)
      .single()

    // 멤버 데이터가 없거나, 역할이 owner가 아니면 차단
    if (memberError || !memberData || memberData.role !== 'owner') {
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: '초대 링크 생성 권한이 없습니다. 그룹장만 가능합니다.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 권한 통과 후 초대 링크 생성
    const { data, error } = await supabase
      .from('trip_invite_links')
      .insert({
        trip_id: trip_id,
        created_by: user.id,
        token: crypto.randomUUID(),
        use_count: 0
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        data, 
        message: '초대 링크 생성 성공!' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('create-invite-link error:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        error: 'Bad Request', 
        message: errorMessage 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})