import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TripItineraryList.css';

const TripItineraryList = ({ schedules = [], onScheduleClick, selectedId }) => {
  // ✅ [수정 1] 처음에 닫혀있도록 false로 변경
  const [isOpen, setIsOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // ✅ [수정 2] 데이터가 있는지 확인 (에러 방지용)
  const hasData = schedules && schedules.length > 0;

  // 전체 여행 일수 계산
  const totalDays = useMemo(() => {
    if (!hasData) return 1;
    const days = schedules.map(item => item.day);
    return Math.max(...days) || 1;
  }, [schedules, hasData]);

  // 현재 선택된 날짜의 일정만 필터링
  const currentDaySchedules = useMemo(() => {
    if (!hasData) return [];
    return schedules.filter(item => item.day === currentDayIndex + 1);
  }, [schedules, currentDayIndex, hasData]);

  const currentDateDisplay = currentDaySchedules[0]?.date || `Day ${currentDayIndex + 1}`;

  return (
    <div className={`itinerary-wrapper ${isOpen ? 'open' : ''}`}>
      <button 
        className="schedule-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "일정 닫기" : "일정 열기"}
      >
        {/* 토글 방향에 따라 아이콘 변경 */}
        {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </button>

      <div className="trip-schedule-container">
        {/* ✅ [수정 3] 데이터가 있을 때만 내용 표시 */}
        {hasData ? (
          <>
            <div className="day-navigation-header">
              <div className="day-nav-controls">
                <button 
                  className="nav-arrow-btn"
                  onClick={() => setCurrentDayIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentDayIndex === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="current-day-title">{currentDayIndex + 1}일차</span>
                <button 
                  className="nav-arrow-btn"
                  onClick={() => setCurrentDayIndex(prev => Math.min(totalDays - 1, prev + 1))}
                  disabled={currentDayIndex === totalDays - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <span className="current-date-text">{currentDateDisplay}</span>
            </div>

            <div className="schedule-list-scroll-area">
              {currentDaySchedules.length > 0 ? (
                currentDaySchedules.map((item) => (
                  <div 
                    key={item.id} 
                    className={`schedule-item ${selectedId === item.id ? 'active' : ''}`}
                    onClick={() => onScheduleClick && onScheduleClick(item.id)}
                  >
                    <div className="schedule-time">{item.startTime || item.time || "-"}</div>
                    <div className="schedule-content">
                      <span className="place-name">{item.placeName || item.place}</span>
                      <span className="place-category">{item.category || item.categoryGroupCode || "장소"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted mt-4 small">
                  이 날짜에는 일정이 없습니다.
                </div>
              )}
            </div>
          </>
        ) : (
          /* ✅ [수정 4] 데이터가 없을 때 표시할 화면 (Empty State) */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', padding: '20px', textAlign: 'center' }}>
            등록된 여행 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default TripItineraryList;