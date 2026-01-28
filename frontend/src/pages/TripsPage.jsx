import { useState, useMemo, useEffect, useRef } from 'react';
import { Container, Row, Col, Spinner, ButtonGroup, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import TripCard from '@/components/trip/TripCard';
import TripFilterPanel from '@/components/trip/TripFilterPanel';
import { usePublicTrips } from '@/hooks/trips/usePublicTrips';
import { useAiSuggest } from '@/hooks/useAiSuggest';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getFilterOptions, toggleTripLike, toggleTripBookmark } from '@/services/trips.service';
import FloatingActionGroup from '@/components/common/FloatingActionGroup';
import './TripsPage.css';

export default function TripsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. URL에서 검색어('q')와 정렬 기준('sort') 가져오기
  const urlQuery = searchParams.get('q') || '';
  const urlSort = searchParams.get('sort'); // URL에서 sort 값 읽기

  // 입력 상태
  const [inputValue, setInputValue] = useState(urlQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 좋아요/북마크 override
  const [likeOverride, setLikeOverride] = useState({});
  const [bookmarkOverride, setBookmarkOverride] = useState({});

  // 좋아요/북마크 연타/응답 꼬임 방지용 pending
  const [pendingLike, setPendingLike] = useState({}); // { [tripId]: true/false }
  const [pendingBookmark, setPendingBookmark] = useState({}); // { [tripId]: true/false }

  // 마지막 요청 토큰(응답 역전 방지)
  const likeReqSeq = useRef({}); // { [tripId]: number }
  const bookmarkReqSeq = useRef({}); // { [tripId]: number }

  // URL 쿼리가 변경되면 입력값도 동기화
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  const searchQuery = urlQuery;

  // 2. 정렬 상태 초기화 (URL 값이 있으면 그걸 쓰고, 없으면 'latest')
  const [sortBy, setSortBy] = useState(urlSort || 'latest'); // 초기값 설정

  // 3. URL의 sort 파라미터가 바뀌면 상태도 업데이트 (필수)
  useEffect(() => {
    if (urlSort) {
      setSortBy(urlSort);
    }
  }, [urlSort]); // URL 변경 감지

  // 필터 상태
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTheme, setSelectedTheme] = useState('전체');
  const [dateFilter, setDateFilter] = useState('전체');

  // 필터 옵션 로드
  const [filterOptions, setFilterOptions] = useState({ regions: [], themes: [] });

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch((e) => console.error('Failed to load filter options:', e));
  }, []);

  // AI 쿼리 제안
  const {
    normalizedQuery,
    suggestions,
    isLoading: isAiLoading,
    error: aiError,
  } = useAiSuggest(inputValue, {
    debounceMs: 400,
    minLength: 2,
    enabled: showSuggestions,
  });

  // 여행 목록 조회 (sortBy가 바뀌면 자동으로 다시 호출됨)
  const { items, hasMore, status, loadMore } = usePublicTrips({
    q: searchQuery,
    limit: 12,
    sort: sortBy,
  });

  // 무한 스크롤
  const { targetRef: sentinelRef } = useInfiniteScroll({
    onIntersect: loadMore,
    enabled: hasMore && status !== 'loading',
  });

  // 클라이언트 필터링
  const filteredItems = useMemo(() => {
    return items.filter((trip) => {
      const matchRegion =
        selectedRegion === '전체' || trip.regions?.includes(selectedRegion);
      const matchTheme =
        selectedTheme === '전체' || trip.themes?.includes(selectedTheme);

      let matchDate = true;
      if (dateFilter !== '전체' && trip.created_at) {
        const now = new Date();
        const createdDate = new Date(trip.created_at);
        const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === '최근 1주') matchDate = diffDays <= 7;
        if (dateFilter === '최근 1달') matchDate = diffDays <= 30;
      }

      return matchRegion && matchTheme && matchDate;
    });
  }, [items, selectedRegion, selectedTheme, dateFilter]);

  // 검색 핸들러
  const handleSearch = (query = inputValue) => {
    const q = query.trim();
    setShowSuggestions(false);
    if (q) {
      navigate(`/trips?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/trips');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    handleSearch(suggestion);
  };

  const handleApplyNormalized = () => {
    if (normalizedQuery && normalizedQuery !== inputValue) {
      setInputValue(normalizedQuery);
      handleSearch(normalizedQuery);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/trips/${id}`);
  };

  // override를 trip에 합쳐서 카드에 내려주는 함수
  const mergeTripOverrides = (trip) => {
    return {
      ...trip,
      ...(likeOverride[trip.id] ?? {}),
      ...(bookmarkOverride[trip.id] ?? {}),
    };
  };

  // 좋아요: UI 즉시 반영(낙관적) + 연타 방지 + 실패 롤백 + 응답 역전 방지
  const handleLike = async (id) => {
    if (pendingLike[id]) return;

    const baseTrip = items.find((t) => t.id === id);
    const baseLiked = Boolean(likeOverride[id]?.is_liked ?? baseTrip?.is_liked);
    const baseCount = Number(likeOverride[id]?.like_count ?? baseTrip?.like_count ?? 0);

    const optimisticLiked = !baseLiked;
    const optimisticCount = baseCount + (baseLiked ? -1 : 1);

    setLikeOverride((prev) => ({
      ...prev,
      [id]: { is_liked: optimisticLiked, like_count: optimisticCount },
    }));

    setPendingLike((prev) => ({ ...prev, [id]: true }));
    const seq = (likeReqSeq.current[id] ?? 0) + 1;
    likeReqSeq.current[id] = seq;

    try {
      const row = await toggleTripLike(id); // { is_liked, like_count }

      if (likeReqSeq.current[id] !== seq) return;

      setLikeOverride((prev) => ({
        ...prev,
        [id]: row,
      }));
    } catch (e) {
      console.error('[TripsPage] toggleTripLike error:', e);

      if (likeReqSeq.current[id] === seq) {
        setLikeOverride((prev) => ({
          ...prev,
          [id]: { is_liked: baseLiked, like_count: baseCount },
        }));
      }
    } finally {
      if (likeReqSeq.current[id] === seq) {
        setPendingLike((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  // 북마크: 좋아요와 동일 패턴 (낙관적 최소 + 실패 롤백 + 응답 역전 방지)
  const handleBookmark = async (id) => {
    if (pendingBookmark[id]) return;

    const baseTrip = items.find((t) => t.id === id);
    const baseBookmarked = Boolean(
      bookmarkOverride[id]?.is_bookmarked ?? baseTrip?.is_bookmarked
    );
    const baseCount = Number(
      bookmarkOverride[id]?.bookmark_count ?? baseTrip?.bookmark_count ?? 0
    );

    const optimisticBookmarked = !baseBookmarked;
    const optimisticCount = baseCount + (baseBookmarked ? -1 : 1);

    setBookmarkOverride((prev) => ({
      ...prev,
      [id]: { is_bookmarked: optimisticBookmarked, bookmark_count: optimisticCount },
    }));

    setPendingBookmark((prev) => ({ ...prev, [id]: true }));
    const seq = (bookmarkReqSeq.current[id] ?? 0) + 1;
    bookmarkReqSeq.current[id] = seq;

    try {
      const row = await toggleTripBookmark(id); // { is_bookmarked, bookmark_count }

      if (bookmarkReqSeq.current[id] !== seq) return;

      setBookmarkOverride((prev) => ({
        ...prev,
        [id]: row,
      }));
    } catch (e) {
      console.error('[TripsPage] toggleTripBookmark error:', e);

      if (bookmarkReqSeq.current[id] === seq) {
        setBookmarkOverride((prev) => ({
          ...prev,
          [id]: { is_bookmarked: baseBookmarked, bookmark_count: baseCount },
        }));
      }
    } finally {
      if (bookmarkReqSeq.current[id] === seq) {
        setPendingBookmark((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div className="trips-page">
      <Container>
        {/* 헤더 섹션 */}
        <div className="trips-page__header">
          <h1 className="trips-page__title">여행 탐색</h1>
          <p className="trips-page__subtitle">
            다양한 여행 일정을 둘러보고 영감을 얻어보세요
          </p>

          {/* 검색창 */}
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <SearchBar
                value={inputValue}
                onChange={(val) => {
                  setInputValue(val);
                  setShowSuggestions(true);
                }}
                onSubmit={handleSearch}
                onFocus={() => setShowSuggestions(true)}
                placeholder="여행지, 키워드로 검색"
                showSuggestions={showSuggestions}
                isLoading={isAiLoading}
                error={aiError}
                normalizedQuery={normalizedQuery}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                onNormalizedClick={handleApplyNormalized}
                onCloseSuggestions={() => setShowSuggestions(false)}
              />

              {searchQuery && (
                <div className="trips-page__search-result">
                  <span className="fw-semibold">"{searchQuery}"</span> 검색 결과
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* 필터 패널 */}
        <div className="trips-page__filter">
          <TripFilterPanel
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            regions={filterOptions.regions}
            themes={filterOptions.themes}
          />
        </div>

        {/* 결과 헤더: 정렬 */}
        <div className="trips-page__result-header d-flex justify-content-end mb-3">
          <ButtonGroup size="sm" className="trips-page__sort">
            <Button
              variant={sortBy === 'latest' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setSortBy('latest');
              }}
              className="d-flex align-items-center gap-1"
            >
              <Clock size={14} />
              최신순
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setSortBy('popular');
              }}
              className="d-flex align-items-center gap-1"
            >
              <TrendingUp size={14} />
              인기순
            </Button>
          </ButtonGroup>
        </div>

        {/* 여행 카드 그리드 */}
        {status === 'loading' && items.length === 0 ? (
          <div className="trips-page__loading">
            <Spinner animation="border" variant="primary" />
            <p>여행을 불러오는 중...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="trips-page__empty">
            <div className="trips-page__empty-icon">🔍</div>
            <h5>검색 결과가 없습니다</h5>
            <p>다른 검색어나 필터를 시도해보세요</p>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredItems.map((trip) => (
              <Col key={trip.id}>
                <TripCard
                  trip={mergeTripOverrides(trip)}
                  onCardClick={handleCardClick}
                  onLikeClick={handleLike}
                  onBookmarkClick={handleBookmark}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* 무한 스크롤 센티널 */}
        <div ref={sentinelRef} className="trips-page__sentinel">
          {status === 'loading' && items.length > 0 && (
            <Spinner animation="border" size="sm" variant="secondary" />
          )}
        </div>
      </Container>
      <FloatingActionGroup />
    </div>
  );
}