import { supabase } from '@/lib/supabaseClient';
import { unwrap } from './_core/errors';

const CONTEXT = 'profilesService';

/**
 * @param {{
 *  id: string,
 *  username: string,
 *  full_name: string|null,
 *  avatar_url: string|null,
 *  updated_at?: string
 * }} payload
 */
export async function upsertProfile(payload) {
  const row = {
    ...payload,
    updated_at: payload.updated_at ?? new Date().toISOString(),
  };

  const result = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' });

  if (result.error) {
    unwrap(result, `${CONTEXT}.upsertProfile`);
  }
}
