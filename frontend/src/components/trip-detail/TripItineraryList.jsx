import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TripItineraryList.css';

const TripItineraryList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Mock Data
  const itineraryData = [
    {
      day: 1, date: '2026.01.25',
      schedules: [
        { id: 1, time: '10:00', place: '김포공항', category: '교통' },
        { id: 2, time: '13:00', place: '제주국제공항', category: '교통' },
        { id: 3, time: '14:00', place: '자매국수', category: '음식점' },
      ]
    },
    {
      day: 2, date: '2026.01.26',
      schedules: [
        { id: 4, time: '09:00', place: '성산일출봉', category: '관광지' },
        { id: 5, time: '12:00', place: '스타벅스 성산DT', category: '카페' },
      ]
    }
  ];

  const currentDayData = itineraryData[currentDayIndex];
  const totalDays = itineraryData.length;

  return (
    <div className={`itinerary-wrapper ${isOpen ? 'open' : ''}`}>
      
      {/* 1. 토글 버튼 */}
      <button 
        className="schedule-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "일정 닫기" : "일정 열기"}
      >
        {/* 닫혀있으면 < (열기), 열려있으면 > (닫기) */}
        {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </button>

      {/* 2. 일정 패널 */}
      <div className="trip-schedule-container">
        
        {/* Day 네비게이션 */}
        <div className="day-navigation-header">
          <div className="day-nav-controls">
            <button 
              className="nav-arrow-btn"
              onClick={() => setCurrentDayIndex(prev => Math.max(0, prev - 1))}
              disabled={currentDayIndex === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="current-day-title">{currentDayData.day}일차</span>
            <button 
              className="nav-arrow-btn"
              onClick={() => setCurrentDayIndex(prev => Math.min(totalDays - 1, prev + 1))}
              disabled={currentDayIndex === totalDays - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="current-date-text">{currentDayData.date}</span>
        </div>

        {/* 리스트 목록 */}
        <div className="schedule-list-scroll-area">
          {currentDayData.schedules.length > 0 ? (
            currentDayData.schedules.map((item) => (
              <div key={item.id} className="schedule-item">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-content">
                  <span className="place-name">{item.place}</span>
                  <span className="place-category">{item.category}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted mt-4 small">
              등록된 일정이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripItineraryList;