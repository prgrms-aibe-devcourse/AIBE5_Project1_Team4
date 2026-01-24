import { supabase } from '@/lib/supabaseClient';

// 여행 제목 및 설명 템플릿
const TRIP_TEMPLATES = [
  { title: '제주도 3박 4일 힐링 여행', summary: '제주의 자연을 만끽하는 여유로운 여행', region: 'jeju', themes: ['nature', 'relaxation'] },
  { title: '부산 맛집 투어', summary: '해운대부터 서면까지, 부산 맛집 정복', region: 'busan', themes: ['food-dining', 'city'] },
  { title: '서울 문화 탐방', summary: '경복궁, 북촌, 익선동 골목 여행', region: 'seoul', themes: ['cultural', 'city'] },
  { title: '강원도 액티비티 여행', summary: '스키, 래프팅, 번지점프까지!', region: 'gangwon', themes: ['adventure', 'nature'] },
  { title: '도쿄 쇼핑 & 맛집', summary: '시부야, 하라주쿠, 긴자 쇼핑 투어', region: 'tokyo', themes: ['shopping', 'food-dining'] },
  { title: '오사카 3일 가족여행', summary: '유니버셜 스튜디오와 도톤보리', region: 'osaka', themes: ['city', 'food-dining'] },
  { title: '방콕 자유여행', summary: '왓포, 카오산로드, 짜뚜짝 마켓', region: 'bangkok', themes: ['cultural', 'shopping'] },
  { title: '싱가포르 도심 탐험', summary: '마리나베이, 센토사, 가든스바이더베이', region: 'singapore', themes: ['city', 'nature'] },
  { title: '파리 로맨틱 여행', summary: '에펠탑, 루브르, 몽마르뜨 언덕', region: 'paris', themes: ['cultural', 'city'] },
  { title: '제주 해변 드라이브', summary: '협재, 함덕, 월정리 해변 투어', region: 'jeju', themes: ['beach', 'road-trip'] },
  { title: '서울 카페 투어', summary: '성수동, 연남동, 익선동 핫플', region: 'seoul', themes: ['food-dining', 'city'] },
  { title: '부산 해운대 여름휴가', summary: '해운대 해수욕장에서 즐기는 여름', region: 'busan', themes: ['beach', 'relaxation'] },
  { title: '경기도 당일치기', summary: '파주 아울렛, 헤이리 마을', region: 'gyeonggi', themes: ['shopping', 'cultural'] },
  { title: '도쿄 디즈니 여행', summary: '도쿄 디즈니랜드 & 디즈니씨', region: 'tokyo', themes: ['city', 'adventure'] },
  { title: '강원도 힐링 펜션', summary: '평창 자연 속 힐링 스테이', region: 'gangwon', themes: ['relaxation', 'nature'] },
  { title: '제주 올레길 트레킹', summary: '제주 올레길 7코스 도전', region: 'jeju', themes: ['adventure', 'nature'] },
  { title: '서울 야경 투어', summary: 'N서울타워, 한강, 청계천 야경', region: 'seoul', themes: ['city', 'cultural'] },
  { title: '부산 감천문화마을', summary: '감천문화마을과 자갈치시장', region: 'busan', themes: ['cultural', 'food-dining'] },
  { title: '오사카 먹방 여행', summary: '타코야키, 오코노미야키, 라멘 투어', region: 'osaka', themes: ['food-dining'] },
  { title: '싱가포르 미식 여행', summary: '호커센터, 칠리크랩, 락사', region: 'singapore', themes: ['food-dining', 'cultural'] },
];

// 랜덤 날짜 생성
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 프로필 유저네임 생성
function buildUsername(user) {
  const meta =
    user.user_metadata?.username ||
    user.user_metadata?.user_name ||
    user.user_metadata?.name ||
    null;
  const emailPart = user.email?.split('@')?.[0] ?? null;
  const fallback = `user_${user.id.slice(0, 8)}`;
  const raw = meta || emailPart || fallback;
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 30);
}

// 프로필 생성/확인
async function ensureMyProfile(user) {
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return;

  const username = buildUsername(user);
  const full_name = user.user_metadata?.full_name || user.user_metadata?.name || null;
  const avatar_url = user.user_metadata?.avatar_url || null;

  const { error: upsertErr } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username,
      full_name,
      avatar_url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (upsertErr) throw upsertErr;
}

// 기존 테스트 데이터 삭제
async function clearExistingData(userId) {
  console.log('Clearing existing test data...');

  // 사용자의 좋아요/북마크 삭제
  await supabase.from('trip_likes').delete().eq('user_id', userId);
  await supabase.from('trip_bookmarks').delete().eq('user_id', userId);

  // 사용자가 생성한 여행의 테마/지역 연결 삭제
  const { data: userTrips } = await supabase
    .from('trips')
    .select('id')
    .eq('created_by', userId);

  if (userTrips?.length) {
    const tripIds = userTrips.map((t) => t.id);
    await supabase.from('trip_themes').delete().in('trip_id', tripIds);
    await supabase.from('trip_regions').delete().in('trip_id', tripIds);
    await supabase.from('trip_members').delete().in('trip_id', tripIds);
    await supabase.from('trips').delete().in('id', tripIds);
  }

  console.log('Existing data cleared.');
}

// 여행 데이터 생성
function makeDummyTrip(template, index, userId) {
  const start = randomDate(new Date(2025, 0, 1), new Date(2026, 6, 1));
  const end = new Date(start);
  end.setDate(start.getDate() + Math.floor(Math.random() * 5) + 2);

  // 제목에 번호 추가 (중복 방지)
  const titleWithIndex = `${template.title} #${index + 1}`;

  return {
    title: titleWithIndex,
    summary: template.summary,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    cover_image_url: null,
    visibility: 'public',
    created_by: userId,
    // 메타데이터 (DB에는 저장 안함, 연결 테이블용)
    _region: template.region,
    _themes: template.themes,
  };
}

/**
 * 테스트 데이터 시드
 * @param {number} count - 생성할 여행 수 (기본 30개)
 */
export async function seedDummyTrips(count = 30) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    alert('먼저 로그인하세요!');
    throw new Error('Not logged in');
  }

  console.log('Seeding test data as user:', user.id);

  // 프로필 보장
  await ensureMyProfile(user);

  // 기존 데이터 삭제
  await clearExistingData(user.id);

  // themes, regions 조회
  const { data: themes } = await supabase.from('themes').select('id, slug');
  const { data: regions } = await supabase.from('regions').select('id, slug');

  const themeMap = Object.fromEntries(themes?.map((t) => [t.slug, t.id]) || []);
  const regionMap = Object.fromEntries(regions?.map((r) => [r.slug, r.id]) || []);

  // 여행 데이터 생성
  const tripsToInsert = [];
  for (let i = 0; i < count; i++) {
    const templateIndex = i % TRIP_TEMPLATES.length;
    const template = TRIP_TEMPLATES[templateIndex];
    tripsToInsert.push(makeDummyTrip(template, i, user.id));
  }

  // trips insert
  const { data: insertedTrips, error: insertError } = await supabase
    .from('trips')
    .insert(tripsToInsert.map(({ _region, _themes, ...trip }) => trip))
    .select('id');

  if (insertError) {
    console.error('Insert trips failed:', insertError);
    throw insertError;
  }

  console.log(`Created ${insertedTrips.length} trips`);

  // trip_themes 연결
  const tripThemesToInsert = [];
  insertedTrips.forEach((trip, idx) => {
    const template = tripsToInsert[idx];
    template._themes.forEach((themeSlug) => {
      if (themeMap[themeSlug]) {
        tripThemesToInsert.push({
          trip_id: trip.id,
          theme_id: themeMap[themeSlug],
        });
      }
    });
  });

  if (tripThemesToInsert.length) {
    const { error: themeError } = await supabase
      .from('trip_themes')
      .insert(tripThemesToInsert);
    if (themeError) console.error('Insert trip_themes failed:', themeError);
    else console.log(`Created ${tripThemesToInsert.length} trip-theme connections`);
  }

  // trip_regions 연결
  const tripRegionsToInsert = [];
  insertedTrips.forEach((trip, idx) => {
    const template = tripsToInsert[idx];
    if (regionMap[template._region]) {
      tripRegionsToInsert.push({
        trip_id: trip.id,
        region_id: regionMap[template._region],
      });
    }
  });

  if (tripRegionsToInsert.length) {
    const { error: regionError } = await supabase
      .from('trip_regions')
      .insert(tripRegionsToInsert);
    if (regionError) console.error('Insert trip_regions failed:', regionError);
    else console.log(`Created ${tripRegionsToInsert.length} trip-region connections`);
  }

  // trip_likes 생성 (랜덤하게 일부 여행에 좋아요)
  const likesToInsert = [];
  insertedTrips.forEach((trip) => {
    // 50% 확률로 좋아요
    if (Math.random() > 0.5) {
      likesToInsert.push({
        trip_id: trip.id,
        user_id: user.id,
      });
    }
  });

  if (likesToInsert.length) {
    const { error: likeError } = await supabase
      .from('trip_likes')
      .insert(likesToInsert);
    if (likeError) console.error('Insert trip_likes failed:', likeError);
    else console.log(`Created ${likesToInsert.length} likes`);
  }

  // trip_bookmarks 생성 (랜덤하게 일부 여행에 북마크)
  const bookmarksToInsert = [];
  insertedTrips.forEach((trip) => {
    // 30% 확률로 북마크
    if (Math.random() > 0.7) {
      bookmarksToInsert.push({
        trip_id: trip.id,
        user_id: user.id,
      });
    }
  });

  if (bookmarksToInsert.length) {
    const { error: bookmarkError } = await supabase
      .from('trip_bookmarks')
      .insert(bookmarksToInsert);
    if (bookmarkError) console.error('Insert trip_bookmarks failed:', bookmarkError);
    else console.log(`Created ${bookmarksToInsert.length} bookmarks`);
  }

  const summary = `
테스트 데이터 생성 완료!
- 여행: ${insertedTrips.length}개
- 테마 연결: ${tripThemesToInsert.length}개
- 지역 연결: ${tripRegionsToInsert.length}개
- 좋아요: ${likesToInsert.length}개
- 북마크: ${bookmarksToInsert.length}개
  `.trim();

  console.log(summary);
  alert(summary);

  return {
    trips: insertedTrips.length,
    themes: tripThemesToInsert.length,
    regions: tripRegionsToInsert.length,
    likes: likesToInsert.length,
    bookmarks: bookmarksToInsert.length,
  };
}

// 개발자 콘솔에서 쉽게 호출할 수 있도록 window에 노출
if (typeof window !== 'undefined') {
  window.seedDummyTrips = seedDummyTrips;
}
