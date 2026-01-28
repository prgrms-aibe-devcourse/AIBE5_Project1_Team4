// src/components/home/TripSection.jsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TripCard from '@/components/trip/TripCard';

const TripSection = ({
  title,
  subtitle,
  trips,
  onCardClick,
  onLike,
  onBookmark,
  isLoading,
  linkTo = "/trips"
}) => {
  // --- 가로 스크롤 핸들링 ---
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-section">
      {/* --- 섹션 헤더 (제목 + 더보기 링크) --- */}
      <div className="home-section__header">
        <div>
          <h4 className="home-section__title">{title}</h4>
          {subtitle && <p className="home-section__subtitle">{subtitle}</p>}
        </div>
        <Link to={linkTo} className="home-section__more">
          더보기 <ChevronRight size={16} />
        </Link>
      </div>

      <div className="home-section__slider">
        {/* --- 좌측 네비게이션 버튼 --- */}
        <button
          className="home-section__nav home-section__nav--left"
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={24} />
        </button>

        {/* ---  여행 카드 리스트 (로딩/성공/빈값 처리) --- */}
        <div ref={scrollRef} className="home-section__cards">
          {isLoading ? (
            // 로딩 중: 스켈레톤 UI
            [...Array(4)].map((_, i) => (
              <div key={i} className="home-section__card">
                <div
                  className="bg-light rounded"
                  style={{ 
                    height: '320px', 
                    width: '100%', 
                    animation: 'pulse 1.5s infinite',
                    backgroundColor: '#f0f0f0' 
                  }}
                ></div>
              </div>
            ))
          ) : trips && trips.length > 0 ? (
            // 데이터 있음: 카드 목록 렌더링
            trips.map((trip) => (
              <div key={trip.id} className="home-section__card">
                <TripCard
                  trip={trip}
                  onCardClick={onCardClick}
                  onLikeClick={onLike}
                  onBookmarkClick={onBookmark}
                />
              </div>
            ))
          ) : (
            // 데이터 없음: 안내 메시지
            <div className="home-section__empty">
              등록된 여행이 없습니다.
            </div>
          )}
        </div>

        {/* --- 우측 네비게이션 버튼 --- */}
        <button
          className="home-section__nav home-section__nav--right"
          onClick={() => scroll('right')}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default TripSection;