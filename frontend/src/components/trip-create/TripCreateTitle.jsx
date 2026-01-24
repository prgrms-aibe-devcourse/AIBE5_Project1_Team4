import { useEffect, useState } from 'react';
import { formatDateDot } from '@/utils/date';

// Editable trip title and date-range picker in the header.
const TripCreateTitle = ({
  form,
  actions,
  isRangeCalendarOpen,
  rangeCalendarInfo,
  onToggleRangeCalendar,
  onShiftRangeMonth,
  onSelectRangeDate,
  onTitleChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(form.title);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(form.title);
    }
  }, [form.title, isEditing]);

  const commitTitle = () => {
    const next = draftTitle.trim();
    if (next) {
      onTitleChange(next);
    } else {
      setDraftTitle(form.title);
    }
    setIsEditing(false);
  };

  const titleElement = isEditing ? (
    <input
      className="trip-title-input"
      value={draftTitle}
      onChange={(event) => setDraftTitle(event.target.value)}
      onBlur={commitTitle}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitTitle();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          setDraftTitle(form.title);
          setIsEditing(false);
        }
      }}
      autoFocus
    />
  ) : (
    <button
      className="trip-title-button"
      type="button"
      onClick={() => setIsEditing(true)}
    >
      {form.title || '새 여행'}
    </button>
  );

  return (
    <div className="trip-create-title-row">
      <div className="trip-create-title-block">
        <h1>{titleElement}</h1>
        <button
          className="trip-create-date"
          type="button"
          onClick={onToggleRangeCalendar}
        >
          <span className="trip-create-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 9h18" />
            </svg>
          </span>
          {formatDateDot(form.startDate)} - {formatDateDot(form.endDate)}
        </button>
        {isRangeCalendarOpen && (
          <div
            className="trip-title-calendar"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="trip-title-calendar-header">
              <button
                className="trip-panel-calendar-nav"
                type="button"
                onClick={() => onShiftRangeMonth(-1)}
                aria-label="이전 달"
              >
                &#8249;
              </button>
              <span>
                {rangeCalendarInfo.year}.
                {String(rangeCalendarInfo.month).padStart(2, '0')}
              </span>
              <button
                className="trip-panel-calendar-nav"
                type="button"
                onClick={() => onShiftRangeMonth(1)}
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
              {rangeCalendarInfo.cells.map((day, index) => {
                if (!day) {
                  return (
                    <span
                      key={`blank-${index}`}
                      className="trip-panel-calendar-blank"
                    />
                  );
                }

                const nextDate = `${rangeCalendarInfo.year}-${String(
                  rangeCalendarInfo.month,
                ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                const isSelected =
                  nextDate === form.startDate || nextDate === form.endDate;
                const isInRange =
                  nextDate > form.startDate && nextDate < form.endDate;

                return (
                  <button
                    key={`day-${day}-${index}`}
                    type="button"
                    className={`trip-panel-calendar-day${
                      isSelected ? ' is-selected' : ''
                    }${isInRange ? ' is-in-range' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectRangeDate(nextDate);
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
      {actions}
    </div>
  );
};

export default TripCreateTitle;
