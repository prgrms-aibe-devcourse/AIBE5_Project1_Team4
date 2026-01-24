create index if not exists idx_trip_likes_trip_user on public.trip_likes(trip_id, user_id);
create index if not exists idx_trip_bookmarks_trip_user on public.trip_bookmarks(trip_id, user_id);
create index if not exists idx_trip_members_trip_user on public.trip_members(trip_id, user_id);

create index if not exists idx_trip_days_trip_date on public.trip_days(trip_id, date);
create index if not exists idx_schedule_items_day_time on public.schedule_items(day_id, time, order_index);
