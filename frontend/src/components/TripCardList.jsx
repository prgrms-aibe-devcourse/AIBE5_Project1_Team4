import { Container, Row, Col, Spinner } from 'react-bootstrap';
import TripCard from './TripCard';
import SortBar from './SortBar';
import { useCallback, useState } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

/**
 * 여행 카드 리스트 컴포넌트
 * 기획서 기반: 공개된 여행들을 그리드로 표시하고 무한 스크롤을 지원.
 * - 반응형 그리드 (1, 2, 3, 4 열)
 * - 무한 스크롤
 * - 로딩, 빈 상태, 끝 상태 표시
 */
const TripCardList = ({
  trips = [],                           // 표시할 여행 데이터 배열 (여행 객체 리스트)
  isLoading = false,                    // 현재 데이터를 로딩 중인지 여부 (로딩 스피너 표시 여부)
  hasMore = false,                      // 더 불러올 데이터가 있는지 여부 (무한 스크롤 계속 여부)
  onLoadMore,                           // 무한 스크롤 트리거 시 호출되는 콜백 함수 (데이터 로드 함수)
  onCardClick,                          // 여행 카드 클릭 시 호출되는 콜백 함수 (상세 페이지 이동 등)
  onLikeClick,                          // 좋아요 버튼 클릭 시 호출되는 콜백 함수 (상태 토글)
  onBookmarkClick,                      // 북마크 버튼 클릭 시 호출되는 콜백 함수 (상태 토글)
  likedTripIds = [],                    // 사용자가 좋아요한 여행들의 ID 배열 (좋아요 상태 표시용)
  bookmarkedTripIds = [],               // 사용자가 북마크한 여행들의 ID 배열 (북마크 상태 표시용)
  emptyMessage = '여행 일정이 없습니다', // trips가 비어있을 때 표시할 메시지
  columns = 3,                          // 그리드 열의 개수 (1, 2, 3, 4 중 선택)
}) => {
  // ========================================================================
  // State 정의
  // ========================================================================
  // 현재 선택된 정렬 방식 ('latest' 또는 'popular')
  const [sortBy, setSortBy] = useState('latest');

  // ========================================================================
  // 무한 스크롤 훅
  // ========================================================================
  const { targetRef } = useInfiniteScroll({
    onIntersect: onLoadMore,
    enabled: hasMore && !isLoading && !!onLoadMore,
  });

  // ========================================================================
  // 핸들러 함수 정의
  // ========================================================================
  
  // 카드 클릭 핸들러
  // useCallback: 메모이제이션으로 부모 리렌더링 시에도 함수 재생성 방지
  const handleCardClick = useCallback((tripId) => {
    onCardClick?.(tripId);
  }, [onCardClick]);

  // 좋아요 클릭 핸들러
  // useCallback: 메모이제이션으로 부모 리렌더링 시에도 함수 재생성 방지
  const handleLikeClick = useCallback((tripId) => {
    onLikeClick?.(tripId);
  }, [onLikeClick]);

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  // 정렬된 여행 목록을 계산하는 함수
  const getSortedTrips = useCallback((tripsToSort) => {
    if (!Array.isArray(tripsToSort)) return [];
    
    const sorted = [...tripsToSort];
    if (sortBy === 'latest') {
      // 최신순: created_at 기준 내림차순
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
    } else if (sortBy === 'popular') {
      // 인기순: like_count 기준 내림차순
      sorted.sort((a, b) => {
        const likeA = a.like_count || 0;
        const likeB = b.like_count || 0;
        return likeB - likeA;
      });
    }
    return sorted;
  }, [sortBy]);

  // 정렬된 여행 목록
  const sortedTrips = getSortedTrips(trips);

  // ========================================================================
  // 반응형 그리드 설정 함수 및 계산된 값
  // ========================================================================
  
  // 반응형 그리드 열 수를 계산하는 함수
  // columns props에 따라 다른 Bootstrap 그리드 설정 반환
  // xs: 초소형(모바일), sm: 소형(태블릿), lg: 대형(데스크톱)
  const getColSize = () => {
    switch(columns) {
      case 1: return { xs: 12, sm: 12, lg: 12 }; // 1열: 화면 너비 전체
      case 2: return { xs: 12, sm: 6, lg: 6 };   // 2열: 데스크톱에서 50%
      case 3: return { xs: 12, sm: 6, lg: 4 };   // 3열: 데스크톱에서 33%
      case 4: return { xs: 12, sm: 6, lg: 3 };   // 4열: 데스크톱에서 25%
      default: return { xs: 12, sm: 6, lg: 4 };  // 기본값: 3열
    }
  };

  // getColSize() 함수 호출 결과를 캐시
  // 불필요한 재계산을 방지하기 위해 미리 변수에 저장
  const colSize = getColSize();

  return (
    // fluid: 화면 전체 너비 사용, py-5: 위아래 패딩
    <Container fluid className="py-5">
      {trips.length > 0 ? (
        <>
          {/* 정렬 바 */}
          <SortBar 
            sortBy={sortBy}
            onSortChange={handleSortChange}
            title="여행 일정"
          />

          {/* 여행 카드들을 그리드로 표시 */}
          <Row className="g-4 mb-5">
            {sortedTrips.map((trip) => (
              // Bootstrap Col: 반응형 열 구성요소
              <Col 
                key={trip.id}
                xs={colSize.xs}
                sm={colSize.sm}
                lg={colSize.lg}
              >
                {/* 개별 여행 카드 */}
                <TripCard
                  trip={trip}
                  onCardClick={handleCardClick}
                  onLikeClick={handleLikeClick}
                  onBookmarkClick={onBookmarkClick}
                  isLiked={likedTripIds.includes(trip.id)}
                  isBookmarked={bookmarkedTripIds.includes(trip.id)}
                />
              </Col>
            ))}
          </Row>

          {/* 무한 스크롤 트리거 요소 */}
          {/* 이 div가 화면에 보이면 onLoadMore 콜백이 호출됨 */}
          <div ref={targetRef} style={{ height: '100px' }} />

          {/* 로딩 중 표시 */}
          {isLoading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="text-center">
                <Spinner animation="border" role="status" variant="primary" />
                <p className="mt-3 text-muted">여행을 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* 더 이상 로드할 데이터가 없을 때 표시 */}
          {!hasMore && trips.length > 0 && (
            <div className="text-center py-5 text-muted">
              더 이상의 여행이 없습니다
            </div>
          )}
        </>
      ) : (
        // 여행 데이터가 없을 때의 빈 상태(Empty State) 표시
        <div className="text-center py-5">
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>
            🗺️
          </div>
          <p className="text-muted" style={{ fontSize: '18px' }}>
            {emptyMessage}
          </p>
        </div>
      )}
    </Container>
  );
};

export default TripCardList;
