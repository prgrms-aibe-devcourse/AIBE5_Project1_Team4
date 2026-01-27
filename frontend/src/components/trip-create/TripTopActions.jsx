// Title-level status/actions such as share and member view.
const TripTopActions = ({
  onShare,
  onOpenMembers,
  onToggleVisibility,
  isPublic,
  onSave,
  saveLabel,
  onDelete,
}) => {
  return (
    <div className="trip-title-actions">
      <button
        className="trip-title-chip trip-title-chip-button"
        type="button"
        onClick={onToggleVisibility}
        aria-pressed={isPublic}
      >
        <span className="trip-title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            {isPublic ? (
              <path d="M9 10V7a3 3 0 0 1 6 0" />
            ) : (
              <path d="M8 10V7a4 4 0 1 1 8 0v3" />
            )}
          </svg>
        </span>
        {isPublic ? '공개' : '비공개'}
      </button>
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
      <button
        className="trip-title-chip trip-title-chip-button"
        type="button"
        onClick={onSave}
      >
        <span className="trip-title-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 4h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M7 4v6h8V4" />
            <path d="M7 18h10" />
          </svg>
        </span>
        {saveLabel}
      </button>
      <button
        className="trip-title-icon-btn trip-title-icon-danger"
        type="button"
        aria-label="여행 삭제"
        onClick={onDelete}
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M6 6l1 14h10l1-14" />
        </svg>
      </button>
    </div>
  );
};

export default TripTopActions;
