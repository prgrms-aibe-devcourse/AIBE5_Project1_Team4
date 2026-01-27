// src/services/reviews.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==============================
// Mocks
// ==============================
const rpcMock = vi.fn();

const fromMock = vi.fn();
const selectMock = vi.fn();
const inMock = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    rpc: (...args) => rpcMock(...args),
    from: (...args) => fromMock(...args),
  },
}));

const unwrapMock = vi.fn();
const toAppErrorMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock('@/services/_core/errors', () => ({
  unwrap: (...args) => unwrapMock(...args),
  toAppError: (...args) => toAppErrorMock(...args),
  logError: (...args) => logErrorMock(...args),
}));

import {
  listTripReviews,
  upsertTripReview,
  deleteTripReview,
  getMyTripReview,
  getTripReviewStats,
  listPlaceReviews,
  upsertPlaceReview,
  deletePlaceReview,
  getMyPlaceReview,
  getPlaceReviewStats,
  getTripReviewStatsBatch,
  getPlaceReviewStatsBatch,
} from './reviews.service';

// ==============================
// Helpers
// ==============================
function makeSupabaseResult(data, error = null) {
  return { data, error };
}

function makeAppError(msg = 'boom') {
  return { name: 'AppError', message: msg };
}

// ==============================
// Tests
// ==============================
describe('reviews.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default unwrap behavior: return result.data
    unwrapMock.mockImplementation((result) => result?.data);

    // Default supabase.from chain
    fromMock.mockImplementation(() => ({
      select: selectMock,
    }));

    selectMock.mockImplementation(() => ({
      in: inMock,
    }));
  });

  // --------------------------------------------------
  // Trip Reviews
  // --------------------------------------------------
  describe('Trip Reviews', () => {
    it('listTripReviews: calls RPC with defaults and maps rows', async () => {
      const tripId = 'trip-1';

      const rows = [
        {
          id: 'r1',
          trip_id: tripId,
          author_id: 'u1',
          rating: 5,
          content: 'nice',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          author_username: 'alice',
          author_full_name: 'Alice',
          author_avatar_url: 'https://a',
          is_mine: true,
        },
        {
          id: 'r2',
          trip_id: tripId,
          author_id: 'u2',
          rating: 4,
          content: null,
          created_at: '2026-01-03T00:00:00Z',
          updated_at: '2026-01-04T00:00:00Z',
          author_username: 'bob',
          author_full_name: null,
          author_avatar_url: null,
          is_mine: false,
        },
      ];

      rpcMock.mockResolvedValue(makeSupabaseResult(rows));

      const result = await listTripReviews(tripId);

      expect(rpcMock).toHaveBeenCalledWith('list_trip_reviews', {
        p_trip_id: tripId,
        p_limit: 20,
        p_offset: 0,
      });

      expect(result).toEqual([
        {
          id: 'r1',
          trip_id: tripId,
          author_id: 'u1',
          rating: 5,
          content: 'nice',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
          author: {
            id: 'u1',
            username: 'alice',
            full_name: 'Alice',
            avatar_url: 'https://a',
          },
          is_mine: true,
        },
        {
          id: 'r2',
          trip_id: tripId,
          author_id: 'u2',
          rating: 4,
          content: null,
          created_at: '2026-01-03T00:00:00Z',
          updated_at: '2026-01-04T00:00:00Z',
          author: {
            id: 'u2',
            username: 'bob',
            full_name: null,
            avatar_url: null,
          },
          is_mine: false,
        },
      ]);
    });

    it('listTripReviews: uses provided pagination', async () => {
      const tripId = 'trip-1';
      rpcMock.mockResolvedValue(makeSupabaseResult([]));

      await listTripReviews(tripId, { limit: 7, offset: 14 });

      expect(rpcMock).toHaveBeenCalledWith('list_trip_reviews', {
        p_trip_id: tripId,
        p_limit: 7,
        p_offset: 14,
      });
    });

    it('upsertTripReview: calls RPC and returns data', async () => {
      const tripId = 'trip-1';
      const payload = {
        id: 'mine',
        rating: 5,
        content: 'ok',
        created_at: 't1',
        updated_at: 't2',
      };

      rpcMock.mockResolvedValue(makeSupabaseResult(payload));

      const res = await upsertTripReview(tripId, { rating: 5, content: 'ok' });

      expect(rpcMock).toHaveBeenCalledWith('upsert_trip_review', {
        p_trip_id: tripId,
        p_rating: 5,
        p_content: 'ok',
      });
      expect(res).toEqual(payload);
    });

    it('upsertTripReview: sends null when content omitted', async () => {
      const tripId = 'trip-1';
      rpcMock.mockResolvedValue(makeSupabaseResult({ id: 'x' }));

      await upsertTripReview(tripId, { rating: 4 });

      expect(rpcMock).toHaveBeenCalledWith('upsert_trip_review', {
        p_trip_id: tripId,
        p_rating: 4,
        p_content: null,
      });
    });

    it('deleteTripReview: returns true only when RPC returns true', async () => {
      const tripId = 'trip-1';

      rpcMock.mockResolvedValueOnce(makeSupabaseResult(true));
      await expect(deleteTripReview(tripId)).resolves.toBe(true);

      rpcMock.mockResolvedValueOnce(makeSupabaseResult(false));
      await expect(deleteTripReview(tripId)).resolves.toBe(false);
    });

    it('getMyTripReview: returns object or null', async () => {
      const tripId = 'trip-1';

      rpcMock.mockResolvedValueOnce(makeSupabaseResult(null));
      await expect(getMyTripReview(tripId)).resolves.toBeNull();

      const my = {
        id: 'm1',
        rating: 3,
        content: null,
        created_at: 'a',
        updated_at: 'b',
      };
      rpcMock.mockResolvedValueOnce(makeSupabaseResult(my));
      await expect(getMyTripReview(tripId)).resolves.toEqual(my);
    });

    it('getTripReviewStats: returns default when RPC returns empty', async () => {
      const tripId = 'trip-1';
      rpcMock.mockResolvedValue(makeSupabaseResult([]));

      const stats = await getTripReviewStats(tripId);

      expect(rpcMock).toHaveBeenCalledWith('get_trip_review_stats', {
        p_trip_id: tripId,
      });
      expect(stats).toEqual({ review_count: 0, avg_rating: null });
    });

    it('getTripReviewStats: parses numbers', async () => {
      const tripId = 'trip-1';
      rpcMock.mockResolvedValue(
        makeSupabaseResult([{ review_count: '12', avg_rating: '4.25' }]),
      );

      const stats = await getTripReviewStats(tripId);
      expect(stats).toEqual({ review_count: 12, avg_rating: 4.25 });
    });
  });

  // --------------------------------------------------
  // Place Reviews
  // --------------------------------------------------
  describe('Place Reviews', () => {
    it('listPlaceReviews: calls RPC with defaults and maps rows', async () => {
      const placeId = 'place-1';
      const rows = [
        {
          id: 'p1',
          place_id: placeId,
          author_id: 'u1',
          rating: 5,
          content: 'great',
          created_at: 'c1',
          updated_at: 'u1',
          author_username: 'alice',
          author_full_name: null,
          author_avatar_url: null,
          is_mine: true,
        },
      ];

      rpcMock.mockResolvedValue(makeSupabaseResult(rows));

      const res = await listPlaceReviews(placeId);

      expect(rpcMock).toHaveBeenCalledWith('list_place_reviews', {
        p_place_id: placeId,
        p_limit: 20,
        p_offset: 0,
      });

      expect(res).toEqual([
        {
          id: 'p1',
          place_id: placeId,
          author_id: 'u1',
          rating: 5,
          content: 'great',
          created_at: 'c1',
          updated_at: 'u1',
          author: {
            id: 'u1',
            username: 'alice',
            full_name: null,
            avatar_url: null,
          },
          is_mine: true,
        },
      ]);
    });

    it('upsertPlaceReview: calls RPC and returns data', async () => {
      const placeId = 'place-1';
      const payload = {
        id: 'mine',
        rating: 4,
        content: null,
        created_at: 'a',
        updated_at: 'b',
      };

      rpcMock.mockResolvedValue(makeSupabaseResult(payload));

      const res = await upsertPlaceReview(placeId, { rating: 4 });

      expect(rpcMock).toHaveBeenCalledWith('upsert_place_review', {
        p_place_id: placeId,
        p_rating: 4,
        p_content: null,
      });
      expect(res).toEqual(payload);
    });

    it('deletePlaceReview: returns true only when RPC returns true', async () => {
      const placeId = 'place-1';

      rpcMock.mockResolvedValueOnce(makeSupabaseResult(true));
      await expect(deletePlaceReview(placeId)).resolves.toBe(true);

      rpcMock.mockResolvedValueOnce(makeSupabaseResult(false));
      await expect(deletePlaceReview(placeId)).resolves.toBe(false);
    });

    it('getMyPlaceReview: returns object or null', async () => {
      const placeId = 'place-1';

      rpcMock.mockResolvedValueOnce(makeSupabaseResult(null));
      await expect(getMyPlaceReview(placeId)).resolves.toBeNull();

      const my = {
        id: 'm1',
        rating: 3,
        content: 'x',
        created_at: 'a',
        updated_at: 'b',
      };
      rpcMock.mockResolvedValueOnce(makeSupabaseResult(my));
      await expect(getMyPlaceReview(placeId)).resolves.toEqual(my);
    });

    it('getPlaceReviewStats: returns default when RPC returns empty', async () => {
      const placeId = 'place-1';
      rpcMock.mockResolvedValue(makeSupabaseResult([]));

      const stats = await getPlaceReviewStats(placeId);

      expect(rpcMock).toHaveBeenCalledWith('get_place_review_stats', {
        p_place_id: placeId,
      });
      expect(stats).toEqual({ review_count: 0, avg_rating: null });
    });

    it('getPlaceReviewStats: parses numbers', async () => {
      const placeId = 'place-1';
      rpcMock.mockResolvedValue(
        makeSupabaseResult([{ review_count: 2, avg_rating: 3.5 }]),
      );

      const stats = await getPlaceReviewStats(placeId);
      expect(stats).toEqual({ review_count: 2, avg_rating: 3.5 });
    });
  });

  // --------------------------------------------------
  // Batch Operations
  // --------------------------------------------------
  describe('Batch Operations', () => {
    it('getTripReviewStatsBatch: returns {} when empty input', async () => {
      await expect(getTripReviewStatsBatch([])).resolves.toEqual({});
      await expect(getTripReviewStatsBatch(null)).resolves.toEqual({});
      expect(fromMock).not.toHaveBeenCalled();
    });

    it('getTripReviewStatsBatch: maps rows and fills defaults', async () => {
      const tripIds = ['t1', 't2', 't3'];

      // chain: from('trip_review_stats').select(...).in(...)
      inMock.mockResolvedValue(
        makeSupabaseResult([
          { trip_id: 't1', review_count: '3', avg_rating: '4.33' },
          { trip_id: 't3', review_count: 1, avg_rating: null },
        ]),
      );

      const res = await getTripReviewStatsBatch(tripIds);

      expect(fromMock).toHaveBeenCalledWith('trip_review_stats');
      expect(selectMock).toHaveBeenCalledWith(
        'trip_id, review_count, avg_rating',
      );
      expect(res).toEqual({
        t1: { review_count: 3, avg_rating: 4.33 },
        t2: { review_count: 0, avg_rating: null },
        t3: { review_count: 1, avg_rating: null },
      });
    });

    it('getPlaceReviewStatsBatch: returns {} when empty input', async () => {
      await expect(getPlaceReviewStatsBatch([])).resolves.toEqual({});
      expect(fromMock).not.toHaveBeenCalled();
    });

    it('getPlaceReviewStatsBatch: maps rows and fills defaults', async () => {
      const placeIds = ['p1', 'p2'];

      inMock.mockResolvedValue(
        makeSupabaseResult([
          { place_id: 'p2', review_count: '10', avg_rating: '4.9' },
        ]),
      );

      const res = await getPlaceReviewStatsBatch(placeIds);

      expect(fromMock).toHaveBeenCalledWith('place_review_stats');
      expect(selectMock).toHaveBeenCalledWith(
        'place_id, review_count, avg_rating',
      );
      expect(res).toEqual({
        p1: { review_count: 0, avg_rating: null },
        p2: { review_count: 10, avg_rating: 4.9 },
      });
    });
  });

  // --------------------------------------------------
  // Error handling (representative tests)
  // --------------------------------------------------
  describe('Error handling', () => {
    it('listTripReviews: wraps and logs error when unwrap throws', async () => {
      const tripId = 'trip-1';

      rpcMock.mockResolvedValue(makeSupabaseResult(null));
      unwrapMock.mockImplementation(() => {
        throw new Error('unwrap failed');
      });

      const appErr = makeAppError('mapped');
      toAppErrorMock.mockReturnValue(appErr);

      await expect(listTripReviews(tripId)).rejects.toEqual(appErr);

      expect(toAppErrorMock).toHaveBeenCalled();
      expect(logErrorMock).toHaveBeenCalledWith(appErr);
    });

    it('getTripReviewStatsBatch: wraps and logs error on query failure', async () => {
      const tripIds = ['t1'];

      inMock.mockResolvedValue(makeSupabaseResult(null));
      unwrapMock.mockImplementation(() => {
        throw new Error('unwrap failed');
      });

      const appErr = makeAppError('mapped');
      toAppErrorMock.mockReturnValue(appErr);

      await expect(getTripReviewStatsBatch(tripIds)).rejects.toEqual(appErr);
      expect(logErrorMock).toHaveBeenCalledWith(appErr);
    });
  });
});
