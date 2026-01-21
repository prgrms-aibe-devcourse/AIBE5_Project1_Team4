import { supabase } from '@/lib/supabaseClient';
import { unwrap } from './errors';

/**
 * 파일 업로드 (기본 upsert=false)
 */
export async function uploadFile(bucket, path, file, options = {}) {
  const res = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    ...options,
  });

  return unwrap(res, `storage.upload:${bucket}/${path}`);
}

/**
 * public URL 가져오기 (버킷이 public일 때)
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/**
 * 파일 삭제
 */
export async function removeFiles(bucket, paths) {
  const res = await supabase.storage.from(bucket).remove(paths);
  return unwrap(res, `storage.remove:${bucket}`);
}

/**
 * 폴더 목록
 */
export async function listFiles(bucket, prefix, options = {}) {
  const res = await supabase.storage.from(bucket).list(prefix, options);
  return unwrap(res, `storage.list:${bucket}/${prefix}`);
}
