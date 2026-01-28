import { useState, useEffect } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { useAiSuggest } from '@/hooks/useAiSuggest';
import { listPublicTrips, toggleTripLike } from '@/services/trips.service';
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

  const updateTripList = (list, id, field, countField) => {
    return list.map((t) => {
      if (t.id !== id) return t;
      const currentVal = Boolean(t[field]);
      const currentCount = Number(t[countField] ?? 0);

      return {
        ...t,
        [field]: !currentVal,
        [countField]: currentCount + (currentVal ? -1 : 1),
      };
    });
  };

  const handleLike = async (id) => {
    // 1) UI 먼저 토글(낙관적 업데이트)
    const optimistic = (list) =>
      list.map((t) => {
        if (t.id !== id) return t;

        const prevLiked = Boolean(t.is_liked);
        const prevCount = Number(t.like_count ?? 0);

        return {
          ...t,
          is_liked: !prevLiked,
          like_count: prevCount + (prevLiked ? -1 : 1),
        };
      });

    setRecentTrips((prev) => optimistic(prev));
    setPopularTrips((prev) => optimistic(prev));
    setRecommendTrips((prev) => optimistic(prev));

    // 2) 서버 반영
    try {
      const { is_liked, like_count } = await toggleTripLike(id);

      const applyServer = (list) =>
        list.map((t) => (t.id !== id ? t : { ...t, is_liked, like_count }));

      setRecentTrips((prev) => applyServer(prev));
      setPopularTrips((prev) => applyServer(prev));
      setRecommendTrips((prev) => applyServer(prev));
    } catch (e) {
      console.error('좋아요 토글 실패:', e);

      // 실패 시 원복(옵션)
      const rollback = (list) =>
        list.map((t) => {
          if (t.id !== id) return t;
          const prevLiked = Boolean(t.is_liked);
          const prevCount = Number(t.like_count ?? 0);
          return {
            ...t,
            is_liked: !prevLiked,
            like_count: prevCount + (prevLiked ? -1 : 1),
          };
        });

      setRecentTrips((prev) => rollback(prev));
      setPopularTrips((prev) => rollback(prev));
      setRecommendTrips((prev) => rollback(prev));
    }
  };

  const handleBookmark = (id) => {
    setRecentTrips((prev) => updateTripList(prev, id, 'is_bookmarked', 'bookmark_count'));
    setPopularTrips((prev) => updateTripList(prev, id, 'is_bookmarked', 'bookmark_count'));
    setRecommendTrips((prev) => updateTripList(prev, id, 'is_bookmarked', 'bookmark_count'));
    console.log('북마크 클릭 (API 미연동):', id);
  };

  // 검색 관련 핸들러
  // 검색 실행 (엔터 키 또는 돋보기 클릭 시)
  const handleSearch = (query = searchTerm) => {
    const q = query.trim();
    setShowSuggestions(false);
    if (q) {
      navigate(`/trips?q=${encodeURIComponent(q)}`); // 검색 결과 페이지로 이동
    } else {
      navigate('/trips'); // 전체 목록으로 이동
    }
  };

  // 추천 검색어 클릭 시
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  // 정규화된 쿼리 적용 (오타 교정 제안 클릭 시)
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

      {/* B. 메인 콘텐츠 섹션: 여행 리스트 목록 */}
      <Container className="home-content">
        {/* 분리된 TripSection 컴포넌트 재사용 */}
        <TripSection
          title="추천 여행"
          subtitle="당신을 위한 맞춤 여행지"
          trips={recommendTrips}
          isLoading={isLoading}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          linkTo="/trips?sort=popular" // 더보기 클릭 시 인기순 정렬
        />

        <TripSection
          title="인기 여행지"
          subtitle="가장 많은 사랑을 받은 여행지입니다"
          trips={popularTrips}
          isLoading={isLoading}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          linkTo="/trips?sort=popular" // 더보기 클릭 시 인기순 정렬
        />

        <TripSection
          title="최근 등록된 여행"
          subtitle="따끈따끈한 여행 계획들입니다"
          trips={recentTrips}
          isLoading={isLoading}
          onCardClick={handleCardClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          linkTo="/trips?sort=latest" // 더보기 클릭 시 최신순 정렬
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
              {isAuthLoading ? '로그인 확인 중...' : '여행 일정 만들기'}
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
