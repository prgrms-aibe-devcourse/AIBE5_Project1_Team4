import { supabase } from '@/lib/supabaseClient';

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function makeDummyTrip(i, userId) {
  const start = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 1));
  const end = new Date(start);
  end.setDate(start.getDate() + Math.floor(Math.random() * 5) + 1);

  return {
    title: `테스트 여행 ${i + 1}`,
    summary: `더미 여행 일정 ${i + 1} 번입니다.`,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    cover_image_url: null,
    visibility: 'public',
    created_by: userId,
  };
}

function buildUsername(user) {
  // profiles.username은 NOT NULL 이니까 무조건 채워야 함
  // 1) 메타데이터
  const meta =
    user.user_metadata?.username ||
    user.user_metadata?.user_name ||
    user.user_metadata?.name ||
    null;

  // 2) 이메일 앞부분
  const emailPart = user.email?.split('@')?.[0] ?? null;

  // 3) fallback: user id 일부
  const fallback = `user_${user.id.slice(0, 8)}`;

  // username 제약(길이/문자) 있을 수 있어서 안전하게 정제
  const raw = meta || emailPart || fallback;
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 30);
}

async function ensureMyProfile(user) {
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return;

  const username = buildUsername(user);
  const full_name =
    user.user_metadata?.full_name || user.user_metadata?.name || null;
  const avatar_url = user.user_metadata?.avatar_url || null;

  const { error: upsertErr } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username,
      full_name,
      avatar_url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (upsertErr) throw upsertErr;
}

export async function seedDummyTrips(count = 20) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    alert('먼저 로그인하세요!');
    throw new Error('Not logged in');
  }

  console.log('Seeding dummy trips as user:', user.id);

  // ✅ profiles 보장 (id + username)
  await ensureMyProfile(user);

  // trips insert
  const tripsToInsert = Array.from({ length: count }, (_, i) =>
    makeDummyTrip(i, user.id),
  );

  const { data: trips, error: insertError } = await supabase
    .from('trips')
    .insert(tripsToInsert)
    .select('id');

  if (insertError) {
    console.error('Insert trips failed:', insertError);
    throw insertError;
  }

  // trip_members insert (owner)
  const membersToInsert = (trips ?? []).map((t) => ({
    trip_id: t.id,
    user_id: user.id,
    role: 'owner',
  }));

  const { error: memberError } = await supabase
    .from('trip_members')
    .upsert(membersToInsert, { onConflict: 'trip_id,user_id' });

  if (memberError) {
    console.error('Insert trip_members failed:', memberError);
    throw memberError;
  }

  alert(`더미 여행 ${count}개 생성 완료!`);
}
