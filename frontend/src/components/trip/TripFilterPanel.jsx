import { MapPin, Hash, CalendarDays } from 'lucide-react';

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
  const activeRegions = regions.filter((r) => r.count > 0).slice(0, MAX_VISIBLE_REGIONS);
  const activeThemes = themes.filter((t) => t.count > 0).slice(0, MAX_VISIBLE_THEMES);

  const getChipStyle = (isSelected) => ({
    padding: '7px 15px', 
    borderRadius: '50px',
    fontSize: '0.95rem', 
    fontWeight: isSelected ? 600 : 500,
    border: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: isSelected ? '#0061ff' : '#f1f5f9',
    color: isSelected ? '#fff' : '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  });

  const sectionStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '22px',
    marginBottom: '14px' 
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    minWidth: '105px', 
    paddingTop: '6px', 
    color: '#334155', 
    fontWeight: 700,
    fontSize: '0.95rem' 
  };

  return (
    <div
      className="filter-panel"
      style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '24px 28px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {/* 1. 지역 필터 */}
      <div style={sectionStyle}>
        <div style={labelStyle}>
          <MapPin size={17} className="text-primary" /> 지역
        </div>
        <div className="d-flex flex-wrap gap-2" style={{ flex: 1 }}>
          <button type="button" style={getChipStyle(selectedRegion === '전체')} onClick={() => onRegionChange('전체')}>전체</button>
          {activeRegions.map((r) => (
            <button key={r.slug} type="button" style={getChipStyle(selectedRegion === r.name)} onClick={() => onRegionChange(r.name)}>
              {r.name} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>({r.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. 테마 필터 */}
      <div style={sectionStyle}>
        <div style={labelStyle}>
          <Hash size={17} style={{ color: '#8b5cf6' }} /> 테마
        </div>
        <div className="d-flex flex-wrap gap-2" style={{ flex: 1 }}>
          <button type="button" style={getChipStyle(selectedTheme === '전체')} onClick={() => onThemeChange('전체')}>전체</button>
          {activeThemes.map((t) => (
            <button key={t.slug} type="button" style={getChipStyle(selectedTheme === t.name)} onClick={() => onThemeChange(t.name)}>
              {t.name} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 기간 필터 */}
      <div style={{ ...sectionStyle, marginBottom: 0 }}>
        <div style={labelStyle}>
          <CalendarDays size={17} style={{ color: '#10b981' }} /> 일정
        </div>
        <div className="d-flex flex-wrap gap-2" style={{ flex: 1 }}>
          {['전체', '최근 1주', '최근 1달'].map((d) => (
            <button key={d} type="button" style={getChipStyle(dateFilter === d)} onClick={() => onDateChange(d)}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripFilterPanel;