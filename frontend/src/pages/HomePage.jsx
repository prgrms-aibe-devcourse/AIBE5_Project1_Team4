import { useState, useRef } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import TripCard from '@/components/trip/TripCard';
import { useAiSuggest } from '@/hooks/useAiSuggest';
import './HomePage.css';

// Mock 데이터
const MOCK_TRIPS = [
  {
    id: 1,
    title: '제주도 식도락 여행',
    description: '제주 맛집 완전 정복 코스',
    start_date: '2024-02-10',
    end_date: '2024-02-13',
    cover_image_url:
      'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=500&q=60',
    regions: ['제주'],
    themes: ['미식'],
    author: { name: '여행자1' },
    like_count: 12,
    bookmark_count: 5,
    member_count: 4,
    created_at: '2024-01-20T10:00:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    title: '부산 2박 3일 힐링',
    description: '바다 보며 물멍 때리기',
    start_date: '2024-03-01',
    end_date: '2024-03-03',
    cover_image_url:
      'https://images.unsplash.com/photo-1621845199676-787140c94609?w=500&q=60',
    regions: ['부산'],
    themes: ['힐링'],
    author: { name: 'BusanLover' },
    like_count: 24,
    bookmark_count: 8,
    member_count: 2,
    created_at: '2024-01-25T14:30:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 3,
    title: '도쿄 벚꽃 여행',
    description: '봄바람 휘날리며',
    start_date: '2024-04-05',
    end_date: '2024-04-09',
    cover_image_url:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=60',
    regions: ['도쿄'],
    themes: ['관광'],
    author: { name: 'J-Pop' },
    like_count: 45,
    bookmark_count: 20,
    member_count: 3,
    created_at: '2024-02-01T09:00:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 4,
    title: '강릉 커피 투어',
    description: '커피 향 가득한 여행',
    start_date: '2024-01-25',
    end_date: '2024-01-26',
    cover_image_url:
      'https://images.unsplash.com/photo-1627447186259-fc53907c6f09?w=500&q=60',
    regions: ['강릉'],
    themes: ['미식'],
    author: { name: 'Coffee' },
    like_count: 8,
    bookmark_count: 2,
    member_count: 2,
    created_at: '2024-02-10T11:20:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 5,
    title: '뉴욕 도심 탐방',
    description: '잠들지 않는 도시',
    start_date: '2024-05-10',
    end_date: '2024-05-17',
    regions: ['뉴욕'],
    themes: ['관광'],
    cover_image_url:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=60',
    author: { name: 'NY_Lover' },
    like_count: 30,
    bookmark_count: 12,
    member_count: 1,
    created_at: '2024-02-15T16:45:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 6,
    title: '파리 낭만 여행',
    description: '에펠탑 아래 피크닉',
    start_date: '2024-06-01',
    end_date: '2024-06-07',
    regions: ['파리'],
    themes: ['힐링'],
    cover_image_url:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=60',
    author: { name: 'Bonjour' },
    like_count: 55,
    bookmark_count: 22,
    member_count: 2,
    created_at: '2024-02-20T10:00:00',
    isLiked: false,
    isBookmarked: false,
  },
];

// 여행 섹션 컴포넌트
const TripSection = ({
  title,
  subtitle,
  trips,
  onCardClick,
  onLike,
  onBookmark,
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
        <Link to="/trips" className="home-section__more">
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
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div key={trip.id} className="home-section__card">
                <TripCard
                  trip={trip}
                  onCardClick={onCardClick}
                  onLikeClick={onLike}
                  onBookmarkClick={onBookmark}
                  isLiked={trip.isLiked}
                  isBookmarked={trip.isBookmarked}
                />
              </div>
            ))
          ) : (
            <div className="home-section__empty">
              조건에 맞는 여행이 없습니다.
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

export default function HomePage() {
  const navigate = useNavigate();

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock 데이터 상태
  const [trips, setTrips] = useState(MOCK_TRIPS);

  // AI 쿼리 제안
  const {
    normalizedQuery,
    suggestions,
    isLoading: isAiLoading,
    error: aiError,
  } = useAiSuggest(searchTerm, {
    debounceMs: 400,
    minLength: 2,
    enabled: showSuggestions,
  });

  // 인기순 정렬
  const popularTrips = [...trips].sort((a, b) => b.like_count - a.like_count);

  // 최신순 정렬
  const recentTrips = [...trips].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const handleCardClick = (id) => {
    navigate(`/trips/${id}`);
  };

  const handleLike = (id) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isLiked: !t.isLiked,
              like_count: !t.isLiked ? t.like_count + 1 : t.like_count - 1,
            }
          : t,
      ),
    );
  };

  const handleBookmark = (id) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isBookmarked: !t.isBookmarked,
              bookmark_count: !t.isBookmarked
                ? t.bookmark_count + 1
                : t.bookmark_count - 1,
            }
          : t,
      ),
    );
  };

  // 검색 실행 -> /trips 페이지로 이동
  const handleSearch = (query = searchTerm) => {
    const q = query.trim();
    setShowSuggestions(false);
    if (q) {
      navigate(`/trips?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/trips');
    }
  };

  // AI 제안 클릭
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  // 정규화된 쿼리 적용
  const handleApplyNormalized = () => {
    if (normalizedQuery && normalizedQuery !== searchTerm) {
      setSearchTerm(normalizedQuery);
      handleSearch(normalizedQuery);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <Container className="home-hero__content">
          <Badge bg="primary" className="home-hero__badge">
            Trip Planner
          </Badge>
          <h1 className="home-hero__title">당신의 다음 여행은 어디인가요?</h1>

          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <SearchBar
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  setShowSuggestions(true);
                }}
                onSubmit={handleSearch}
                onFocus={() => setShowSuggestions(true)}
                placeholder="여행지, 태그, 키워드로 검색"
                showSuggestions={showSuggestions}
                isLoading={isAiLoading}
                error={aiError}
                normalizedQuery={normalizedQuery}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                onNormalizedClick={handleApplyNormalized}
                onCloseSuggestions={() => setShowSuggestions(false)}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Content Section */}
      <Container className="home-content">
        <TripSection
          title="추천 여행"
          subtitle="당신을 위한 맞춤 여행지"
          trips={trips.slice(0, 8)}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        <TripSection
          title="인기 여행지"
          subtitle="가장 많은 사랑을 받은 여행지입니다"
          trips={popularTrips.slice(0, 8)}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        <TripSection
          title="최근 등록된 여행"
          subtitle="따끈따끈한 여행 계획들입니다"
          trips={recentTrips.slice(0, 8)}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        {/* CTA Section */}
        <div className="home-cta">
          <div className="home-cta__content">
            <h2 className="home-cta__title">
              나만의 여행을 계획할 준비가 되셨나요?
            </h2>
            <Link to="/trips/new" className="home-cta__btn">
              여행 일정 만들기
            </Link>
          </div>
          <div className="home-cta__circle home-cta__circle--1" />
          <div className="home-cta__circle home-cta__circle--2" />
        </div>
      </Container>
    </div>
  );
}
