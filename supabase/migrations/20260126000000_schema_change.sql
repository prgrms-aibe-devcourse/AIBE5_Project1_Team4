alter table public.trips
  add column if not exists version bigint not null default 1;

alter table public.trip_days
  add column if not exists version bigint not null default 1;
