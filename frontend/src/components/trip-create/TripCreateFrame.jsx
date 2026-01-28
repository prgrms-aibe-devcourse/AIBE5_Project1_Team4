import MapContainer from "../kakaoMap/MapContainer";

// Layout frame hosting map, search panel, and side panel.
const TripCreateFrame = ({
  isPanelOpen,
  isSearchOpen,
  onOpenPanel,
  onOpenSearch,
  onClosePanel,
  onCloseSearch,
  onMapClick,
  searchPanel,
  sidePanel,
  currentDay,
  searchResults,
  mapCurrentDayPos,
  mapSearchPlacePos,
  selectedLocation,
}) => {
  return (
    <section className="trip-create-map">
      <div
        className={`trip-create-map-inner ${isPanelOpen ? 'is-panel-open' : ''}`}
        onClick={onMapClick}
      >

        {/* 지도 표시 */}
        <div className="trip-map-main-container">
          <MapContainer
              mapCurrentDayPos = {mapCurrentDayPos}
              mapSearchPlacePos = {mapSearchPlacePos}
              drawSimplePath={true}
              selectedLocation={selectedLocation}
          />
        </div>


        <button
          className={`trip-map-btn trip-map-btn-left ${
            isSearchOpen ? '' : 'is-visible'
          }`}
          type="button"
          onClick={onOpenSearch}
          aria-label="검색 열기"
          aria-hidden={isSearchOpen}
          tabIndex={isSearchOpen ? -1 : 0}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </button>
        <button
          className={`trip-map-btn trip-map-btn-right ${
            isPanelOpen ? '' : 'is-visible'
          }`}
          type="button"
          onClick={onOpenPanel}
          aria-label="일정 패널 열기"
          aria-hidden={isPanelOpen}
          tabIndex={isPanelOpen ? -1 : 0}
        >
          <svg
            className="trip-chevron trip-chevron-left"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M16 4l-8 8 8 8" />
          </svg>
        </button>
        {searchPanel}
        {sidePanel({
          isOpen: isPanelOpen,
          onClose: onClosePanel,
        })}
        {isSearchOpen && onCloseSearch && (
          <button
            className="trip-map-overlay"
            type="button"
            onClick={onCloseSearch}
            aria-label="검색 닫기"
          />
        )}
      </div>
    </section>
  );
};

export default TripCreateFrame;
