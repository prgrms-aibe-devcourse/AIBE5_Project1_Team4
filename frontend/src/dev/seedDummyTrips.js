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

// 각 지역별 목 장소 데이터 (schedule_items 생성 시 참조)
const PLACES_BY_REGION = {
  jeju: [
    { name: '협재 해수욕장', category: '해변', address: '제주시 한림읍 협재리', latitude: 33.3938, longitude: 126.2318 },
    { name: '함덕 해수욕장', category: '해변', address: '제주시 구좌읍 함덕리', latitude: 33.4644, longitude: 126.6354 },
    { name: '성산일출봉', category: '자연', address: '서귀포시 성산읍 성산리', latitude: 33.4608, longitude: 126.9424 },
  ],
  busan: [
    { name: '해운대 해수욕장', category: '해변', address: '부산시 해운대구 해변로', latitude: 35.1596, longitude: 129.1603 },
    { name: '감천문화마을', category: '문화', address: '부산시 사하구 감내로 34', latitude: 35.0804, longitude: 128.9822 },
    { name: '자갈치시장', category: '시장', address: '부산시 중구 자갈치해변로 52', latitude: 35.0970, longitude: 129.0740 },
  ],
  seoul: [
    { name: '경복궁', category: '문화유산', address: '서울시 종로구 삼청로 37', latitude: 37.5797, longitude: 126.9770 },
    { name: '북촌 한옥마을', category: '문화', address: '서울시 종로구 계동 일대', latitude: 37.5830, longitude: 126.9850 },
    { name: '청계천', category: '자연', address: '서울시 중구 청계천로 일대', latitude: 37.5700, longitude: 127.0090 },
  ],
  gangwon: [
    { name: '평창 스키장', category: '스포츠', address: '강원도 평창군 대관령면', latitude: 37.1101, longitude: 127.1089 },
    { name: '남이섬', category: '자연', address: '강원도 춘천시 남산면', latitude: 37.7734, longitude: 127.1169 },
    { name: '강릉 경포대', category: '자연', address: '강원도 강릉시 경포로', latitude: 37.7611, longitude: 128.8999 },
  ],
  tokyo: [
    { name: '시부야 교차로', category: '거리', address: '도쿄도 시부야구 도겐자카', latitude: 35.6595, longitude: 139.7004 },
    { name: '하라주쿠', category: '쇼핑', address: '도쿄도 시부야구 하라주쿠', latitude: 35.6654, longitude: 139.7020 },
    { name: '긴자', category: '쇼핑', address: '도쿄도 주오구 긴자', latitude: 35.6730, longitude: 139.7669 },
  ],
  osaka: [
    { name: '도톤보리', category: '거리', address: '오사카부 오사카시 주오구 도톤보리', latitude: 34.6697, longitude: 135.5025 },
    { name: '유니버셜 스튜디오 재팬', category: '테마파크', address: '오사카부 오사카시 기타구 유리메', latitude: 34.6654, longitude: 135.4330 },
    { name: '오사카 성', category: '문화유산', address: '오사카부 오사카시 주오구 오사카죠 1-1', latitude: 34.6872, longitude: 135.5261 },
  ],
  bangkok: [
    { name: '왓포', category: '사원', address: '방콕 프라나콘 구', latitude: 13.6461, longitude: 100.4917 },
    { name: '카오산로드', category: '거리', address: '방콕 방글라목 구', latitude: 13.7633, longitude: 100.4932 },
    { name: '짜뚜짝 마켓', category: '시장', address: '방콕 타라그', latitude: 13.7339, longitude: 100.5731 },
  ],
  singapore: [
    { name: '마리나베이', category: '자연', address: '싱가포르 마리나베이', latitude: 1.2867, longitude: 103.8633 },
    { name: '센토사 섬', category: '관광', address: '싱가포르 센토사 섬', latitude: 1.2497, longitude: 103.8303 },
    { name: '가든스바이더베이', category: '정원', address: '싱가포르 가든스바이더베이', latitude: 1.2829, longitude: 103.8643 },
  ],
  paris: [
    { name: '에펠탑', category: '관광', address: '파리 전쟁광장', latitude: 48.8584, longitude: 2.2945 },
    { name: '루브르 박물관', category: '박물관', address: '파리 루브르 광장', latitude: 48.8606, longitude: 2.3376 },
    { name: '몽마르뜨 언덕', category: '거리', address: '파리 몽마르뜨', latitude: 48.8867, longitude: 2.3431 },
  ],
};

// 일정 생성에 사용할 시간 템플릿
const SCHEDULE_TIMES = [
  { time: '09:00', duration: 120, notes: '아침 관광' },
  { time: '12:00', duration: 60, notes: '점심' },
  { time: '14:00', duration: 90, notes: '오후 관광' },
  { time: '18:00', duration: 120, notes: '저녁 활동' },
];

// 랜덤 날짜 생성
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 간단한 커버 이미지 URL 생성 (picsum seed 기반, 인덱스로 고정 시드)
function generateCoverImageUrl(template, index) {
  const seed = `trip-${template.region}-${index}`;
  return `https://picsum.photos/seed/${seed}/800/400`;
}

// 장소가 없으면 places 테이블에 생성, 있으면 id 재사용
async function ensurePlace(placeName, placeData) {
  const { data: existing } = await supabase
    .from('places')
    .select('id')
    .eq('name', placeName)
    .eq('provider', 'manual')
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: newPlace, error } = await supabase
    .from('places')
    .insert({
      provider: 'manual',
      provider_place_id: `manual_${placeName}`,
      name: placeName,
      category: placeData.category,
      address: placeData.address,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      raw_data: { keywords: [placeData.category] },
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Failed to create place ${placeName}:`, error);
    return null;
  }

  return newPlace.id;
}

// 여행 기간에 맞춰 trip_days와 schedule_items를 함께 생성
async function createTripSchedule(tripId, startDate, endDate, placeIds, userId) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let daysCreated = 0;

  // trip_days 생성 및 schedule_items 추가
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    
    const { data: tripDay, error: dayError } = await supabase
      .from('trip_days')
      .insert({
        trip_id: tripId,
        date: dateStr,
        updated_by: userId,
      })
      .select('id')
      .single();

    if (dayError) {
      console.error(`Failed to create trip_day:`, dayError);
      continue;
    }

    daysCreated++;

    // 각 day에 2-3개의 schedule_items 생성
    const itemCount = Math.floor(Math.random() * 2) + 2; // 하루 2~3개 활동
    for (let i = 0; i < itemCount; i++) {
      const schedule = SCHEDULE_TIMES[i % SCHEDULE_TIMES.length];
      const placeId = placeIds[Math.floor(Math.random() * placeIds.length)];

      const { error: itemError } = await supabase
        .from('schedule_items')
        .insert({
          trip_day_id: tripDay.id,
          place_id: placeId,
          time: schedule.time,
          duration_minutes: schedule.duration,
          notes: schedule.notes,
          order_index: i,
          updated_by: userId,
        });

      if (itemError) {
        console.error(`Failed to create schedule_item:`, itemError);
      }
    }
  }

  return daysCreated;
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

  // 사용자가 생성한 여행 조회
  const { data: userTrips } = await supabase
    .from('trips')
    .select('id')
    .eq('created_by', userId);

  if (userTrips?.length) {
    const tripIds = userTrips.map((t) => t.id);

    // trip_days 조회
    const { data: tripDayRecords } = await supabase
      .from('trip_days')
      .select('id')
      .in('trip_id', tripIds);

    if (tripDayRecords?.length) {
      const tripDayIds = tripDayRecords.map((td) => td.id);
      // schedule_items 삭제
      await supabase.from('schedule_items').delete().in('trip_day_id', tripDayIds);
    }

    // trip_days 삭제
    await supabase.from('trip_days').delete().in('trip_id', tripIds);
    // 기타 관계 테이블 삭제
    await supabase.from('trip_themes').delete().in('trip_id', tripIds);
    await supabase.from('trip_regions').delete().in('trip_id', tripIds);
    await supabase.from('trip_members').delete().in('trip_id', tripIds);
    // trips 삭제
    await supabase.from('trips').delete().in('id', tripIds);
  }

  // 사용자의 좋아요/북마크 삭제
  await supabase.from('trip_likes').delete().eq('user_id', userId);
  await supabase.from('trip_bookmarks').delete().eq('user_id', userId);

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
    cover_image_url: generateCoverImageUrl(template, index),
    visibility: 'public',
    created_by: userId,
    // 메타데이터 (DB에는 저장 안함, 연결 테이블용)
    _region: template.region,
    _themes: template.themes,
  };
}

/**
 * 테스트 데이터 시드 (Trip + Day + Schedule Items 포함)
 * @param {number} count - 생성할 여행 수 (기본 10개)
 */
export async function seedDummyTrips(count = 10) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    alert('먼저 로그인하세요!');
    throw new Error('Not logged in');
  }

  console.log('🌍 Seeding test data as user:', user.id);

  try {
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
      .select('id, start_date, end_date');

    if (insertError) {
      console.error('❌ Insert trips failed:', insertError);
      throw insertError;
    }

    console.log(`✅ Created ${insertedTrips.length} trips`);

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
      else console.log(`✅ Created ${tripThemesToInsert.length} trip-theme connections`);
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
      else console.log(`✅ Created ${tripRegionsToInsert.length} trip-region connections`);
    }

    // trip_members 추가 (생성자를 owner로)
    const tripMembersToInsert = insertedTrips.map((trip) => ({
      trip_id: trip.id,
      user_id: user.id,
      role: 'owner',
    }));

    if (tripMembersToInsert.length) {
      const { error: memberError } = await supabase
        .from('trip_members')
        .insert(tripMembersToInsert);
      if (memberError) console.error('Insert trip_members failed:', memberError);
      else console.log(`✅ Created ${tripMembersToInsert.length} trip members`);
    }

    // Trip Days 및 Schedule Items 생성
    let totalDaysCreated = 0;
    let totalScheduleItems = 0;

    for (let idx = 0; idx < insertedTrips.length; idx++) {
      const trip = insertedTrips[idx];
      const template = tripsToInsert[idx];
      const regionKey = template._region;
      const regionPlaces = PLACES_BY_REGION[regionKey];

      if (!regionPlaces || regionPlaces.length === 0) {
        console.warn(`⚠️ No places found for region: ${regionKey}`);
        continue;
      }

      // 장소들 생성/조회
      const placeIds = [];
      for (const placeData of regionPlaces) {
        const placeId = await ensurePlace(placeData.name, placeData);
        if (placeId) {
          placeIds.push(placeId);
        }
      }

      if (placeIds.length === 0) {
        console.warn(`⚠️ Failed to create places for region: ${regionKey}`);
        continue;
      }

      // schedule 생성
      const daysCreated = await createTripSchedule(
        trip.id,
        trip.start_date,
        trip.end_date,
        placeIds,
        user.id
      );

      totalDaysCreated += daysCreated;
      totalScheduleItems += daysCreated * 2;
    }

    console.log(`✅ Created ${totalDaysCreated} trip days`);
    console.log(`✅ Created ${totalScheduleItems} schedule items`);

    // trip_likes 생성 (50% 확률)
    const likesToInsert = [];
    insertedTrips.forEach((trip) => {
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
      else console.log(`✅ Created ${likesToInsert.length} likes`);
    }

    // trip_bookmarks 생성 (30% 확률)
    const bookmarksToInsert = [];
    insertedTrips.forEach((trip) => {
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
      else console.log(`✅ Created ${bookmarksToInsert.length} bookmarks`);
    }

    const summary = `
✅ 테스트 데이터 생성 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 여행:         ${insertedTrips.length}개
🏷️  테마 연결:    ${tripThemesToInsert.length}개
🌏 지역 연결:    ${tripRegionsToInsert.length}개
👥 멤버:         ${tripMembersToInsert.length}개
📅 일정(Day):    ${totalDaysCreated}개
📍 스케줄 항목:  ${totalScheduleItems}개
👍 좋아요:       ${likesToInsert.length}개
🔖 북마크:       ${bookmarksToInsert.length}개
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    console.log(summary);
    alert(summary);

    return {
      trips: insertedTrips.length,
      themes: tripThemesToInsert.length,
      regions: tripRegionsToInsert.length,
      members: tripMembersToInsert.length,
      days: totalDaysCreated,
      scheduleItems: totalScheduleItems,
      likes: likesToInsert.length,
      bookmarks: bookmarksToInsert.length,
    };
  } catch (error) {
    console.error('❌ Seed failed:', error);
    alert(`❌ 에러: ${error.message}`);
    throw error;
  }
}

// 개발자 콘솔에서 쉽게 호출할 수 있도록 window에 노출
if (typeof window !== 'undefined') {
  window.seedDummyTrips = seedDummyTrips;
}
