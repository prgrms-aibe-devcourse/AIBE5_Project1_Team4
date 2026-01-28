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
 * 마이페이지 상단 퀵 통계용 리스트 조회 (최신 5개)
 * 기존 likes 로직을 유지하며 trips, bookmarks를 추가함
 */
export async function getQuickStatsList(userId, type) {
  const isDirectTrip = type === 'trips';
  const tableName = isDirectTrip ? 'trips' : (type === 'likes' ? 'trip_likes' : 'trip_bookmarks');
  const userColumn = isDirectTrip ? 'created_by' : 'user_id';

  // 1. 쿼리 구성: trips 테이블 직접 조회 또는 관계 조회
  const selectQuery = isDirectTrip 
    ? 'id, title, summary, start_date, end_date, created_at'
    : `created_at, trips (id, title, summary, start_date, end_date)`;

  const result = await supabase
    .from(tableName)
    .select(selectQuery)
    .eq(userColumn, userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // 2. 에러 발생 시 테스트 데이터 반환 (기존 스타일 유지)
  if (result.error) {
    console.warn(`${type} 조회 실패:`, result.error.message);
    return [
      { id: 'test1', title: `${type} 점검 중`, description: '데이터를 불러올 수 없습니다.', created_at: new Date() }
    ];
  }

  // 3. TripCard 및 모달 규격에 맞게 데이터 평탄화
  return (result.data || []).map(row => {
    const item = isDirectTrip ? row : row.trips;
    return {
      id: item?.id,
      title: item?.title || '제목 없음',
      // UI가 기대하는 description 필드에 summary 또는 날짜 매핑
      description: item?.summary || (item?.start_date ? `${item.start_date} ~ ${item.end_date}` : '상세 정보가 없습니다.'),
      created_at: row.created_at
    };
  });
}