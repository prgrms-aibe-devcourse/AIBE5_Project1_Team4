import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';

import TripCard from '@/components/trip/TripCard';
import TripFilterPanel from '@/components/trip/TripFilterPanel';
import FloatingActionGroup from '@/components/common/FloatingActionGroup';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLikedTrips } from '@/hooks/trips/useLikedTrips';

// BookmarksPage와 동일한 서비스 함수 재사용 (supabase 직접 호출 ❌)
import { toggleTripLike, toggleTripBookmark, getFilterOptions } from '@/services/trips.service';

// 스타일: 프로젝트에서 BookmarksPage.css를 재사용하고 있어서 그대로 둠
import './BookmarksPage.css';

export default function LikedListPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // 1) 필터 및 정렬 상태
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTheme, setSelectedTheme] = useState('전체');
  const [dateFilter, setDateFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const [filterOptions, setFilterOptions] = useState({ regions: [], themes: [] });

  // 2) 날짜 필터 → SQL용 days 변환 (BookmarksPage와 동일)
  const daysLimit = useMemo(() => {
    if (dateFilter === '최근 1주') return 7;
    if (dateFilter === '최근 1달') return 30;
    return null;
  }, [dateFilter]);

  // 3) 좋아요 목록 로드
  const { items = [], hasMore, status, loadMore } = useLikedTrips({
    limit: 12,
    sort: sortBy,
    region: selectedRegion,
    theme: selectedTheme,
    days: daysLimit,
  });

  // 좋아요 리스트는 "좋아요 취소 시 목록에서 제거"가 필요 → 로컬 표시 목록 관리
  const [displayItems, setDisplayItems] = useState([]);

  // 훅 결과 → 로컬 표시 목록 동기화
  useEffect(() => {
    setDisplayItems(items);
  }, [items]);

  // 4) 무한 스크롤
  const { targetRef: sentinelRef } = useInfiniteScroll({
    onIntersect: loadMore,
    enabled: hasMore && status !== 'loading',
  });

  // 5) 필터 옵션 초기 로드
  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch((e) => console.error('필터 옵션 로딩 실패:', e));
  }, []);

  // =========================
  // 토글 핸들러 (BookmarksPage 방식 그대로)
  // =========================

  // 좋아요 토글: 끄면(취소되면) 이 페이지에서 사라져야 함
  const handleLikeClick = async (tripId) => {
    try {
      // 서비스 함수가 내부에서 RPC/테이블 처리함 (supabase 직접 호출 ❌)
      const { is_liked, like_count } = await toggleTripLike(tripId);

      // 좋아요 취소되면 리스트에서 제거
      if (!is_liked) {
        setDisplayItems((prev) => prev.filter((t) => t.id !== tripId));
        return;
      }

      // 혹시 true로 남는 케이스면 상태만 업데이트
      setDisplayItems((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, is_liked, like_count } : t))
      );
    } catch (e) {
      console.error('좋아요 토글 실패:', e);
    }
  };

  // 북마크 토글: 리스트에서 제거하지 않고 상태만 반영
  const handleBookmarkClick = async (tripId) => {
    try {
      const { is_bookmarked, bookmark_count } = await toggleTripBookmark(tripId);

      // 북마크는 이 페이지에서 카드 제거하지 않음(요구사항)
      setDisplayItems((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, is_bookmarked, bookmark_count } : t
        )
      );
    } catch (e) {
      console.error('북마크 토글 실패:', e);
    }
  };

  // =========================
  // 인증 분기
  // =========================
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // =========================
  // 렌더
  // =========================
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
        {status === 'loading' && displayItems.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="bookmarks-page__empty">
            <span style={{ fontSize: '3rem' }}>❤️</span>
            <h5 className="mt-3">좋아요한 여행이 없습니다</h5>
            <Button variant="link" onClick={() => navigate('/trips')} className="mt-2">
              여행 탐색하러 가기
            </Button>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-2">
            {displayItems.map((trip) => (
              <Col key={trip.id}>
                {/* 핵심: TripCard에 토글 핸들러 props 넘김 */}
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

        {/* 무한 스크롤 트리거 */}
        <div ref={sentinelRef} className="bookmarks-page__sentinel">
          {status === 'loading' && displayItems.length > 0 && (
            <Spinner animation="border" size="sm" variant="secondary" />
          )}
        </div>
      </Container>
      <FloatingActionGroup />
    </div>
  );
}
