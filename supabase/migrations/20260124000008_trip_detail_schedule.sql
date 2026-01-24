create or replace function public.rpc_trip_detail_schedule(p_trip_id uuid)
returns jsonb
language sql
security invoker
as $$
  with d as (
    select
      td.id as trip_day_id,
      td.date,
      td.notes
    from public.trip_days td
    where td.trip_id = p_trip_id
    order by td.date asc
  ),
  i as (
    select
      si.id as item_id,
      si.trip_day_id,
      si.time,
      si.duration_minutes,
      si.notes,
      si.order_index,
      si.place_id,
      p.name as place_name,
      p.latitude as lat,
      p.longitude as lng
    from public.schedule_items si
    join public.places p on p.id = si.place_id
    where si.trip_day_id in (select trip_day_id from d)
  )
  select jsonb_build_object(
    'days',
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'dayId', d.trip_day_id,
          'date', d.date,
          'notes', d.notes,
          'items', (
            select coalesce(
              jsonb_agg(
                jsonb_build_object(
                  'itemId', i.item_id,
                  'time', i.time,
                  'durationMinutes', i.duration_minutes,
                  'notes', i.notes,
                  'orderIndex', i.order_index,
                  'place', jsonb_build_object(
                    'id', i.place_id,
                    'name', i.place_name,
                    'lat', i.lat,
                    'lng', i.lng
                  )
                )
                order by i.time asc nulls last, i.order_index asc
              ),
              '[]'::jsonb
            )
            from i
            where i.trip_day_id = d.trip_day_id
          )
        )
        order by d.date asc
      ),
      '[]'::jsonb
    )
  )
  from d;
$$;
