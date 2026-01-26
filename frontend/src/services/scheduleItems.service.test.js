// src/services/schedule-items.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// supabase mock
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: vi.fn() },
}));

// errors mock (unwrap/toAppError/logError/AppError)
// - schedule-items.service.js는 unwrap + AppError만 쓰면 충분
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

import {
  upsertScheduleItem,
  deleteScheduleItem,
} from './scheduleItems.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('schedule-items.service', () => {
  describe('upsertScheduleItem', () => {
    it('insert: id 없이 호출하면 upsert_schedule_item rpc를 호출하고 반환 id를 리턴한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ id: 'item-1' }],
        error: null,
      });

      const id = await upsertScheduleItem({
        tripDayId: 'day-1',
        placeId: 'place-1',
        time: null,
        durationMinutes: null,
        notes: 'memo',
      });

      expect(supabase.rpc).toHaveBeenCalledWith('upsert_schedule_item', {
        p_id: null,
        p_trip_day_id: 'day-1',
        p_place_id: 'place-1',
        p_time: null,
        p_duration_minutes: null,
        p_notes: 'memo',
      });
      expect(id).toBe('item-1');
    });

    it('update: id 있으면 update로 호출한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ id: 'item-9' }],
        error: null,
      });

      const id = await upsertScheduleItem({
        id: 'item-9',
        tripDayId: null, // update에서는 필요 없게 설계했으니 null 허용
        placeId: 'place-2',
        time: '09:30:00',
        durationMinutes: 60,
        notes: null,
      });

      expect(supabase.rpc).toHaveBeenCalledWith('upsert_schedule_item', {
        p_id: 'item-9',
        p_trip_day_id: null,
        p_place_id: 'place-2',
        p_time: '09:30:00',
        p_duration_minutes: 60,
        p_notes: null,
      });
      expect(id).toBe('item-9');
    });

    it('time이 "HH:MM"이면 "HH:MM:00"으로 normalize해서 보낸다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ id: 'item-2' }],
        error: null,
      });

      await upsertScheduleItem({
        tripDayId: 'day-1',
        placeId: 'place-1',
        time: '09:30',
      });

      expect(supabase.rpc).toHaveBeenCalledWith(
        'upsert_schedule_item',
        expect.objectContaining({
          p_time: '09:30:00',
        }),
      );
    });

    it('RPC 결과가 비어있으면 AppError를 던진다', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      await expect(
        upsertScheduleItem({ tripDayId: 'day-1', placeId: 'place-1' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('RPC error면 그대로 throw된다(unwrap이 throw)', async () => {
      const rawErr = new Error('rpc failed');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: rawErr });

      await expect(
        upsertScheduleItem({ tripDayId: 'day-1', placeId: 'place-1' }),
      ).rejects.toBe(rawErr);
    });
  });

  describe('deleteScheduleItem', () => {
    it('delete_schedule_item rpc를 호출하고 반환 id를 리턴한다', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ id: 'item-7' }],
        error: null,
      });

      const deletedId = await deleteScheduleItem('item-7');

      expect(supabase.rpc).toHaveBeenCalledWith('delete_schedule_item', {
        p_id: 'item-7',
      });
      expect(deletedId).toBe('item-7');
    });

    it('RPC 결과가 비어있으면 AppError를 던진다', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      await expect(deleteScheduleItem('item-x')).rejects.toBeInstanceOf(
        AppError,
      );
    });

    it('RPC error면 그대로 throw된다(unwrap이 throw)', async () => {
      const rawErr = new Error('rpc failed');
      supabase.rpc.mockResolvedValueOnce({ data: null, error: rawErr });

      await expect(deleteScheduleItem('item-x')).rejects.toBe(rawErr);
    });
  });
});
