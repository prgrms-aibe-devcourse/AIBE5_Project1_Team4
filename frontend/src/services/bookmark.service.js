import { supabase } from '@/lib/supabaseClient';
import { unwrap, toAppError, logError } from '@/services/_core/errors';

/**
 * DB 행 데이터를 프론트엔드 카드 컴포넌트용 객체로 변환합니다.
 */
function mapRowToCard(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.summary ?? null,
    cover_image_url: row.cover_image_url ?? null,
    start_date: row.start_date,
    end_date: row.end_date,
    created_at: row.created_at,
    author: {
      id: row.author_id,
      name: row.author_name,
      avatar_url: row.author_avatar_url,
    },
    like_count: Number(row.like_count) || 0,
    bookmark_count: Number(row.bookmark_count) || 0,
    member_count: Number(row.member_count) || 1,
    regions: row.regions ?? [],
    themes: row.themes ?? [],
    isBookmarked: true, // 북마크 리스트이므로 기본값은 true입니다.
  };
}

/**
 * 사용자가 북마크한 여행 리스트를 RPC를 통해 조회합니다.
 */
export async function listBookmarkedTrips({ userId, limit = 12, cursor }) {
  const context = 'bookmarkService.listBookmarkedTrips';

  try {
    const realLimit = Math.max(1, Math.min(50, limit));

    //RPC 함수를 호출합니다.
    const result = await supabase.rpc('get_user_bookmarked_trips', {
      p_user_id: userId,
      p_limit: realLimit,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
    });

    const rows = unwrap(result, context) || [];
    const items = rows.map(mapRowToCard);

    // 다음 페이지 조회를 위한 커서 계산 로직
    const last = items[items.length - 1];
    const nextCursor =
      last && rows.length === realLimit
        ? { createdAt: last.created_at, id: last.id }
        : null;

    return { items, nextCursor };
  } catch (e) {
    const appErr = toAppError(e, context);
    logError(appErr);
    throw appErr;
  }
}