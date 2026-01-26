create or replace function public.update_trip_meta(
  p_trip_id uuid,
  p_title text default null,
  p_summary text default null,
  p_visibility text default null
)
returns table (trip_id uuid)
language plpgsql
security definer
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;

  perform public.assert_trip_editor(p_trip_id);

  if p_title is not null and char_length(trim(p_title)) = 0 then
    raise exception 'INVALID_TITLE';
  end if;

  if p_visibility is not null and p_visibility not in ('public','unlisted','private') then
    raise exception 'INVALID_VISIBILITY';
  end if;

  update public.trips
     set title = coalesce(p_title, title),
         summary = coalesce(p_summary, summary),
         visibility = coalesce(p_visibility, visibility),
         updated_by = v_uid
   where id = p_trip_id;

  trip_id := p_trip_id;
  return next;
end;
$$;

grant execute on function public.update_trip_meta(uuid, text, text, text) to authenticated;
