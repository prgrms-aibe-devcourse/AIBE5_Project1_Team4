import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TripItineraryList.css';

const TripItineraryList = ({ schedules = [], onScheduleClick, selectedId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // 전체 여행 일수 계산
  const totalDays = useMemo(() => {
    if (!schedules || schedules.length === 0) return 1;
    return Math.max(...schedules.map(item => item.day)) || 1;
  }, [schedules]);

  // 현재 선택된 날짜의 일정만 필터링
  const currentDaySchedules = useMemo(() => {
    if (!schedules) return [];
    return schedules.filter(item => item.day === currentDayIndex + 1);
  }, [schedules, currentDayIndex]);

  const currentDateDisplay = currentDaySchedules[0]?.date || `Day ${currentDayIndex + 1}`;

  return (
    <div className={`itinerary-wrapper ${isOpen ? 'open' : ''}`}>
      <button 
        className="schedule-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </button>

      <div className="trip-schedule-container">
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
                onClick={() => onScheduleClick(item.id)}
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
              일정이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripItineraryList;