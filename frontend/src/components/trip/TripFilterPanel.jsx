import { Button } from 'react-bootstrap';

/**
 * [T-4012 ~ T-4014] 통합 필터 패널 컴포넌트
 * HomePage의 MOCK_TRIPS 데이터 구조 및 필터 로직과 연동됩니다.
 */
const TripFilterPanel = ({
  selectedRegion,
  onRegionChange,
  selectedTheme,
  onThemeChange,
  dateFilter,
  onDateChange,
}) => {
  return (
    <div
      className="filter-panel shadow-lg p-4 rounded-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
    >
      {/* 📍 [T-4012] 여행지 필터 섹션: 전체, 제주, 부산, 강릉, 도쿄 등 */}
      <div className="d-flex align-items-center mb-3 justify-content-center">
        <div
          className="text-white-50 small fw-bold me-3"
          style={{ width: '50px' }}
        >
          지역
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['전체', '제주', '부산', '강릉', '도쿄', '뉴욕', '파리'].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={selectedRegion === r ? 'primary' : 'outline-light'}
              className="rounded-pill px-3 py-1 text-decoration-none"
              style={{ fontSize: '0.85rem' }}
              onClick={() => onRegionChange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* 🎨 [T-4013] 테마 필터 섹션: HomePage의 theme 데이터와 동기화 */}
      <div className="d-flex align-items-center mb-3 justify-content-center">
        <div
          className="text-white-50 small fw-bold me-3"
          style={{ width: '50px' }}
        >
          테마
        </div>
        <div
          className="d-flex gap-2 flex-wrap justify-content-center"
          style={{ maxWidth: '600px' }}
        >
          {/* ✅ HomePage 데이터에 존재하는 '미식', '힐링', '관광'을 포함함 */}
          {[
            '전체',
            '미식',
            '힐링',
            '관광',
            '액티비티',
            '쇼핑',
            '가족',
            '사진',
          ].map((t) => (
            <Button
              key={t}
              size="sm"
              variant={selectedTheme === t ? 'primary' : 'secondary'}
              className="rounded-pill px-3 border-0"
              style={{
                fontSize: '0.85rem',
                backgroundColor:
                  selectedTheme === t
                    ? t === '전체'
                      ? '#0d6efd'
                      : '#8b5cf6' // 전체는 파랑, 나머지는 보라 포인트
                    : '#a1a1aa',
              }}
              onClick={() => onThemeChange(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* 📅 [T-4014] 기간 필터 섹션: HomePage의 created_at 필터링 로직과 연동 */}
      <div className="d-flex align-items-center justify-content-center">
        <div
          className="text-white-50 small fw-bold me-3"
          style={{ width: '50px' }}
        >
          기간
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {['전체', '최근 1주', '최근 1달'].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={dateFilter === d ? 'info' : 'outline-light'}
              className="rounded-pill px-3 py-1"
              style={{ fontSize: '0.85rem' }}
              onClick={() => onDateChange(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripFilterPanel;
