import { supabase } from '@/lib/supabaseClient';
import { unwrap, toAppError, logError } from '@/services/_core/errors';

/**
 * 사용자가 북마크한 여행 목록을 필터링 및 정렬하여 가져옵니다.
 * @param {Object} params
 * @param {string} params.userId - 현재 로그인한 사용자의 UUID
 * @param {number} params.limit - 한 번에 가져올 데이터 개수
 * @param {Object} params.cursor - 무한 스크롤을 위한 커서 (createdAt, id)
 * @param {string} params.sort - 정렬 기준 ('latest' | 'popular')
 * @param {string} params.region - 지역 필터 ('전체' 또는 지역명)
 * @param {string} params.theme - 테마 필터 ('전체' 또는 테마명)
 * @param {number|null} params.days - 기간 필터 (최근 n일)
 */
export async function listBookmarkedTrips({ 
  userId, 
  limit = 12, 
  cursor, 
  sort = 'latest', 
  region = '전체', 
  theme = '전체', 
  days = null 
}) {
  const context = 'bookmarkService.listBookmarkedTrips';
  
  try {
    // 1. Supabase RPC 함수 호출 (파라미터명 p_로 시작하는 규격 준수)
    const result = await supabase.rpc('get_user_bookmarked_trips', {
      p_user_id: userId,
      p_limit: limit,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
      p_sort: sort,
      p_region: region,
      p_theme: theme,
      p_days: days
    });

    // 2. 결과 언래핑 및 에러 체크
    const rows = unwrap(result, context) || [];

    // 3. 데이터를 TripCard 컴포넌트 규격에 맞게 매핑
    const items = rows.map(row => ({
      ...row,
      // TripsPage와 동일하게 summary를 description으로 사용
      description: row.summary ?? null, 
      
      // ✅ 작성자 이름 문제 해결: SQL에서 JOIN으로 가져온 author_name을 매핑
      author: { 
        id: row.author_id, 
        name: row.author_name, // 'crm26' 또는 실명이 이곳에 할당됩니다.
        avatar_url: row.author_avatar_url 
      },
      
      // 북마크 페이지이므로 기본적으로 true 설정
      isBookmarked: true, 
    }));

    // 4. 무한 스크롤을 위한 다음 페이지 커서 계산
    const last = items[items.length - 1];
    const nextCursor = (sort === 'latest' && last && rows.length === limit)
      ? { createdAt: last.created_at, id: last.id } 
      : null;

    return { items, nextCursor };

  } catch (e) {
    // 5. 에러 처리 및 로깅 (콘솔 로그는 logError 내부에서 관리됨)
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}