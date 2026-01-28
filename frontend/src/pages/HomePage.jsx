import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { useAiSuggest } from '@/hooks/useAiSuggest';
import {
  listPublicTrips,
  toggleTripLike,
  toggleTripBookmark,
} from '@/services/trips.service';
import TripSection from '@/components/home/TripSection';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import './HomePage.css';
import FloatingActionGroup from '@/components/common/FloatingActionGroup';

export default function HomePage() {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation();
  const { user, loading: isAuthLoading } = useAuth();

  // 상태 관리 (State)
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 입력값
  const [showSuggestions, setShowSuggestions] = useState(false); // 검색어 제안 표시 여부

  // 여행 데이터 상태 (최신, 인기, 추천)
  const [recentTrips, setRecentTrips] = useState([]);
  const [popularTrips, setPopularTrips] = useState([]);
  const [recommendTrips, setRecommendTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  // 커스텀 훅 (AI 검색 제안)
  const {
    normalizedQuery, // 정규화된 쿼리 (오타 교정 등)
    suggestions, // 추천 검색어 목록
    isLoading: isAiLoading,
    error: aiError,
  } = useAiSuggest(searchTerm, {
    debounceMs: 400,
    minLength: 2,
    enabled: showSuggestions,
  });

  // 초기 데이터 로드 (useEffect)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        // 최신순, 인기순 데이터를 병렬로 동시에 호출하여 속도 최적화
        const [latestResult, popularResult] = await Promise.all([
          listPublicTrips({ limit: 8, sort: 'latest' }),
          listPublicTrips({ limit: 8, sort: 'popular' }),
        ]);

        const normalizeTrips = (items = []) =>
          items.map((t) => ({
            ...t,
            is_liked: Boolean(t.is_liked ?? t.isLiked),
            is_bookmarked: Boolean(t.is_bookmarked ?? t.isBookmarked),
          }));

        const latestItems = normalizeTrips(latestResult.items || []);
        const popularItems = normalizeTrips(popularResult.items || []);

        // 받아온 데이터 상태 업데이트
        setRecentTrips(latestItems);
        setPopularTrips(popularItems);
        setRecommendTrips(popularItems); // 추천 로직 개발 전까지 인기순 사용
      } catch (error) {
        console.error('Failed to load home trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // 네비게이션 핸들러
  const handleCardClick = (id) => navigate(`/trips/${id}`); // 상세 페이지로 이동

  // 연타/중복 클릭 방지 (like/bookmark 공용)
  const inFlightRef = useRef(new Set());

  const handleLike = async (id) => {
    if (inFlightRef.current.has(`like:${id}`)) return;
    inFlightRef.current.add(`like:${id}`);

    try {
      console.log('[handleLike] clicked', id);

      const { is_liked, like_count } = await toggleTripLike(id);

      const applyServer = (list) =>
        list.map((t) => (t.id !== id ? t : { ...t, is_liked, like_count }));

      setRecentTrips((prev) => applyServer(prev));
      setPopularTrips((prev) => applyServer(prev));
      setRecommendTrips((prev) => applyServer(prev));
    } catch (e) {
      console.error('좋아요 토글 실패:', e);
    } finally {
      inFlightRef.current.delete(`like:${id}`);
    }
  };

  const handleBookmark = async (id) => {
    if (inFlightRef.current.has(`bm:${id}`)) return;
    inFlightRef.current.add(`bm:${id}`);

    try {
      const { is_bookmarked, bookmark_count } = await toggleTripBookmark(id);

      const applyServer = (list) =>
        list.map((t) =>
          t.id !== id ? t : { ...t, is_bookmarked, bookmark_count },
        );

      setRecentTrips((prev) => applyServer(prev));
      setPopularTrips((prev) => applyServer(prev));
      setRecommendTrips((prev) => applyServer(prev));
    } catch (e) {
      console.error('북마크 토글 실패:', e);
    } finally {
      inFlightRef.current.delete(`bm:${id}`);
    }
  };

  // 검색 관련 핸들러
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

  const handleCreateTrip = async () => {
    if (isAuthLoading) return;
    if (!user) {
      setReturnToIfEmpty(location.pathname + location.search);
      navigate('/login', { replace: true });
      return;
    }
    navigate('/trips/create');
  };

  return (
    <div className="home-page">
      {/* A. Hero 섹션: 메인 타이틀 및 검색창 */}
      <div className="home-hero">
        <Container className="home-hero__content">
          <Badge bg="primary" className="home-hero__badge">
            Trip Planner
          </Badge>
          <h1 className="home-hero__title">
            당신의 다음 여행은 어디인가요?
          </h1>
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

      {/* B. 메인 콘텐츠 섹션: 여행 리스트 목록 */}
      <Container className="home-content">
        <TripSection
          title="추천 여행"
          subtitle="당신을 위한 맞춤 여행지"
          trips={recommendTrips}
          isLoading={isLoading}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          linkTo="/trips?sort=popular"
        />

        <TripSection
          title="인기 여행지"
          subtitle="가장 많은 사랑을 받은 여행지입니다"
          trips={popularTrips}
          isLoading={isLoading}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          linkTo="/trips?sort=popular"
        />

        <TripSection
          title="최근 등록된 여행"
          subtitle="따끈따끈한 여행 계획들입니다"
          trips={recentTrips}
          isLoading={isLoading}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          linkTo="/trips?sort=latest"
        />

        {/* C. CTA (Call To Action) 섹션: 여행 만들기 버튼 */}
        <div className="home-cta">
          <div className="home-cta__content">
            <h2 className="home-cta__title">
              나만의 여행을 계획할 준비가 되셨나요?
            </h2>
            <button
              type="button"
              className="home-cta__btn"
              onClick={handleCreateTrip}
              disabled={isAuthLoading}
            >
              {isAuthLoading
                ? '로그인 확인 중...'
                : '여행 일정 만들기'}
            </button>
          </div>
          <div className="home-cta__circle home-cta__circle--1" />
          <div className="home-cta__circle home-cta__circle--2" />
        </div>
      </Container>
      <FloatingActionGroup />
    </div>
  );
}