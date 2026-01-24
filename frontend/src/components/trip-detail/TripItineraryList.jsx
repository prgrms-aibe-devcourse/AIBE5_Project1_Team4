import React from 'react';
import './TripItineraryList.css';

const TripItineraryList = () => { 

  const schedules = [
    { id: 1, time: '10:00', place: '김포공항', category: '교통' },
    { id: 2, time: '12:30', place: '제주국제공항', category: '교통' },
    { id: 3, time: '13:00', place: '자매국수 본점', category: '음식점' },
    { id: 4, time: '15:00', place: '함덕 해수욕장', category: '관광지' },
    { id: 5, time: '18:00', place: '칠돈가', category: '음식점' },
    { id: 6, time: '20:00', place: '동문시장 야시장', category: '쇼핑' },
  ];

  return (
    <div className="trip-schedule-container">
      <div className="schedule-day-header">
        <span className="day-badge">Day 1</span>
        <span className="day-date">2024.03.01 (금)</span>
      </div>

      <div className="schedule-list">
        {schedules.map((item, index) => (
          <div key={item.id} className="schedule-item">
            <div className="schedule-order">{index + 1}</div>
            <div className="schedule-content">
              <div>
                <span className="place-name">{item.place}</span>
                <span className="place-category">{item.category}</span>
              </div>
              {item.time && <span className="schedule-time">{item.time}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripItineraryList;