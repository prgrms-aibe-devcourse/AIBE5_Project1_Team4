// Place search panel with add-to-day actions.
const TripSearchPanel = ({
  isOpen,
  onClose,
  query,
  results,
  dayLabel,
  onQueryChange,
  onSelectPlace,
  isLoading,
  canLoadMore,
  onLoadMore,
  addingPlaceId,
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

      {/* 스크롤 가능한 결과 영역 */}
      <div className="trip-search-body">
        <ul className="trip-search-list">
          {results.map((item) => {
            const placeId = item.provider_place_id;
            const isThisAdding = addingPlaceId === placeId;

            return (
              <li key={placeId} className="trip-search-item">
                <div>
                  <div className="trip-search-title">{item.name}</div>
                  {(item.road_address || item.address) && (
                    <div className="trip-search-address">
                      {item.road_address || item.address}
                    </div>
                  )}
                  {item.category && (
                    <div className="trip-search-category">{item.category}</div>
                  )}
                </div>
                {item.selected ? (
                  <span className="trip-search-check" aria-label="추가됨">
                    ✓
                  </span>
                ) : (
                  <button
                    className="trip-search-add"
                    type="button"
                    disabled={!!addingPlaceId}
                    onClick={() => onSelectPlace(item)}
                  >
                    {isThisAdding ? '추가 중...' : `+ ${dayLabel}`}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {isLoading && results.length === 0 && (
          <div className="trip-search-status">검색 중...</div>
        )}

        {!isLoading && query?.trim() && results.length === 0 && (
          <div className="trip-search-status">검색 결과가 없습니다.</div>
        )}

        {canLoadMore && (
          <button
            className="trip-search-more"
            type="button"
            disabled={isLoading}
            onClick={onLoadMore}
          >
            {isLoading ? '불러오는 중...' : '더보기'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default TripSearchPanel;
