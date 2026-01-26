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
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-section">
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
        <button
          className="home-section__nav home-section__nav--left"
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={24} />
        </button>

        <div ref={scrollRef} className="home-section__cards">
          {isLoading ? (
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
            trips.map((trip) => (
              <div key={trip.id} className="home-section__card">
                <TripCard
                  trip={trip}
                  onCardClick={onCardClick}
                  onLikeClick={onLike}
                  onBookmarkClick={onBookmark}
                  isLiked={trip.isLiked || false}
                  isBookmarked={trip.isBookmarked || false}
                />
              </div>
            ))
          ) : (
            <div className="home-section__empty">
              등록된 여행이 없습니다.
            </div>
          )}
        </div>

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