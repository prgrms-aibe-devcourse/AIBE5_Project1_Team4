// Place search panel with add-to-day actions.
const TripSearchPanel = ({
  isOpen,
  onClose,
  query,
  results,
  dayLabel,
  onQueryChange,
  onSelectPlace,
}) => {
  return (
    <aside className={`trip-map-search ${isOpen ? 'is-open' : ''}`}>
      <button
        className="trip-search-close"
        type="button"
        onClick={onClose}
        aria-label="검색 닫기"
      >
        <svg
          className="trip-chevron trip-chevron-left"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M16 4l-8 8 8 8" />
        </svg>
      </button>
      <div className="trip-search-header">
        <div className="trip-search-input">
          <span className="trip-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <input
            className="form-control form-control-sm"
            placeholder="장소 검색"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>
      <ul className="trip-search-list">
        {results.map((item, index) => (
          <li key={`${item.name}-${index}`} className="trip-search-item">
            <div>
              <div className="trip-search-title">{item.name}</div>
              <div className="trip-search-meta">
                4.0 <span className="trip-search-stars">★★★★★</span> 405 리뷰
              </div>
            </div>
            {item.selected ? (
              <span className="trip-search-check" aria-label="추가됨">
                ✓
              </span>
            ) : (
              <button
                className="trip-search-add"
                type="button"
                onClick={() => onSelectPlace(item.name)}
              >
                + {dayLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TripSearchPanel;
