// src/services/scheduleItems.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ------------------------------------------------------
// supabase mock
// ------------------------------------------------------
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// ------------------------------------------------------
// errors mock (unwrap + AppError + toAppError + logError)
// ------------------------------------------------------
vi.mock('@/services/_core/errors', async () => {
  class AppError extends Error {
    constructor({ kind, message, detail, context, status, cause } = {}) {
      super(message);
      this.name = 'AppError';
      this.kind = kind || 'unknown';
      this.detail = detail;
      this.context = context;
      this.status = status;
      this.cause = cause;
    }
  }

  const unwrap = vi.fn((result, _context) => {
    if (!result)
      throw new AppError({ kind: 'unknown', message: 'Empty result' });
    if (result.error) throw result.error;
    return result.data;
  });

  // addScheduleItemWithPlace에서 invoke error를 AppError로 변환할 수 있음
  const toAppError = vi.fn((err, context) => {
    return new AppError({
      kind: 'unknown',
      message: err?.message || 'Unknown error',
      context,
      cause: err,
    });
  });

  const logError = vi.fn();

  return { AppError, unwrap, toAppError, logError };
});

import { supabase } from '@/lib/supabaseClient';
import { AppError } from '@/services/_core/errors';

import {
  upsertScheduleItem,
  deleteScheduleItem,
  addScheduleItemWithPlace,
} from './scheduleItems.service';

beforeEach(() => {
  vi.clearAllMocks();

  // ✅ 기본값을 깔아둬서 destructuring TypeError 방지
  supabase.auth.getSession.mockResolvedValue({
    data: { session: { access_token: 'token' } },
  });
});

// ======================================================
// Tests
// ======================================================
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
        tripDayId: null,
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
        expect.objectContaining({ p_time: '09:30:00' }),
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

  // ======================================================
  // Edge Function 기반
  // ======================================================
  describe('addScheduleItemWithPlace', () => {
    const tripDayId = 'day-100';
    const place = {
      provider: 'kakao',
      provider_place_id: 'kakao-123',
      name: '테스트 장소',
      category: '카테고리',
      address: '지번 주소',
      road_address: '도로명 주소',
      phone: '02-123-4567',
      latitude: 37.1234,
      longitude: 127.1234,
      raw_data: { foo: 'bar' },
    };

    it('세션이 없으면 AppError(kind=auth)를 던진다', async () => {
      supabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await expect(
        addScheduleItemWithPlace(tripDayId, place),
      ).rejects.toMatchObject({
        name: 'AppError',
        kind: 'auth',
        context: 'scheduleItems.addScheduleItemWithPlace',
      });

      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('functions.invoke가 response.error를 반환하면 AppError로 throw한다', async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'invoke failed' },
      });

      await expect(
        addScheduleItemWithPlace(tripDayId, place),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('Edge Function이 { error: string } 형태면 AppError로 throw한다', async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: { error: 'You do not have permission to edit this trip' },
        error: null,
      });

      await expect(
        addScheduleItemWithPlace(tripDayId, place),
      ).rejects.toMatchObject({
        name: 'AppError',
        kind: 'forbidden',
        context: 'scheduleItems.addScheduleItemWithPlace',
      });
    });

    it('Edge Function이 data를 안 주면 AppError(unknown)를 던진다', async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: { data: null },
        error: null,
      });

      await expect(
        addScheduleItemWithPlace(tripDayId, place),
      ).rejects.toMatchObject({
        name: 'AppError',
        kind: 'unknown',
        message: 'Edge Function returned no data',
        context: 'scheduleItems.addScheduleItemWithPlace',
      });
    });

    it('성공 시 scheduleItemId/placeId/orderIndex를 반환한다', async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: {
          data: {
            schedule_item_id: 'si-1',
            place_id: 'p-1',
            order_index: 3,
          },
        },
        error: null,
      });

      const out = await addScheduleItemWithPlace(tripDayId, place, {
        time: '09:30',
        durationMinutes: 60,
        notes: 'memo',
      });

      expect(out).toEqual({
        scheduleItemId: 'si-1',
        placeId: 'p-1',
        orderIndex: 3,
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'add-schedule-item',
        expect.any(Object),
      );
      const [, args] = supabase.functions.invoke.mock.calls[0];
      expect(args.body).toMatchObject({
        trip_day_id: tripDayId,
        duration_minutes: 60,
        notes: 'memo',
        place: {
          provider: 'kakao',
          provider_place_id: 'kakao-123',
          name: '테스트 장소',
          latitude: 37.1234,
          longitude: 127.1234,
        },
      });
      expect(args.body.time).toBeTruthy();
    });
  });
});
