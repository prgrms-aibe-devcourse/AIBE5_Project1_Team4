import { describe, it, expect, vi, beforeEach } from 'vitest';

// supabase mock
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: vi.fn() },
}));

// errors mock
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
      if (!result)
        throw new AppError({ kind: 'unknown', message: 'Empty result' });
      if (result.error) throw result.error;
      return result.data;
    }),
  };
});

import { supabase } from '@/lib/supabaseClient';
import { AppError } from '@/services/_core/errors';

import { insertTripDayAfter, deleteTripDay } from './trips.editDays.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('trips.editDays.service', () => {
  describe('insertTripDayAfter', () => {
    it('rpc_insert_trip_day_after를 올바른 파라미터로 호출하고 row를 반환한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ trip_id: 't1', inserted_date: '2026-01-27' }],
        error: null,
      });

      const row = await insertTripDayAfter({
        tripId: 't1',
        afterDate: '2026-01-26',
      });

      expect(supabase.rpc).toHaveBeenCalledWith('rpc_insert_trip_day_after', {
        p_trip_id: 't1',
        p_after_date: '2026-01-26',
      });

      expect(row).toEqual({ trip_id: 't1', inserted_date: '2026-01-27' });
    });

    it('RPC 결과가 비어있으면 AppError를 던진다', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      await expect(
        insertTripDayAfter({ tripId: 't1', afterDate: '2026-01-26' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('RPC error면 그대로 throw된다(unwrap이 throw)', async () => {
      const rawErr = new Error('rpc failed');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: rawErr });

      await expect(
        insertTripDayAfter({ tripId: 't1', afterDate: '2026-01-26' }),
      ).rejects.toBe(rawErr);
    });
  });

  describe('deleteTripDay', () => {
    it('rpc_delete_trip_day를 올바른 파라미터로 호출하고 row를 반환한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ trip_id: 't1', deleted_date: '2026-01-26' }],
        error: null,
      });

      const row = await deleteTripDay({
        tripId: 't1',
        date: '2026-01-26',
      });

      expect(supabase.rpc).toHaveBeenCalledWith('rpc_delete_trip_day', {
        p_trip_id: 't1',
        p_date: '2026-01-26',
      });

      expect(row).toEqual({ trip_id: 't1', deleted_date: '2026-01-26' });
    });

    it('RPC 결과가 비어있으면 AppError를 던진다', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      await expect(
        deleteTripDay({ tripId: 't1', date: '2026-01-26' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('RPC error면 그대로 throw된다(unwrap이 throw)', async () => {
      const rawErr = new Error('rpc failed');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: rawErr });

      await expect(
        deleteTripDay({ tripId: 't1', date: '2026-01-26' }),
      ).rejects.toBe(rawErr);
    });
  });
});
