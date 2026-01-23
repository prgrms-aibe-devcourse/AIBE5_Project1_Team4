import { useState } from 'react';
import './trip-create.css';

const formatDate = (value) => value.replace(/-/g, '.');

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (value, days) => {
  const normalized = value.includes('.') ? value.replace(/\./g, '-') : value;
  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

const createInitialSchedules = () => {
  const today = getTodayString();
  return [
    {
      label: 'Day 1',
      date: today,
      items: [
        { time: '09:00', place: '서울역' },
        { time: '10:30', place: '성수 카페' },
        { time: '13:00', place: '점심' },
        { time: '15:00', place: '강남 맛집' },
      ],
      summary: '총 4곳 · 예상 이동 1시간 20분',
    },
    {
      label: 'Day 2',
      date: addDays(today, 1),
      items: [
        { time: '09:30', place: '남산 타워' },
        { time: '11:00', place: '북촌 한옥마을' },
        { time: '14:00', place: '광장시장' },
        { time: '18:00', place: '을지로' },
      ],
      summary: '총 4곳 · 예상 이동 1시간 10분',
    },
    {
      label: 'Day 3',
      date: addDays(today, 2),
      items: [
        { time: '10:00', place: '한강공원' },
        { time: '12:30', place: '홍대 거리' },
        { time: '15:00', place: '연남동' },
      ],
      summary: '총 3곳 · 예상 이동 55분',
    },
  ];
};

function TripCreateTest() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState('schedule');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [schedules, setSchedules] = useState(createInitialSchedules);
  const [isDayMenuOpen, setIsDayMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(null);

  const currentDay = schedules[dayIndex];

  const todayString = getTodayString();

  const addDay = () => {
    setSchedules((prev) => {
      const last = prev[prev.length - 1];
      const nextDate = addDays(last.date, 1);
      const nextDay = {
        label: `Day ${prev.length + 1}`,
        date: nextDate,
        items: [],
        summary: '총 0곳 · 예상 이동 0분',
      };
      setDayIndex(prev.length);
      return [...prev, nextDay];
    });
    setIsDayMenuOpen(false);
    setIsCalendarOpen(false);
  };

  const updateCurrentDate = (value) => {
    setSchedules((prev) => {
      if (dayIndex === 0) {
        return prev.map((day, index) => ({
          ...day,
          date: addDays(value, index),
        }));
      }

      return prev.map((day, index) =>
        index === dayIndex ? { ...day, date: value } : day,
      );
    });
  };

  const goPrevDay = () => {
    setDayIndex((prev) =>
      prev === 0 ? schedules.length - 1 : prev - 1,
    );
    setIsDayMenuOpen(false);
    setCalendarMonth(null);
  };

  const goNextDay = () => {
    setDayIndex((prev) =>
      prev === schedules.length - 1 ? 0 : prev + 1,
    );
    setIsDayMenuOpen(false);
    setCalendarMonth(null);
  };

  const calendarInfo = (() => {
    const baseDate = calendarMonth ?? currentDay.date;
    const [year, month] = baseDate.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const blanks = Array.from({ length: firstDay.getDay() }, () => null);
    const days = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
    return { year, month, cells: [...blanks, ...days] };
  })();

  const shiftCalendarMonth = (delta) => {
    const base = (calendarMonth ?? currentDay.date).split('-').map(Number);
    const date = new Date(base[0], base[1] - 1, 1);
    date.setMonth(date.getMonth() + delta);
    const next = formatLocalDate(date);
    setCalendarMonth(next);
  };

  const openModal = (type, name) => {
    setModal({ type, name });
  };

  return (
    <div className="trip-test">
      <div className="trip-test-frame">
        <header className="trip-test-nav">
          <div className="container-fluid d-flex align-items-center justify-content-between">
            <div className="trip-test-brand">Trip Planner</div>
            <div className="d-flex align-items-center gap-4">
              <nav className="trip-test-links">
                <a href="#">Home</a>
                <a href="#">My Trips</a>
                <a href="#">Wishlist</a>
              </nav>
              <div className="trip-test-user">
                <div className="trip-test-avatar" />
                <span className="trip-test-caret">▼</span>
              </div>
            </div>
          </div>
        </header>

        <section className="trip-test-title">
          <div className="container-fluid">
            <div className="trip-test-header-row">
              <div className="trip-test-title-block">
                <h1>서울 2박 3일 먹방 여행</h1>
                <div className="trip-test-date">
                  <span className="trip-test-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M8 3v4M16 3v4M3 9h18" />
                    </svg>
                  </span>
                  2025년 12월 1일 ~ 2025년 12월 4일
                </div>
              </div>
              <div className="trip-test-actions">
                <button className="trip-test-action" type="button">
                  <span className="trip-test-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M7 4h10a2 2 0 0 1 2 2v14l-7-4-7 4V6a2 2 0 0 1 2-2z" />
                    </svg>
                  </span>
                  저장됨
                </button>
                <button className="trip-test-action" type="button">
                  <span className="trip-test-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="10" width="16" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                    </svg>
                  </span>
                  공개
                </button>
                <button className="trip-test-action" type="button">
                  <span className="trip-test-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="8" cy="8" r="3" />
                      <circle cx="16" cy="8" r="3" />
                      <path d="M3 20c0-3 3-5 5-5s5 2 5 5" />
                      <path d="M11 20c0-2 2-4 5-4s5 2 5 4" />
                    </svg>
                  </span>
                  구성원 보기
                </button>
              </div>
              <div className="trip-test-share">
                <button className="trip-test-action" type="button">
                  <span className="trip-test-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="6" cy="12" r="2" />
                      <circle cx="18" cy="6" r="2" />
                      <circle cx="18" cy="18" r="2" />
                      <path d="M8 12l8-6M8 12l8 6" />
                    </svg>
                  </span>
                  공유하기
                </button>
                <button className="trip-test-icon-btn" type="button" aria-label="내보내기">
                  <svg viewBox="0 0 24 24">
                    <path d="M14 3h7v7" />
                    <path d="M10 14L21 3" />
                    <path d="M5 7v12a2 2 0 0 0 2 2h12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="trip-test-map">
          <div
            className={`trip-test-map-inner ${
              isPanelOpen ? 'is-panel-open' : ''
            }`}
            onClick={() => {
              setIsDayMenuOpen(false);
              setIsCalendarOpen(false);
            }}
          >
            <button
              className={`trip-map-btn trip-map-btn-left ${
                isSearchOpen ? '' : 'is-visible'
              }`}
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="검색 패널 열기"
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
              onClick={() => setIsPanelOpen(true)}
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
            <aside
              className={`trip-map-search ${isSearchOpen ? 'is-open' : ''}`}
            >
              <button
                className="trip-search-close"
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label="검색 패널 닫기"
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
                  />
                </div>
              </div>
              <ul className="trip-search-list">
                {[
                  { name: '서울역', selected: true },
                  { name: '서울역', selected: false },
                  { name: '서울역', selected: false },
                  { name: '서울역', selected: false },
                ].map((item, index) => (
                  <li key={`${item.name}-${index}`} className="trip-search-item">
                    <div>
                      <div className="trip-search-title">{item.name}</div>
                      <div className="trip-search-meta">
                        4.0 <span className="trip-search-stars">★★★★☆</span> · 리뷰
                        405
                      </div>
                    </div>
                    {item.selected ? (
                      <span className="trip-search-check">✓</span>
                    ) : (
                      <button className="trip-search-add" type="button">
                        + {currentDay.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
            <aside className={`trip-map-panel ${isPanelOpen ? 'is-open' : ''}`}>
              <button
                className="trip-panel-close"
                type="button"
                onClick={() => setIsPanelOpen(false)}
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
                    panelTab === 'schedule' ? 'trip-panel-tab-active' : ''
                  }`}
                  type="button"
                  onClick={() => setPanelTab('schedule')}
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
                    panelTab === 'group' ? 'trip-panel-tab-active' : ''
                  }`}
                  type="button"
                  onClick={() => setPanelTab('group')}
                >
                  <span className="trip-panel-tab-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="8" cy="8" r="3" />
                      <circle cx="16" cy="8" r="3" />
                      <path d="M3 20c0-3 3-5 5-5s5 2 5 5" />
                      <path d="M11 20c0-2 2-4 5-4s5 2 5 4" />
                    </svg>
                  </span>
                  그룹
                </button>
              </div>
              {panelTab === 'schedule' && (
                <>
                  <div className="trip-panel-day-row">
                    <button
                      className="trip-panel-day-nav"
                      type="button"
                      onClick={goPrevDay}
                      aria-label="이전 일정"
                    >
                      &#8249;
                    </button>
                    <span className="trip-panel-day-title">
                      {currentDay.label}
                    </span>
                    <button
                      className="trip-panel-day-nav"
                      type="button"
                      onClick={goNextDay}
                      aria-label="다음 일정"
                    >
                      &#8250;
                    </button>
                    <div className="trip-panel-day-actions">
                      <button
                        className="trip-panel-icon-btn"
                        type="button"
                        aria-label="일정 추가"
                        onClick={addDay}
                      >
                        +
                      </button>
                      <div
                        className="trip-panel-menu-wrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          className="trip-panel-icon-btn"
                          type="button"
                          aria-label="일정 메뉴"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsCalendarOpen(false);
                            setIsDayMenuOpen((prev) => !prev);
                          }}
                        >
                          &#8230;
                        </button>
                        {isDayMenuOpen && (
                          <div
                            className="trip-panel-menu"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setIsDayMenuOpen(false);
                                setIsCalendarOpen(false);
                              }}
                            >
                              일정 추가
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDayMenuOpen(false);
                                setIsCalendarOpen(false);
                              }}
                            >
                              일정 수정
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDayMenuOpen(false);
                                setIsCalendarOpen(false);
                              }}
                            >
                              일정 삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="trip-panel-date-row">
                    <div
                      className="trip-panel-date-button"
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsDayMenuOpen(false);
                        setCalendarMonth(currentDay.date);
                        setIsCalendarOpen((prev) => !prev);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setCalendarMonth(currentDay.date);
                          setIsCalendarOpen((prev) => !prev);
                        }
                      }}
                    >
                      <span className="trip-panel-date-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M8 3v4M16 3v4M3 9h18" />
                        </svg>
                      </span>
                      {formatDate(currentDay.date)}
                      {isCalendarOpen && (
                        <div
                          className="trip-panel-calendar"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="trip-panel-calendar-header">
                            <button
                              className="trip-panel-calendar-nav"
                              type="button"
                              onClick={() => shiftCalendarMonth(-1)}
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
                              onClick={() => shiftCalendarMonth(1)}
                              aria-label="다음 달"
                            >
                              &#8250;
                            </button>
                          </div>
                          <div className="trip-panel-calendar-week">
                            {['일', '월', '화', '수', '목', '금', '토'].map(
                              (label) => (
                                <span key={label}>{label}</span>
                              ),
                            )}
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
                              ).padStart(2, '0')}-${String(day).padStart(
                                2,
                                '0',
                              )}`;
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
                                    updateCurrentDate(nextDate);
                                    setIsCalendarOpen(false);
                                    setCalendarMonth(null);
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
                  <ul className="trip-panel-list">
                    {currentDay.items.map((item) => (
                      <li key={`${currentDay.label}-${item.time}`}>
                        <strong>{item.time}</strong>
                        <span className="trip-panel-place">{item.place}</span>
                        <span className="trip-panel-item-actions">
                          <button className="trip-panel-icon-btn" type="button">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                              <circle cx="12" cy="10" r="2.5" />
                            </svg>
                          </button>
                          <button className="trip-panel-icon-btn" type="button">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M4 20h4l10-10-4-4L4 16v4z" />
                              <path d="M14 6l4 4" />
                            </svg>
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="trip-panel-add" type="button">
                    + 일정 추가
                  </button>
                  <div className="trip-panel-footer">
                    {currentDay.summary}
                  </div>
                </>
              )}
              {panelTab === 'group' && (
                <div className="trip-panel-group">
                  <div className="trip-group-title">
                    <span className="trip-group-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <circle cx="8" cy="8" r="3" />
                        <circle cx="16" cy="8" r="3" />
                        <path d="M3 20c0-3 3-5 5-5s5 2 5 5" />
                        <path d="M11 20c0-2 2-4 5-4s5 2 5 4" />
                      </svg>
                    </span>
                    참여자 (3)
                  </div>
                  <ul className="trip-group-list">
                    <li className="trip-group-item">
                      <span className="trip-group-name">
                        유저 A
                        <span className="trip-group-role" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M4 18h16l-2-9-4 4-2-6-2 6-4-4-2 9z" />
                            <path d="M4 18h16v2H4z" />
                          </svg>
                        </span>
                      </span>
                    </li>
                    <li className="trip-group-item">
                      <span className="trip-group-name">유저 B</span>
                      <span className="trip-group-actions">
                        <button
                          className="trip-group-icon-btn"
                          type="button"
                          aria-label="그룹장 양도"
                          onClick={() => openModal('transfer', '유저 B')}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M7 7h10" />
                            <path d="M7 17h10" />
                            <path d="M7 7l-3 3 3 3" />
                            <path d="M17 17l3-3-3-3" />
                          </svg>
                        </button>
                        <button
                          className="trip-group-icon-btn"
                          type="button"
                          aria-label="내보내기"
                          onClick={() => openModal('remove', '유저 B')}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M10 6h8v12h-8" />
                            <path d="M14 12H4" />
                            <path d="M8 8l-4 4 4 4" />
                          </svg>
                        </button>
                      </span>
                    </li>
                    <li className="trip-group-item">
                      <span className="trip-group-name">유저 C</span>
                      <span className="trip-group-actions">
                        <button
                          className="trip-group-icon-btn"
                          type="button"
                          aria-label="그룹장 양도"
                          onClick={() => openModal('transfer', '유저 C')}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M7 7h10" />
                            <path d="M7 17h10" />
                            <path d="M7 7l-3 3 3 3" />
                            <path d="M17 17l3-3-3-3" />
                          </svg>
                        </button>
                        <button
                          className="trip-group-icon-btn"
                          type="button"
                          aria-label="내보내기"
                          onClick={() => openModal('remove', '유저 C')}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M10 6h8v12h-8" />
                            <path d="M14 12H4" />
                            <path d="M8 8l-4 4 4 4" />
                          </svg>
                        </button>
                      </span>
                    </li>
                  </ul>
                  <button className="trip-group-invite" type="button">
                    초대하기
                  </button>
                </div>
              )}
            </aside>
            {modal && (
              <div className="trip-modal-layer" role="dialog" aria-modal="true">
                <div className="trip-modal-card">
                  <h3>
                    {modal.type === 'transfer' ? '그룹장 양도' : '내보내기'}
                  </h3>
                  <p>
                    {modal.type === 'transfer'
                      ? `정말로 ${modal.name}에게 그룹장을 양도하시겠습니까?`
                      : `정말로 ${modal.name}를 내보내시겠습니까?`}
                  </p>
                  <div className="trip-modal-actions">
                    <button
                      className="trip-modal-confirm"
                      type="button"
                      onClick={() => setModal(null)}
                    >
                      확인
                    </button>
                    <button
                      className="trip-modal-cancel"
                      type="button"
                      onClick={() => setModal(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TripCreateTest;
