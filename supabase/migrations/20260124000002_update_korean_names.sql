-- Update regions to Korean names
UPDATE regions SET name = '서울' WHERE slug = 'seoul';
UPDATE regions SET name = '부산' WHERE slug = 'busan';
UPDATE regions SET name = '제주' WHERE slug = 'jeju';
UPDATE regions SET name = '경기' WHERE slug = 'gyeonggi';
UPDATE regions SET name = '강원' WHERE slug = 'gangwon';
UPDATE regions SET name = '도쿄' WHERE slug = 'tokyo';
UPDATE regions SET name = '오사카' WHERE slug = 'osaka';
UPDATE regions SET name = '방콕' WHERE slug = 'bangkok';
UPDATE regions SET name = '싱가포르' WHERE slug = 'singapore';
UPDATE regions SET name = '파리' WHERE slug = 'paris';

-- Add missing regions
INSERT INTO regions (name, slug, country_code) VALUES
  ('뉴욕', 'new-york', 'US')
ON CONFLICT (slug) DO NOTHING;

-- Update themes to Korean names
UPDATE themes SET name = '액티비티' WHERE slug = 'adventure';
UPDATE themes SET name = '해변' WHERE slug = 'beach';
UPDATE themes SET name = '도시' WHERE slug = 'city';
UPDATE themes SET name = '문화' WHERE slug = 'cultural';
UPDATE themes SET name = '미식' WHERE slug = 'food-dining';
UPDATE themes SET name = '자연' WHERE slug = 'nature';
UPDATE themes SET name = '힐링' WHERE slug = 'relaxation';
UPDATE themes SET name = '드라이브' WHERE slug = 'road-trip';
UPDATE themes SET name = '쇼핑' WHERE slug = 'shopping';
UPDATE themes SET name = '야생동물' WHERE slug = 'wildlife';

-- Add missing themes for filter panel
INSERT INTO themes (name, slug, icon) VALUES
  ('관광', 'sightseeing', '📸'),
  ('가족', 'family', '👨‍👩‍👧‍👦'),
  ('사진', 'photography', '📷')
ON CONFLICT (slug) DO NOTHING;
