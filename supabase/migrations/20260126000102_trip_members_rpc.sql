/*
  RPC: rpc_trip_members

  주 기능:
  - 특정 여행(trip)에 속한 모든 멤버를 조회한다.
  - 요청한 사용자 기준으로:
    - 각 멤버의 역할(role)
    - 본인 여부(isSelf)
    - 화면 표시용 이름(displayName)
  - OWNER를 우선 정렬하여 프론트에서 바로 사용 가능하게 반환한다.

  사용 목적:
  - 여행 상세 페이지의 "그룹원 보기"
  - 권한 기반 UI 제어(OWNER / EDITOR 판단)
*/

create or replace function public.rpc_trip_members(
  p_trip_id uuid
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  -- 인증되지 않은 사용자 차단
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  /*
    해당 trip에 속한 멤버 목록을 조회한다.
    - role: 멤버 역할(owner/editor)
    - isSelf: 요청한 사용자 본인 여부
    - displayName: 화면에 표시할 이름
  */
  return jsonb_build_object(
    'tripId', p_trip_id,
    'members', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'userId', tm.user_id,
            'role', lower(trim(tm.role)),
            'displayName', coalesce(p.full_name, p.username),
            'isSelf', tm.user_id = v_user_id
          )
          -- OWNER를 가장 위에 정렬
          order by
            case when lower(trim(tm.role)) = 'owner' then 0 else 1 end,
            coalesce(p.full_name, p.username)
        )
        from public.trip_members tm
        left join public.profiles p on p.id = tm.user_id
        where tm.trip_id = p_trip_id
      ),
      '[]'::jsonb
    )
  );
end;
$$;
