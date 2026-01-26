import { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Spinner, ButtonGroup, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import TripCard from '@/components/trip/TripCard';
import TripFilterPanel from '@/components/trip/TripFilterPanel';
import { usePublicTrips } from '@/hooks/trips/usePublicTrips';
import { useAiSuggest } from '@/hooks/useAiSuggest';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getFilterOptions } from '@/services/trips.service';
import './TripsPage.css';

export default function TripsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. URL에서 검색어('q')와 정렬 기준('sort') 가져오기
  const urlQuery = searchParams.get('q') || '';
  const urlSort = searchParams.get('sort'); // ✅ [추가] URL에서 sort 값 읽기

  // 입력 상태
  const [inputValue, setInputValue] = useState(urlQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // URL 쿼리가 변경되면 입력값도 동기화
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  const searchQuery = urlQuery;

  // 2. 정렬 상태 초기화 (URL 값이 있으면 그걸 쓰고, 없으면 'latest')
  const [sortBy, setSortBy] = useState(urlSort || 'latest'); // ✅ [수정] 초기값 설정

  // 3. URL의 sort 파라미터가 바뀌면 상태도 업데이트 (필수)
  useEffect(() => {
    if (urlSort) {
      setSortBy(urlSort);
    }
  }, [urlSort]); // ✅ [추가] URL 변경 감지

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

  // 좋아요/북마크는 나중에 구현 (placeholder)
  const handleLike = (id) => {
    console.log('Like:', id);
  };

  const handleBookmark = (id) => {
    console.log('Bookmark:', id);
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

        {/* 결과 헤더: 카운트 + 정렬 */}
        <div className="trips-page__result-header">
          <div className="trips-page__count">
            총 <span className="fw-bold text-dark">{filteredItems.length}</span>개의 여행
          </div>
          <ButtonGroup size="sm" className="trips-page__sort">
            <Button
              variant={sortBy === 'latest' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setSortBy('latest');
                // 필요 시 URL 업데이트: navigate(`/trips?sort=latest&q=${encodeURIComponent(searchQuery)}`)
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
                // 필요 시 URL 업데이트: navigate(`/trips?sort=popular&q=${encodeURIComponent(searchQuery)}`)
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
                  trip={trip}
                  onCardClick={handleCardClick}
                  onLikeClick={handleLike}
                  onBookmarkClick={handleBookmark}
                  isLiked={trip.isLiked}
                  isBookmarked={trip.isBookmarked}
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
    </div>
  );
}