// src/services/trips.editDays.service.js
import { supabase } from '@/lib/supabaseClient';
import { unwrap, AppError } from '@/services/_core/errors';

function requireRow(value, context, message) {
  if (!value) throw new AppError({ kind: 'unknown', message, context });
  return value;
}

/**
 * 선택 Day 다음에 Day 삽입 (뒤 Day들 +1일 연쇄, end_date +1)
 * @param {{ tripId: string, afterDate: string }} params
 * afterDate: 'YYYY-MM-DD'
 */
export async function insertTripDayAfter({ tripId, afterDate }) {
  const result = await supabase.rpc('rpc_insert_trip_day_after', {
    p_trip_id: tripId,
    p_after_date: afterDate,
  });

  const data = unwrap(result, 'trips.editDays.insertTripDayAfter');
  const row = data?.[0];

  requireRow(
    row?.inserted_date,
    'trips.editDays.insertTripDayAfter',
    'rpc_insert_trip_day_after returned empty',
  );

  return row; // { trip_id, inserted_date }
}

/**
 * Day 삭제 (뒤 Day들 -1일 연쇄, end_date -1)
 * @param {{ tripId: string, date: string }} params
 * date: 'YYYY-MM-DD'
 */
export async function deleteTripDay({ tripId, date }) {
  const result = await supabase.rpc('rpc_delete_trip_day', {
    p_trip_id: tripId,
    p_date: date,
  });

  const data = unwrap(result, 'trips.editDays.deleteTripDay');
  const row = data?.[0];

  requireRow(
    row?.deleted_date,
    'trips.editDays.deleteTripDay',
    'rpc_delete_trip_day returned empty',
  );

  return row; // { trip_id, deleted_date }
}
