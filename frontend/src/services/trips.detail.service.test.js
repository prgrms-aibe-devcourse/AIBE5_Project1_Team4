import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTripDetailSummary,
  getTripDetailSchedule,
  getTripDetail,
} from './trips.detail.service';
import { AppError } from '@/services/_core/errors';

// supabaseClient mock
vi.mock('@/lib/supabaseClient', () => {
  return {
    supabase: {
      rpc: vi.fn(),
    },
  };
});

import { supabase } from '@/lib/supabaseClient';

describe('trips.detail.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTripDetailSummary: success -> returns data', async () => {
    supabase.rpc.mockResolvedValueOnce({
      data: { trip: { id: 't1', title: 'hello' } },
      error: null,
    });

    const data = await getTripDetailSummary('t1');
    expect(data.trip.title).toBe('hello');
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_trip_detail_summary', {
      p_trip_id: 't1',
    });
  });

  it('getTripDetailSchedule: success -> returns days array', async () => {
    supabase.rpc.mockResolvedValueOnce({
      data: { days: [] },
      error: null,
    });

    const data = await getTripDetailSchedule('t1');
    expect(Array.isArray(data.days)).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith('rpc_trip_detail_schedule', {
      p_trip_id: 't1',
    });
  });

  it('getTripDetail: calls both in parallel and returns {summary, schedule}', async () => {
    supabase.rpc
      .mockResolvedValueOnce({ data: { trip: { id: 't1' } }, error: null }) // summary
      .mockResolvedValueOnce({
        data: { days: [{ dayId: 'd1', items: [] }] },
        error: null,
      }); // schedule

    const data = await getTripDetail('t1');

    expect(data.summary.trip.id).toBe('t1');
    expect(data.schedule.days[0].dayId).toBe('d1');
    expect(supabase.rpc).toHaveBeenCalledTimes(2);
  });

  it('RPC error -> unwrap throws AppError', async () => {
    supabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'trip_not_found', status: 400 },
    });

    await expect(getTripDetailSummary('t1')).rejects.toBeInstanceOf(AppError);
  });
});
