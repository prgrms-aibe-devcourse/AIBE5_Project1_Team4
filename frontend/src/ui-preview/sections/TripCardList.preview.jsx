// ============================================================================
// TripCardList 컴포넌트 UI 프리뷰
// ============================================================================
// 이 파일은 UI 시스템에서 TripCardList 컴포넌트의 다양한 상태를 미리 볼 수 있습니다.
// - 무한 스크롤이 동작하는 정상 상태
// - 로딩 상태
// - 데이터가 없는 빈 상태(Empty State)
// 
// 프리뷰에서는 setTrips로 여행 목록을 관리하고, 
// observerTarget을 트리거하면 handleLoadMore가 실행되어 더 많은 데이터를 로드합니다.

import { useState } from 'react';
import TripCardList from '../../components/TripCardList';

// ============================================================================
// 모의(Mock) 여행 데이터 생성 함수
// ============================================================================
// 테스트용으로 무작위 여행 데이터를 생성합니다.
// 
// @param count {number} - 생성할 여행의 개수
// @param offset {number} - 여행 ID의 시작 번호 (무한 스크롤 테스트 시 이전 데이터와의 ID 중복 방지)
// @returns {Array} - 생성된 여행 객체 배열
const generateMockTrips = (count, offset = 0) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `trip-${offset + i}`,
    title: `${['서울', '부산', '제주', '강릉', '남해'][Math.floor(Math.random() * 5)]} 여행 ${offset + i + 1}`,
    description: `이것은 여행 일정 ${offset + i + 1}의 설명입니다. 멋진 여행지를 소개합니다!`,
    cover_image_url: `https://images.unsplash.com/photo-${1600000000000 + offset + i}?w=500&h=300&fit=crop`,
    start_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    region: ['서울', '부산', '제주', '강릉', '인천'][Math.floor(Math.random() * 5)],
    author: {
      id: `user-${i}`,
      name: `사용자 ${i + 1}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${offset + i}`,
    },
    like_count: Math.floor(Math.random() * 100),
    bookmark_count: Math.floor(Math.random() * 50),
    member_count: Math.floor(Math.random() * 5) + 1,
    visibility: 'public',
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const TripCardListPreview = () => {
  // ========================================================================
  // 상태 관리
  // ========================================================================
  
  // 좋아요한 여행들의 ID를 저장하는 Set
  // Set을 사용하면 특정 ID 존재 여부를 O(1)의 빠른 속도로 확인 가능
  const [likedIds, setLikedIds] = useState(new Set());
  
  // 북마크한 여행들의 ID를 저장하는 Set
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  
  // 현재 데이터 로딩 중인지 표시
  const [isLoading, setIsLoading] = useState(false);
  
  // 현재 표시할 여행 목록
  const [trips, setTrips] = useState(generateMockTrips(12)); // 초기: 12개
  
  // 더 불러올 데이터가 있는지 표시 (무한 스크롤 계속 여부)
  const [hasMore, setHasMore] = useState(true);

  // ========================================================================
  // 무한 스크롤 로드 핸들러
  // ========================================================================
  // 사용자가 페이지 하단에 도달했을 때 호출됨
  // 실제 환경에서는 여기서 API를 호출하여 데이터를 가져옴
  const handleLoadMore = () => {
    setIsLoading(true);
    // 1초 딜레이: 실제 API 호출의 시간 지연을 시뮬레이션
    setTimeout(() => {
      const newTrips = generateMockTrips(12, trips.length); // 새로운 12개 생성
      setTrips((prev) => [...prev, ...newTrips]);           // 기존 데이터에 추가
      setIsLoading(false);
      
      // 총 36개 이상 로드되었으면 더 이상 데이터 없음으로 표시
      // (무한 스크롤 무한 반복 방지)
      if (trips.length + 12 >= 36) {
        setHasMore(false);
      }
    }, 1000);
  };

  // ========================================================================
  // 좋아요 클릭 핸들러
  // ========================================================================
  // 좋아요 상태를 토글 (좋아요 ↔ 좋아요 취소)
  const handleLikeClick = (tripId) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId); // 이미 좋아요한 상태면 제거
      } else {
        newSet.add(tripId);    // 좋아요하지 않은 상태면 추가
      }
      return newSet;
    });
  };

  // ========================================================================
  // 북마크 클릭 핸들러
  // ========================================================================
  // 북마크 상태를 토글 (북마크 ↔ 북마크 취소)
  const handleBookmarkClick = (tripId) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId); // 이미 북마크한 상태면 제거
      } else {
        newSet.add(tripId);    // 북마크하지 않은 상태면 추가
      }
      return newSet;
    });
  };

  return (
    // minHeight: 200vh: 무한 스크롤을 테스트하기 위해 충분히 긴 높이 설정
    <div style={{ minHeight: '200vh' }}>
      {/* ===== 메인 프리뷰: 무한 스크롤이 동작하는 3열 그리드 ===== */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ marginBottom: '12px' }}>데스크톱 (3열) - 무한 스크롤</h4>
        <TripCardList
          trips={trips}                    // 현재 표시할 여행 목록
          isLoading={isLoading}            // 로딩 중 여부
          hasMore={hasMore}                // 더 로드할 데이터 있는지
          onLoadMore={handleLoadMore}      // 무한 스크롤 트리거 시 호출
          onCardClick={(id) => console.log('카드 클릭:', id)}
          onLikeClick={handleLikeClick}    // 좋아요 클릭 시 호출
          onBookmarkClick={handleBookmarkClick} // 북마크 클릭 시 호출
          likedTripIds={Array.from(likedIds)}       // 좋아요한 여행 ID 배열로 변환
          bookmarkedTripIds={Array.from(bookmarkedIds)} // 북마크한 여행 ID 배열로 변환
          columns={3}                      // 3열 그리드
        />
      </div>

      {/* 구분선 */}
      <hr style={{ margin: '64px 0' }} />

      {/* ===== 빈 상태(Empty State) 프리뷰 ===== */}
      <div>
        <h4 style={{ marginBottom: '12px' }}>빈 상태</h4>
        <TripCardList
          trips={[]}                       // 빈 배열: 데이터 없음
          isLoading={false}
          hasMore={false}
          onLoadMore={() => {}}
          onCardClick={(id) => console.log('카드 클릭:', id)}
          onLikeClick={(id) => console.log('좋아요:', id)}
          onBookmarkClick={(id) => console.log('찜:', id)}
          likedTripIds={[]}
          bookmarkedTripIds={[]}
          emptyMessage="여행 일정이 없습니다 😢" // 커스텀 메시지
          columns={3}
        />
      </div>
    </div>
  );
};

TripCardListPreview.meta = {
  title: 'Trip Card List',
  order: 2,
};

export default TripCardListPreview;
