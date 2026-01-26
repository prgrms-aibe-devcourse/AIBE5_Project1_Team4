// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import TripCard from '@/components/trip/TripCard';
import { useAiSuggest } from '@/hooks/useAiSuggest';
import { listPublicTrips } from '@/services/trips.service'; // Service 사용
import './HomePage.css';

// 여행 섹션 컴포넌트
const TripSection = ({
  title,
  subtitle,
  trips,
  onCardClick,
  onLike,
  onBookmark,
  isLoading, // ✅ 로딩 상태 prop 추가
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
          {isLoading ? (
            // ✅ [추가] 로딩 중일 때 보여줄 스켈레톤 UI
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
                  // 서비스 DTO 필드명 확인 필요 (보통 isLiked로 매핑됨)
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

export default function HomePage() {
  const navigate = useNavigate();

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 데이터 상태
  const [recentTrips, setRecentTrips] = useState([]);
  const [popularTrips, setPopularTrips] = useState([]);
  const [recommendTrips, setRecommendTrips] = useState([]);
  // ✅ [추가] 전체 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // AI 쿼리 제안 Hook
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

  // ✅ [추가] API 데이터 Fetching 로직
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        // 1. 최신순, 인기순 병렬 호출 (Limit 8개)
        [cite_start]// listPublicTrips는 { items: [], nextCursor: ... } 형태를 반환함 [cite: 83, 84]
        const [latestResult, popularResult] = await Promise.all([
          listPublicTrips({ limit: 8, sort: 'latest' }),
          listPublicTrips({ limit: 8, sort: 'popular' }),
        ]);

        // 2. 상태 업데이트
        setRecentTrips(latestResult.items || []);
        setPopularTrips(popularResult.items || []);
        
        // 3. 추천 여행: 우선 최신 여행을 보여주고, 추후 개인화 로직 적용
        setRecommendTrips(latestResult.items || []);

      } catch (error) {
        console.error('Failed to load home trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행

  const handleCardClick = (id) => {
    navigate(`/trips/${id}`);
  };

  // ✅ [추가] 낙관적 업데이트 헬퍼 함수 (좋아요/북마크 클릭 시 즉시 UI 반영)
  const updateTripList = (list, id, field, countField) => {
    return list.map((t) => {
      if (t.id !== id) return t;
      const currentVal = t[field];
      return {
        ...t,
        [field]: !currentVal,
        [countField]: !currentVal
          ? (t[countField] || 0) + 1
          : (t[countField] || 0) - 1,
      };
    });
  };

  const handleLike = (id) => {
    // 실제 API 호출은 여기서 mutation을 실행해야 하지만, 우선 UI만 갱신
    setRecentTrips(prev => updateTripList(prev, id, 'isLiked', 'like_count'));
    setPopularTrips(prev => updateTripList(prev, id, 'isLiked', 'like_count'));
    setRecommendTrips(prev => updateTripList(prev, id, 'isLiked', 'like_count'));
  };

  const handleBookmark = (id) => {
    setRecentTrips(prev => updateTripList(prev, id, 'isBookmarked', 'bookmark_count'));
    setPopularTrips(prev => updateTripList(prev, id, 'isBookmarked', 'bookmark_count'));
    setRecommendTrips(prev => updateTripList(prev, id, 'isBookmarked', 'bookmark_count'));
  };

  // 검색 실행
  const handleSearch = (query = searchTerm) => {
    const q = query.trim();
    setShowSuggestions(false);
    if (q) {
      navigate(`/trips?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/trips');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

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
          trips={recommendTrips}
          isLoading={isLoading} // 로딩 상태 전달
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        <TripSection
          title="인기 여행지"
          subtitle="가장 많은 사랑을 받은 여행지입니다"
          trips={popularTrips}
          isLoading={isLoading} // 로딩 상태 전달
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        <TripSection
          title="최근 등록된 여행"
          subtitle="따끈따끈한 여행 계획들입니다"
          trips={recentTrips}
          isLoading={isLoading} // 로딩 상태 전달
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