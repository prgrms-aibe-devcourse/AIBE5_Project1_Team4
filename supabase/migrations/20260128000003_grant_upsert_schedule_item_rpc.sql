revoke all on function public.upsert_schedule_item(uuid, uuid, uuid, time, integer, text) from public;
grant execute on function public.upsert_schedule_item(uuid, uuid, uuid, time, integer, text) to authenticated;

revoke all on function public.rpc_upsert_trip_member(uuid,uuid,text) from public;
grant execute on function public.rpc_upsert_trip_member(uuid,uuid,text) to authenticated;

revoke all on function public.rpc_update_place_name(uuid, text) from public;
grant execute on function public.rpc_update_place_name(uuid, text) to authenticated;
