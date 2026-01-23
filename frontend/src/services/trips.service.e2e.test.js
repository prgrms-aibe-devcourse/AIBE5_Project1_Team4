import { describe, it, expect } from 'vitest';
import { supabase } from '@/lib/supabaseClient';

describe('[E2E] list_public_trips RPC', () => {
  it('should fetch public trips via RPC (anon)', async () => {
    // 1) 혹시 로그인 상태면 로그아웃
    await supabase.auth.signOut();

    // 2) RPC 호출
    const { data, error } = await supabase.rpc('list_public_trips', {
      p_limit: 5,
      p_cursor_created_at: null,
      p_cursor_id: null,
      p_q: null,
    });

    // 3) 에러 없어야 함
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    // 4) 0개일 수도 있으니, 있으면 shape만 체크
    if (data.length > 0) {
      const row = data[0];

      // 필수 필드 존재 확인
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('title');
      expect(row).toHaveProperty('created_at');

      expect(row).toHaveProperty('author_id');
      expect(row).toHaveProperty('author_name');

      expect(row).toHaveProperty('like_count');
      expect(row).toHaveProperty('bookmark_count');
      expect(row).toHaveProperty('member_count');

      // 타입 스모크 체크
      expect(typeof row.like_count).toBe('number');
      expect(typeof row.bookmark_count).toBe('number');
      expect(typeof row.member_count).toBe('number');
    }
  });
});
