// Title-level status/actions such as share and member view.
const TripTopActions = ({ onShare, onOpenMembers }) => {
  return (
    <div className="trip-title-actions">
      <span className="trip-title-chip">
        <span className="trip-title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 4h10a2 2 0 0 1 2 2v14l-7-4-7 4V6a2 2 0 0 1 2-2z" />
          </svg>
        </span>
        저장됨
      </span>
      <span className="trip-title-chip">
        <span className="trip-title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" />
          </svg>
        </span>
        공개
      </span>
      <button
        className="trip-title-chip trip-title-chip-button"
        type="button"
        onClick={onOpenMembers}
      >
        <span className="trip-title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="8" cy="8" r="3" />
            <circle cx="16" cy="8" r="3" />
            <path d="M3 20c0-3 3-5 5-5s5 2 5 5" />
            <path d="M11 20c0-2 2-4 5-4s5 2 5 4" />
          </svg>
        </span>
        구성원 보기
      </button>
      <button
        className="trip-title-chip trip-title-chip-button"
        type="button"
        onClick={onShare}
      >
        <span className="trip-title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="6" cy="12" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M8 12l8-6M8 12l8 6" />
          </svg>
        </span>
        공유하기
      </button>
      <button className="trip-title-icon-btn" type="button" aria-label="새 창">
        <svg viewBox="0 0 24 24">
          <path d="M14 3h7v7" />
          <path d="M10 14L21 3" />
          <path d="M5 7v12a2 2 0 0 0 2 2h12" />
        </svg>
      </button>
    </div>
  );
};

export default TripTopActions;
