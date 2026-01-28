import { formatDateDot } from '@/utils/date';
import { Delete, Trash } from 'lucide-react';

// Day navigation and calendar for schedule panel.
const TripDayNavigation = ({
  currentDay,
  todayString,
  isCalendarOpen,
  calendarInfo,
  onPrevDay,
  onNextDay,
  onAddDay,
  onDeleteDay,
  isDeletingDay,
  onToggleCalendar,
  onShiftCalendarMonth,
  onSelectDate,
}) => {
  return (
    <>
      <div className="trip-panel-day-row">
        <button
          className="trip-panel-day-nav"
          type="button"
          onClick={onPrevDay}
          aria-label="이전 날짜"
        >
          &#8249;
        </button>
        <span className="trip-panel-day-title">{currentDay.label}</span>
        <button
          className="trip-panel-day-nav"
          type="button"
          onClick={onNextDay}
          aria-label="다음 날짜"
        >
          &#8250;
        </button>
        <div className="trip-panel-day-actions">
          <button
            className="trip-panel-icon-btn"
            type="button"
            aria-label="일차 추가"
            onClick={onAddDay}
          >
            +
          </button>

          <button
            className="trip-panel-icon-btn trip-panel-icon-btn-danger"
            type="button"
            aria-label="일차 삭제"
            disabled={isDeletingDay}
            onClick={onDeleteDay}
          >
            &#128465;
          </button>
        </div>
      </div>
      <div className="trip-panel-date-row">
        <div
          className="trip-panel-date-button"
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            onToggleCalendar();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onToggleCalendar();
            }
          }}
        >
          <span className="trip-panel-date-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 9h18" />
            </svg>
          </span>
          {formatDateDot(currentDay.date)}
          {isCalendarOpen && (
            <div
              className="trip-panel-calendar"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="trip-panel-calendar-header">
                <button
                  className="trip-panel-calendar-nav"
                  type="button"
                  onClick={() => onShiftCalendarMonth(-1)}
                  aria-label="이전 달"
                >
                  &#8249;
                </button>
                <span>
                  {calendarInfo.year}.
                  {String(calendarInfo.month).padStart(2, '0')}
                </span>
                <button
                  className="trip-panel-calendar-nav"
                  type="button"
                  onClick={() => onShiftCalendarMonth(1)}
                  aria-label="다음 달"
                >
                  &#8250;
                </button>
              </div>
              <div className="trip-panel-calendar-week">
                {['일', '월', '화', '수', '목', '금', '토'].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="trip-panel-calendar-grid">
                {calendarInfo.cells.map((day, index) => {
                  if (!day) {
                    return (
                      <span
                        key={`blank-${index}`}
                        className="trip-panel-calendar-blank"
                      />
                    );
                  }

                  const nextDate = `${calendarInfo.year}-${String(
                    calendarInfo.month,
                  ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = nextDate === currentDay.date;
                  const isToday = nextDate === todayString;

                  return (
                    <button
                      key={`day-${day}-${index}`}
                      type="button"
                      className={`trip-panel-calendar-day${
                        isSelected ? ' is-selected' : ''
                      }${isToday ? ' is-today' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectDate(nextDate);
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TripDayNavigation;
