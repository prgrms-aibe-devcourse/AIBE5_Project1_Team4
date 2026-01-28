import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';

// 컴포넌트 및 훅 임포트
import TripCard from '@/components/trip/TripCard';
import TripFilterPanel from '@/components/trip/TripFilterPanel';
import { useMyTrips } from '@/hooks/trips/useMyTrips';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/features/auth/hooks/useAuth';

// 서비스 함수: Home/Bookmarks와 동일 패턴 재사용 (supabase 직접 호출 ❌)
import { getFilterOptions, toggleTripLike, toggleTripBookmark } from '@/services/trips.service';

import FloatingActionGroup from '@/components/common/FloatingActionGroup';

// 스타일 임포트
import './MyTripsPage.css';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // 1. 필터 및 정렬 상태 관리 (TripsPage와 동일한 규격)
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTheme, setSelectedTheme] = useState('전체');
  const [dateFilter, setDateFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const [filterOptions, setFilterOptions] = useState({ regions: [], themes: [] });

  // 화면 표시용 로컬 상태 (서버 응답 기준으로 UI 상태 덮어쓰기)
  // - 하트/북마크 토글 후 리스트 아이템의 is_liked/is_bookmarked/count를 즉시 반영하기 위함
  const [displayItems, setDisplayItems] = useState([]);

  // 2. 날짜 필터 선택값을 SQL 처리를 위한 '일수(days)'로 변환
  const daysLimit = useMemo(() => {
    if (dateFilter === '최근 1주') return 7;
    if (dateFilter === '최근 1달') return 30;
    return null;
  }, [dateFilter]);

  // 3. 데이터 로드: 선택된 모든 필터 상태를 훅에 전달 (필터 작동의 핵심)
  const { items = [], hasMore, status, loadMore } = useMyTrips({
    limit: 12,
    sort: sortBy,
    region: selectedRegion,
    theme: selectedTheme,
    days: daysLimit,
  });

  // 훅 결과 → 로컬 표시 상태 동기화
  useEffect(() => {
    setDisplayItems(items);
  }, [items]);

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

  // =========================
  // 토글 핸들러 (BookmarksPage 패턴 재사용)
  // =========================

  // 좋아요 토글: 서버 응답 기준으로 상태 덮어쓰기
  const handleLikeClick = async (tripId) => {
    try {
      const { is_liked, like_count } = await toggleTripLike(tripId);

      setDisplayItems((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, is_liked, like_count } : t
        )
      );
    } catch (e) {
      console.error('좋아요 토글 실패:', e);
    }
  };

  // 북마크 토글: 서버 응답 기준으로 상태 덮어쓰기
  const handleBookmarkClick = async (tripId) => {
    try {
      const { is_bookmarked, bookmark_count } = await toggleTripBookmark(tripId);

      setDisplayItems((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, is_bookmarked, bookmark_count } : t
        )
      );
    } catch (e) {
      console.error('북마크 토글 실패:', e);
    }
  };

  // 인증 상태 확인
  if (authLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="mytrips-page">
      <Container>
        {/* 헤더 섹션 */}
        <div className="mytrips-page__header">
          <h1 className="mytrips-page__title">나의 여행</h1>
          <p className="mytrips-page__subtitle">내가 작성한 여행을 필터링하여 확인해보세요</p>
        </div>

        {/* 필터 패널 섹션 */}
        <div className="mytrips-page__filter">
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
        <div className="mytrips-page__result-header mt-4 d-flex justify-content-end">
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
        {status === 'loading' && displayItems.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : displayItems.length === 0 ? (
          /* 내 여행 빈 화면 UI */
          <div className="mytrips-page__empty">
            <span style={{ fontSize: '3rem' }}>✍️</span>
            <h5 className="mt-3">작성한 여행이 없습니다</h5>
            <Button variant="link" onClick={() => navigate('/trips/create')} className="mt-2">
              여행 만들러 가기
            </Button>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-2">
            {displayItems.map((trip) => (
              <Col key={trip.id}>
                {/* 핵심: TripCard에 토글 핸들러 props 전달 */}
                <TripCard
                  trip={trip}
                  onCardClick={(id) => navigate(`/trips/${id}`)}
                  onLikeClick={handleLikeClick}
                  onBookmarkClick={handleBookmarkClick}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* 무한 스크롤 트리거 요소 */}
        <div ref={sentinelRef} className="mytrips-page__sentinel">
          {status === 'loading' && displayItems.length > 0 && (
            <Spinner animation="border" size="sm" variant="secondary" />
          )}
        </div>
      </Container>

      <FloatingActionGroup />
    </div>
  );
}
