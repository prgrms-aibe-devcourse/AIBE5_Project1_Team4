import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1) supabaseClient 모킹
vi.mock('@/lib/supabaseClient', () => {
  return {
    supabase: {
      rpc: vi.fn(),
    },
  };
});

// 2) errors 모킹 (unwrap/toAppError/logError/AppError)
vi.mock('@/services/_core/errors', async () => {
  class AppError extends Error {
    constructor({ kind, message, detail, context, status }) {
      super(message);
      this.name = 'AppError';
      this.kind = kind || 'unknown';
      this.detail = detail;
      this.context = context;
      this.status = status;
    }
  }

  return {
    AppError,
    unwrap: vi.fn((result, _context) => {
      // 기본 unwrap 동작 흉내: error 있으면 throw, 아니면 data 반환
      if (!result)
        throw new AppError({ kind: 'unknown', message: 'Empty result' });
      if (result.error) throw result.error;
      return result.data;
    }),
    toAppError: vi.fn((e, context) => {
      // 서비스에서 catch로 들어온 e를 AppError로 감싸는 형태만 유지
      if (e instanceof AppError) return e;
      return new AppError({
        kind: 'unknown',
        message: e?.message ?? 'Unknown error',
        detail: e,
        context,
      });
    }),
    logError: vi.fn(),
  };
});

import { supabase } from '@/lib/supabaseClient';
import {
  unwrap,
  toAppError,
  logError,
  AppError,
} from '@/services/_core/errors';

import {
  getFilterOptions,
  listPublicTrips,
  createTripDraft,
  updateTripMeta,
  adjustTripDates,
} from './trips.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('trips.service', () => {
  describe('getFilterOptions', () => {
    it('지역/테마 옵션을 rpc로 조회하고 count를 number로 매핑한다', async () => {
      supabase.rpc
        .mockResolvedValueOnce({
          data: [
            { name: '서울', slug: 'seoul', trip_count: '12' },
            { name: '부산', slug: 'busan', trip_count: 3 },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [{ name: '맛집', slug: 'food', trip_count: '7' }],
          error: null,
        });

      const res = await getFilterOptions();

      expect(supabase.rpc).toHaveBeenCalledTimes(2);
      expect(supabase.rpc).toHaveBeenNthCalledWith(
        1,
        'get_region_filter_options',
      );
      expect(supabase.rpc).toHaveBeenNthCalledWith(
        2,
        'get_theme_filter_options',
      );

      expect(unwrap).toHaveBeenCalledTimes(2);

      expect(res).toEqual({
        regions: [
          { name: '서울', slug: 'seoul', count: 12 },
          { name: '부산', slug: 'busan', count: 3 },
        ],
        themes: [{ name: '맛집', slug: 'food', count: 7 }],
      });
    });

    it('에러 발생 시 toAppError로 감싸고 logError 후 throw 한다', async () => {
      const rawErr = new Error('boom');

      // 첫번째 rpc에서 실패
      supabase.rpc.mockResolvedValueOnce({ data: null, error: rawErr });

      await expect(getFilterOptions()).rejects.toBeInstanceOf(AppError);

      expect(toAppError).toHaveBeenCalledWith(
        expect.anything(),
        'tripsService.getFilterOptions',
      );
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe('listPublicTrips', () => {
    it('latest 정렬에서 커서 기반 페이지네이션(nextCursor) 계산을 한다', async () => {
      const rows = Array.from({ length: 3 }).map((_, i) => ({
        id: `trip-${i + 1}`,
        title: `t${i + 1}`,
        summary: null,
        cover_image_url: null,
        start_date: '2026-01-01',
        end_date: '2026-01-03',
        created_at: `2026-01-0${i + 1}T00:00:00Z`,
        author_id: 'u1',
        author_name: 'alice',
        author_avatar_url: null,
        like_count: '0',
        bookmark_count: '0',
        member_count: '1',
        regions: [],
        themes: [],
      }));

      supabase.rpc.mockResolvedValueOnce({ data: rows, error: null });

      const { items, nextCursor } = await listPublicTrips({
        q: '부산',
        limit: 3,
        cursor: { createdAt: '2026-01-01T00:00:00Z', id: 'trip-0' },
        sort: 'latest',
      });

      expect(supabase.rpc).toHaveBeenCalledWith('list_public_trips', {
        p_limit: 3,
        p_q: '부산',
        p_cursor_created_at: '2026-01-01T00:00:00Z',
        p_cursor_id: 'trip-0',
        p_sort: 'latest',
      });

      expect(items).toHaveLength(3);
      // like_count 등 숫자 매핑 확인
      expect(items[0].like_count).toBe(0);
      expect(items[0].bookmark_count).toBe(0);
      expect(items[0].member_count).toBe(1);

      // 마지막 아이템 기준 nextCursor
      expect(nextCursor).toEqual({
        createdAt: items[2].created_at,
        id: items[2].id,
      });
    });

    it('popular 정렬에서는 nextCursor가 항상 null이다', async () => {
      const rows = [
        {
          id: 'trip-1',
          title: 't1',
          summary: null,
          cover_image_url: null,
          start_date: '2026-01-01',
          end_date: '2026-01-03',
          created_at: '2026-01-01T00:00:00Z',
          author_id: 'u1',
          author_name: 'alice',
          author_avatar_url: null,
          like_count: '10',
          bookmark_count: '2',
          member_count: '5',
          regions: [],
          themes: [],
        },
      ];
      supabase.rpc.mockResolvedValueOnce({ data: rows, error: null });

      const { nextCursor } = await listPublicTrips({
        sort: 'popular',
        limit: 1,
      });

      expect(nextCursor).toBeNull();
    });

    it('limit은 1~50으로 clamp 된다', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      await listPublicTrips({ limit: 999, sort: 'latest' });

      expect(supabase.rpc).toHaveBeenCalledWith(
        'list_public_trips',
        expect.objectContaining({ p_limit: 50 }),
      );
    });

    it('에러 발생 시 toAppError로 감싸고 logError 후 throw 한다', async () => {
      const rawErr = new Error('rpc failed');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: rawErr });

      await expect(listPublicTrips()).rejects.toBeInstanceOf(AppError);

      expect(toAppError).toHaveBeenCalledWith(
        expect.anything(),
        'tripsService.listPublicTrips',
      );
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTripDraft', () => {
    it('create_trip_draft rpc를 호출하고 trip_id를 반환한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ trip_id: 't-1' }],
        error: null,
      });

      const tripId = await createTripDraft();

      expect(supabase.rpc).toHaveBeenCalledWith('create_trip_draft');
      expect(tripId).toBe('t-1');
    });

    it('RPC 결과가 비면 AppError를 던진다', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      await expect(createTripDraft()).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('updateTripMeta', () => {
    it('update_trip_meta rpc를 올바른 파라미터로 호출하고 trip_id를 반환한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ trip_id: 't-1' }],
        error: null,
      });

      const id = await updateTripMeta({
        tripId: 't-1',
        title: 'new',
        summary: null,
        visibility: 'public',
      });

      expect(supabase.rpc).toHaveBeenCalledWith('update_trip_meta', {
        p_trip_id: 't-1',
        p_title: 'new',
        p_summary: null,
        p_visibility: 'public',
      });
      expect(id).toBe('t-1');
    });
  });

  describe('adjustTripDates', () => {
    it('adjust_trip_dates rpc를 올바른 파라미터로 호출하고 trip_id를 반환한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ trip_id: 't-1' }],
        error: null,
      });

      const id = await adjustTripDates({
        tripId: 't-1',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
      });

      expect(supabase.rpc).toHaveBeenCalledWith('adjust_trip_dates', {
        p_trip_id: 't-1',
        p_start_date: '2026-02-10',
        p_end_date: '2026-02-12',
      });
      expect(id).toBe('t-1');
    });
  });
});
