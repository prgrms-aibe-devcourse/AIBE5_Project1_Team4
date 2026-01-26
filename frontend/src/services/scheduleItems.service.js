// src/services/scheduleItems.service.js
import { supabase } from '@/lib/supabaseClient';
import { unwrap, AppError } from '@/services/_core/errors';

function requireRow(value, context, message = 'RPC returned empty result') {
  if (!value) throw new AppError({ kind: 'unknown', message, context });
  return value;
}

function normalizeTime(t) {
  if (t == null) return null;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

/**
 * upsert_schedule_item
 * - id 있으면 update
 * - id 없으면 insert (tripDayId, placeId 필수)
 */
export async function upsertScheduleItem({
  id = null,
  tripDayId = null,
  placeId = null,
  time = null,
  durationMinutes = null,
  notes = null,
}) {
  const result = await supabase.rpc('upsert_schedule_item', {
    p_id: id,
    p_trip_day_id: tripDayId,
    p_place_id: placeId,
    p_time: normalizeTime(time),
    p_duration_minutes: durationMinutes,
    p_notes: notes,
  });
  const data = unwrap(result, 'scheduleItems.upsertScheduleItem');

  const itemId = data?.[0]?.id;
  return requireRow(
    itemId,
    'scheduleItems.upsertScheduleItem',
    'upsert_schedule_item returned no id',
  );
}

export async function deleteScheduleItem(id) {
  const result = await supabase.rpc('delete_schedule_item', {
    p_id: id,
  });
  const data = unwrap(result, 'scheduleItems.deleteScheduleItem');

  const deletedId = data?.[0]?.id;
  return requireRow(
    deletedId,
    'scheduleItems.deleteScheduleItem',
    'delete_schedule_item returned no id',
  );
}
