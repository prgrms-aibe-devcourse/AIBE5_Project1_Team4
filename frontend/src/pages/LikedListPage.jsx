import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';

import TripCard from '@/components/trip/TripCard';
import TripFilterPanel from '@/components/trip/TripFilterPanel';
import FloatingActionGroup from '@/components/common/FloatingActionGroup';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLikedTrips } from '@/hooks/trips/useLikedTrips';
import { getFilterOptions } from '@/services/trips.service';
import './BookmarksPage.css';

export default function LikedListPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTheme, setSelectedTheme] = useState('전체');
  const [dateFilter, setDateFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const [filterOptions, setFilterOptions] = useState({ regions: [], themes: [] });

  const daysLimit = useMemo(() => {
    if (dateFilter === '최근 1주') return 7;
    if (dateFilter === '최근 1달') return 30;
    return null;
  }, [dateFilter]);

  const { items = [], hasMore, status, loadMore } = useLikedTrips({
    limit: 12,
    sort: sortBy,
    region: selectedRegion,
    theme: selectedTheme,
    days: daysLimit,
  });

  const { targetRef: sentinelRef } = useInfiniteScroll({
    onIntersect: () => loadMore(),
    enabled: hasMore && status !== 'loading',
  });

  React.useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch((e) => console.error('필터 옵션 로딩 실패:', e));
  }, []);

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="liked-list-page" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container>
        {/* 헤더 섹션 */}
        <div className="bookmarks-page__header" style={{ paddingTop: '48px' }}>
          <h1 className="bookmarks-page__title">나의 좋아요</h1>
          <p className="bookmarks-page__subtitle">좋아요한 여행을 필터링하여 확인해보세요</p>
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

        {/* 콘텐츠 영역 */}
        {status === 'loading' && items.length === 0 ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : items.length === 0 ? (
          <div className="bookmarks-page__empty">
            <span style={{ fontSize: '3rem' }}>❤️</span>
            <h5 className="mt-3">좋아요한 여행이 없습니다</h5>
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
                  isLiked={true}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* 무한 스크롤 트리거 */}
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
