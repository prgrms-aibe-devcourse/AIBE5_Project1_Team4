import TripDayNavigation from './TripDayNavigation';
import TripMemberPicker from './TripMemberPicker';
import TripScheduleEditor from './TripScheduleEditor';

// Right-side panel for schedule and member views.
const TripSidePanel = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  dayNavProps,
  scheduleProps,
  memberProps,
}) => {
  return (
    <aside className={`trip-map-panel ${isOpen ? 'is-open' : ''}`}>
      <button
        className="trip-panel-close"
        type="button"
        onClick={onClose}
        aria-label="일정 패널 닫기"
      >
        <svg
          className="trip-chevron trip-chevron-right"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 4l8 8-8 8" />
        </svg>
      </button>
      <div className="trip-panel-tabs">
        <button
          className={`trip-panel-tab ${
            activeTab === 'schedule' ? 'trip-panel-tab-active' : ''
          }`}
          type="button"
          onClick={() => onChangeTab('schedule')}
        >
          <span className="trip-panel-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 9h18" />
            </svg>
          </span>
          일정
        </button>
        <button
          className={`trip-panel-tab ${
            activeTab === 'members' ? 'trip-panel-tab-active' : ''
          }`}
          type="button"
          onClick={() => onChangeTab('members')}
        >
          <span className="trip-panel-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="8" cy="8" r="3" />
              <circle cx="16" cy="8" r="3" />
              <path d="M3 20c0-3 3-5 5-5s5 2 5 5" />
              <path d="M11 20c0-2 2-4 5-4s5 2 5 4" />
            </svg>
          </span>
          멤버
        </button>
      </div>
      {activeTab === 'schedule' && (
        <>
          <TripDayNavigation {...dayNavProps} />
          <TripScheduleEditor {...scheduleProps} />
        </>
      )}
      {activeTab === 'members' && <TripMemberPicker {...memberProps} />}
    </aside>
  );
};

export default TripSidePanel;
