create or replace function public.bump_version()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.version := old.version + 1;
  return new;
end;
$$;

drop trigger if exists trg_trips_bump_version on public.trips;
create trigger trg_trips_bump_version
before update on public.trips
for each row execute function public.bump_version();

drop trigger if exists trg_trip_days_bump_version on public.trip_days;
create trigger trg_trip_days_bump_version
before update on public.trip_days
for each row execute function public.bump_version();
