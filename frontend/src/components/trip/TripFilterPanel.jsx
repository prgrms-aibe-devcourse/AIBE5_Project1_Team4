import { Button } from 'react-bootstrap';

/**
 * 통합 필터 패널 컴포넌트
 * - 지역/테마 필터는 DB에서 로드 (여행 수 많은 순)
 */
const MAX_VISIBLE_REGIONS = 7;
const MAX_VISIBLE_THEMES = 8;

const TripFilterPanel = ({
  selectedRegion,
  onRegionChange,
  selectedTheme,
  onThemeChange,
  dateFilter,
  onDateChange,
  regions = [],
  themes = [],
}) => {
  // 여행 수가 1개 이상인 것만, 상위 N개만 표시
  const activeRegions = regions.filter((r) => r.count > 0).slice(0, MAX_VISIBLE_REGIONS);
  const activeThemes = themes.filter((t) => t.count > 0).slice(0, MAX_VISIBLE_THEMES);

  return (
    <div
      className="filter-panel shadow-lg p-4 rounded-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
    >
      {/* 지역 필터 */}
      <div className="d-flex align-items-center mb-3 justify-content-center">
        <div
          className="text-white-50 small fw-bold me-3"
          style={{ width: '50px' }}
        >
          지역
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={selectedRegion === '전체' ? 'primary' : 'outline-light'}
            className="rounded-pill px-3 py-1"
            style={{ fontSize: '0.85rem' }}
            onClick={() => onRegionChange('전체')}
          >
            전체
          </Button>
          {activeRegions.map((r) => (
            <Button
              key={r.slug}
              size="sm"
              variant={selectedRegion === r.name ? 'primary' : 'outline-light'}
              className="rounded-pill px-3 py-1"
              style={{ fontSize: '0.85rem' }}
              onClick={() => onRegionChange(r.name)}
            >
              {r.name} ({r.count})
            </Button>
          ))}
        </div>
      </div>

      {/* 테마 필터 */}
      <div className="d-flex align-items-center mb-3 justify-content-center">
        <div
          className="text-white-50 small fw-bold me-3"
          style={{ width: '50px' }}
        >
          테마
        </div>
        <div
          className="d-flex gap-2 flex-wrap justify-content-center"
          style={{ maxWidth: '700px' }}
        >
          <Button
            size="sm"
            variant={selectedTheme === '전체' ? 'primary' : 'secondary'}
            className="rounded-pill px-3 border-0"
            style={{ fontSize: '0.85rem' }}
            onClick={() => onThemeChange('전체')}
          >
            전체
          </Button>
          {activeThemes.map((t) => (
            <Button
              key={t.slug}
              size="sm"
              variant={selectedTheme === t.name ? 'primary' : 'secondary'}
              className="rounded-pill px-3 border-0"
              style={{
                fontSize: '0.85rem',
                backgroundColor:
                  selectedTheme === t.name ? '#8b5cf6' : '#a1a1aa',
              }}
              onClick={() => onThemeChange(t.name)}
            >
              {t.name} ({t.count})
            </Button>
          ))}
        </div>
      </div>

      {/* 기간 필터 */}
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
