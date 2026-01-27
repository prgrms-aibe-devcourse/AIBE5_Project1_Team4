import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';

// 컴포넌트 및 훅 임포트
import TripCard from '@/components/trip/TripCard';
import TripFilterPanel from '@/components/trip/TripFilterPanel'; //
import { useBookmarkedTrips } from '@/hooks/trips/useBookmarkedTrips'; //
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'; //
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getFilterOptions } from '@/services/trips.service'; //
import FloatingActionGroup from '@/components/common/FloatingActionGroup';

// 스타일 임포트
import './BookmarksPage.css';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // 1. 필터 및 정렬 상태 관리 (TripsPage와 동일한 규격)
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTheme, setSelectedTheme] = useState('전체');
  const [dateFilter, setDateFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const [filterOptions, setFilterOptions] = useState({ regions: [], themes: [] });

  // 2. 날짜 필터 선택값을 SQL 처리를 위한 '일수(days)'로 변환
  const daysLimit = useMemo(() => {
    if (dateFilter === '최근 1주') return 7;
    if (dateFilter === '최근 1달') return 30;
    return null;
  }, [dateFilter]);

  // 3. 데이터 로드: 선택된 모든 필터 상태를 훅에 전달 (필터 작동의 핵심)
  const { items = [], hasMore, status, loadMore } = useBookmarkedTrips({ 
    limit: 12, 
    sort: sortBy, 
    region: selectedRegion, 
    theme: selectedTheme, 
    days: daysLimit 
  });

  // 4. 무한 스크롤 설정
  const { targetRef: sentinelRef } = useInfiniteScroll({
    onIntersect: loadMore,
    enabled: hasMore && status !== 'loading',
  });

  // 5. 필터 옵션(지역/테마 목록) 초기 로드
  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch((e) => console.error('필터 옵션 로딩 실패:', e));
  }, []);

  // 인증 상태 확인
  if (authLoading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="bookmarks-page">
      <Container>
        {/* 헤더 섹션 */}
        <div className="bookmarks-page__header">
          <h1 className="bookmarks-page__title">나의 북마크</h1>
          <p className="bookmarks-page__subtitle">저장한 여행을 필터링하여 확인해보세요</p>
        </div>

        {/* 필터 패널 섹션 */}
        <div className="bookmarks-page__filter">
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

        {/* 결과 요약 및 정렬 바 */}
        <div className="bookmarks-page__result-header mt-4 d-flex justify-content-end">


          <ButtonGroup size="sm">
            <Button 
              variant={sortBy === 'latest' ? 'primary' : 'outline-secondary'} 
              onClick={() => setSortBy('latest')}
              className="d-flex align-items-center gap-1"
            >
              <Clock size={14} /> 최신순
            </Button>
            <Button 
              variant={sortBy === 'popular' ? 'primary' : 'outline-secondary'} 
              onClick={() => setSortBy('popular')}
              className="d-flex align-items-center gap-1"
            >
              <TrendingUp size={14} /> 인기순
            </Button>
          </ButtonGroup>
        </div>

        {/* 콘텐츠 영역: 로딩 / 빈 화면 / 카드 그리드 분기 */}
        {status === 'loading' && items.length === 0 ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : items.length === 0 ? (
          /* ✅ 북마크 빈 화면 UI */
          <div className="bookmarks-page__empty">
            <span style={{ fontSize: '3rem' }}>🔖</span>
            <h5 className="mt-3">북마크한 여행이 없습니다</h5>
            <Button variant="link" onClick={() => navigate('/trips')} className="mt-2">
              여행 탐색하러 가기
            </Button>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-2">
            {items.map((trip) => (
              <Col key={trip.id}>
                <TripCard 
                  trip={trip} 
                  onCardClick={(id) => navigate(`/trips/${id}`)}
                  isBookmarked={true} // 북마크 페이지이므로 항상 true
                />
              </Col>
            ))}
          </Row>
        )}

        {/* 무한 스크롤 트리거 요소 */}
        <div ref={sentinelRef} className="bookmarks-page__sentinel">
          {status === 'loading' && items.length > 0 && (
            <Spinner animation="border" size="sm" variant="secondary" />
          )}
        </div>
      </Container>
      <FloatingActionGroup />
    </div>
  );
}