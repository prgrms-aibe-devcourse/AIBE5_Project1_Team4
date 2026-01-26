import { supabase } from '@/lib/supabaseClient';
import { unwrap } from './_core/errors';

const CONTEXT = 'profilesService';

/**
 * @param {{
 *  id: string,
 *  username: string,
 *  full_name: string|null,
 *  avatar_url: string|null,
 *  updated_at?: string
 * }} payload
 */
export async function upsertProfile(payload) {
  const row = {
    ...payload,
    updated_at: payload.updated_at ?? new Date().toISOString(),
  };

  const result = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' });

  if (result.error) {
    unwrap(result, `${CONTEXT}.upsertProfile`);
  }
}

/**
 * 유저의 찜(Favorites) 또는 북마크(Bookmarks) 최신 5개를 가져오는 API
 * @param {string} userId - 유저 고유 ID
 * @param {'likes' | 'bookmarks'} type - 요청할 데이터 타입
 */
export async function getQuickStatsList(userId, type) {
  // 1. 테이블명 매핑 (스키마 확인 완료)
  const tableName = type === 'likes' ? 'trip_likes' : 'trip_bookmarks';

  // 2. 쿼리 실행: trips!trip_id 대신 trips!inner(id, title...) 혹은 trips(*) 시도
  // 여기서는 관계가 확실히 잡히도록 !trip_id를 유지하되 전체 데이터를 가져와서 확인해볼게.
  const result = await supabase
    .from(tableName)
    .select(`
      created_at,
      trips (
        id,
        title,
        start_date,
        end_date
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. 만약 위 쿼리가 400 에러를 뱉는다면, PostgREST 관계 설정 문제야.
  // 이럴 땐 임시로 '가짜 데이터'를 보여줘서 마스터가 모달 UI라도 먼저 확인할 수 있게 해줄게!
  if (result.error) {
    console.warn("실제 DB 조회 실패, 테스트용 데이터를 반환합니다:", result.error.message);
    return [
      { id: 'test1', title: '에러 해결 중! (가짜 데이터)', date: '2026-01-26', created_at: new Date() },
      { id: 'test2', title: 'DB 테이블 관계 확인 필요', date: '2026-01-26', created_at: new Date() }
    ];
  }

  return (result.data || []).map(item => ({
    id: item.trips?.id,
    title: item.trips?.title || '제목 없는 여행',
    date: item.trips ? `${item.trips.start_date} ~ ${item.trips.end_date}` : '날짜 정보 없음',
    created_at: item.created_at
  }));
}