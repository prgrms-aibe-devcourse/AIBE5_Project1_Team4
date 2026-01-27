import { useState } from 'react';

// Schedule list with inline edit/remove controls.
const TripScheduleEditor = ({
  items,
  summary,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draftTime, setDraftTime] = useState('');
  const [draftPlace, setDraftPlace] = useState('');

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraftTime(item.time);
    setDraftPlace(item.placeName ?? item.place ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTime('');
    setDraftPlace('');
  };

  const saveEdit = () => {
    if (!editingId) {
      return;
    }
    onUpdateItem(editingId, { time: draftTime, placeName: draftPlace });
    cancelEdit();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };
  return (
    <div className="trip-schedule-editor">
      <ul className="trip-panel-list trip-schedule-list">
        {items.map((item) => {
          const isEditing = editingId === item.id;
          return (
            <li key={item.id} className="trip-panel-item">
              {isEditing ? (
                <>
                  <input
                    className="trip-schedule-time-input"
                    value={draftTime}
                    onChange={(event) => setDraftTime(event.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <input
                    className="trip-schedule-place-input"
                    value={draftPlace}
                    onChange={(event) => setDraftPlace(event.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </>
              ) : (
                <>
                  <span className="trip-schedule-time-text">{item.time}</span>
                  <span className="trip-schedule-place-text">
                    {item.placeName ?? item.place}
                  </span>
                </>
              )}
              <span className="trip-panel-item-actions">
                {isEditing ? (
                  <>
                    <button
                      className="trip-schedule-icon-btn"
                      type="button"
                      onClick={saveEdit}
                      aria-label="저장"
                    >
                      ✓
                    </button>
                    <button
                      className="trip-schedule-icon-btn"
                      type="button"
                      onClick={cancelEdit}
                      aria-label="취소"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="trip-schedule-icon-btn"
                      type="button"
                      onClick={() => startEdit(item)}
                      aria-label="수정"
                    >
                      ✎
                    </button>
                    <button
                      className="trip-schedule-icon-btn"
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label="삭제"
                    >
                      ✕
                    </button>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <button className="trip-panel-add" type="button" onClick={onAddItem}>
        + 일정 추가
      </button>
      <div className="trip-panel-footer">
        {typeof summary === 'string' ? (
          summary
        ) : (
          <>
            <div>{summary.countText}</div>
            <div className="trip-panel-footer-sub">{summary.travelText}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default TripScheduleEditor;
