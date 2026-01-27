import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TripItineraryList.css';

/**
 * 여행 일정 리스트 컴포넌트
 * 
 * 기능:
 * - 여행의 각 날짜별 일정을 "Day 1", "Day 2" 형식으로 표시
 * - 여행 멤버 정보 표시
 * - 좌우 화살표로 날짜 네비게이션
 * - 토글 버튼으로 일정 패널 열고 닫기
 * - 각 일정 항목 클릭 시 콜백 함수 실행
 * 
 * Props:
 *   - schedules: RPC rpc_trip_detail_schedule에서 반환된 days 배열
 *     예시 구조:
 *     [
 *       {
 *         dayId: "uuid",
 *         date: "2026-01-27",
 *         items: [
 *           {
 *             itemId: "uuid",
 *             time: "10:00",
 *             place: { id, name: "장소명", lat, lng }
 *           }
 *         ]
 *       }
 *     ]
 *   - members: RPC rpc_trip_members에서 반환된 members 배열
 *     예시 구조:
 *     [
 *       {
 *         userId: "uuid",
 *         role: "owner",
 *         displayName: "서일현",
 *         isSelf: true
 *       }
 *     ]
 *   - onScheduleClick: 일정 항목 클릭 시 실행될 콜백 함수 (itemId 전달)
 *   - selectedId: 현재 선택된 일정의 ID (UI 강조용)
 */
const TripItineraryList = ({ schedules = [], members = [], onScheduleClick, selectedId }) => {
  // 패널 열림/닫힘 상태 (초기값: false로 닫혀있음)
  const [isOpen, setIsOpen] = useState(false);
  
  // 현재 표시 중인 날의 인덱스 (0부터 시작)
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // 일정 데이터 배열 (메모이제이션으로 불필요한 렌더링 방지)
  const days = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];
    return schedules;
  }, [schedules]);

  // 데이터 존재 여부 확인
  const hasData = days.length > 0;

  // 현재 선택된 날의 전체 정보 가져오기
  const currentDay = useMemo(() => {
    if (!hasData || currentDayIndex >= days.length) return null;
    return days[currentDayIndex];
  }, [days, currentDayIndex, hasData]);

  // 현재 날의 일정 항목들 배열
  const currentDayItems = useMemo(() => {
    if (!currentDay || !currentDay.items) return [];
    return currentDay.items;
  }, [currentDay]);

  // "Day 1", "Day 2" 형식의 레이블 (인덱스 + 1)
  const dayLabel = `Day ${currentDayIndex + 1}`;
  
  // 표시할 날짜 (DB의 date 필드 또는 Day N 레이블)
  const dateDisplay = currentDay?.date || dayLabel;

  return (
    <div className={`itinerary-wrapper ${isOpen ? 'open' : ''}`}>
      {/* 패널 토글 버튼 - 우측 가장자리 */}
      <button 
        className="schedule-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "일정 닫기" : "일정 열기"}
      >
        {/* 패널이 열려있으면 오른쪽 화살표, 닫혀있으면 왼쪽 화살표 표시 */}
        {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </button>

      {/* 일정 리스트 컨테이너 */}
      <div className="trip-schedule-container">
        {/* 데이터가 있을 때만 렌더링 */}
        {hasData ? (
          <>
            {/* 날짜 네비게이션 헤더 영역 */}
            <div className="day-navigation-header">
              <div className="day-nav-controls">
                {/* 이전 날로 이동 버튼 (첫날이면 비활성화) */}
                <button 
                  className="nav-arrow-btn"
                  onClick={() => setCurrentDayIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentDayIndex === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {/* 현재 날 표시: "Day 1", "Day 2", ... */}
                <span className="current-day-title">{dayLabel}</span>
                
                {/* 다음 날로 이동 버튼 (마지막 날이면 비활성화) */}
                <button 
                  className="nav-arrow-btn"
                  onClick={() => setCurrentDayIndex(prev => Math.min(days.length - 1, prev + 1))}
                  disabled={currentDayIndex === days.length - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              
              {/* 선택된 날의 실제 날짜 표시 (예: 2026-01-27) */}
              <span className="current-date-text">{dateDisplay}</span>
            </div>

            {/* 일정 항목들을 표시하는 스크롤 영역 */}
            <div className="schedule-list-scroll-area">
              {currentDayItems.length > 0 ? (
                // 현재 날의 모든 일정 항목을 시간순으로 렌더링
                currentDayItems.map((item) => (
                  <div 
                    key={item.itemId}  // 각 항목의 고유 ID
                    className={`schedule-item ${selectedId === item.itemId ? 'active' : ''}`}
                    onClick={() => onScheduleClick && onScheduleClick(item.itemId)}
                  >
                    {/* 일정 시간 표시 */}
                    <div className="schedule-time">{item.time || "-"}</div>
                    
                    {/* 장소 정보 및 상세 내용 */}
                    <div className="schedule-content">
                      {/* 장소명 (DB place 테이블의 name) */}
                      <span className="place-name">{item.place?.name || "장소 정보 없음"}</span>
                      {/* 일정 메모 또는 추가 정보 */}
                      <span className="place-category">{item.notes || "일정"}</span>
                    </div>
                  </div>
                ))
              ) : (
                // 선택된 날에 일정이 없을 때 표시
                <div className="text-center text-muted mt-4 small">
                  이 날짜에는 일정이 없습니다.
                </div>
              )}
            </div>
          </>
        ) : (
          // 전체 여행에 일정 데이터가 없을 때 표시하는 빈 상태 (Empty State)
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', padding: '20px', textAlign: 'center' }}>
            등록된 여행 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default TripItineraryList;