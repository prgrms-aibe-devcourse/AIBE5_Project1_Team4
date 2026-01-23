import { supabase } from '@/lib/supabaseClient';

/**
 * @param {{
 *  id: string,
 *  email: string|null,
 *  display_name: string|null,
 *  avatar_url: string|null,
 *  updated_at?: string
 * }} payload
 */
export async function upsertProfile(payload) {
  const row = {
    ...payload,
    updated_at: payload.updated_at ?? new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' });

  if (error) throw error;
}
