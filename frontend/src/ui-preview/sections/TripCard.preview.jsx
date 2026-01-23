// ============================================================================
// TripCard 컴포넌트 UI 프리뷰
// ============================================================================
// 이 파일은 UI 시스템에서 TripCard 컴포넌트의 다양한 상태를 미리 볼 수 있습니다.
// 다양한 상황(이미지 있음/없음, 설명 있음/없음)에서 컴포넌트가 어떻게 보이는지 확인할 수 있습니다.

import { useState } from 'react';
import TripCard from '../../components/TripCard';

// ============================================================================
// 테스트용 샘플 여행 데이터
// ============================================================================
// 실제 Supabase에서 받을 데이터와 동일한 형식
const sampleTrip = {
  id: 'trip-1',
  title: '제주도 3박 4일 완벽 여행',
  description: '제주도의 숨은 명소들을 찾아다니는 힐링 여행입니다.',
  cover_image_url: 'https://images.unsplash.com/photo-1606214174585-fe31582dc1d6?w=500&h=300&fit=crop',
  start_date: '2026-02-15',
  end_date: '2026-02-18',
  region: '제주도',
  author: {
    id: 'user-1',
    name: '김여행',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  },
  like_count: 42,
  bookmark_count: 18,
  member_count: 2,
  visibility: 'public',
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
};

const TripCardPreview = () => {
  // 좋아요한 여행들의 ID를 저장하는 Set
  // Set을 사용하면 특정 ID 존재 여부를 O(1)의 빠른 속도로 확인 가능
  const [likedIds, setLikedIds] = useState(new Set());
  
  // 북마크한 여행들의 ID를 저장하는 Set
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // 좋아요 클릭 핸들러: 좋아요 상태를 토글 (좋아요 ↔ 좋아요 취소)
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

  // 북마크 클릭 핸들러: 북마크 상태를 토글 (북마크 ↔ 북마크 취소)
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
    // 그리드 레이아웃으로 3개의 카드 변형을 나란히 표시
    // auto-fit: 화면 크기에 따라 자동으로 열 개수 조정
    // minmax(300px, 1fr): 최소 300px, 최대 동등 너비
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {/* ===== 1번 변형: 기본 상태 (모든 요소 포함) ===== */}
      <div>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '12px', color: '#999' }}>기본 상태</h4>
        <TripCard
          trip={sampleTrip}
          onCardClick={(id) => console.log('클릭:', id)}
          onLikeClick={handleLikeClick}
          onBookmarkClick={handleBookmarkClick}
          isLiked={likedIds.has(sampleTrip.id)}
          isBookmarked={bookmarkedIds.has(sampleTrip.id)}
        />
      </div>

      {/* ===== 2번 변형: 이미지 없는 상태 ===== */}
      <div>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '12px', color: '#999' }}>이미지 없음</h4>
        <TripCard
          trip={{ ...sampleTrip, id: 'trip-2', cover_image_url: null }}
          onCardClick={(id) => console.log('클릭:', id)}
          onLikeClick={handleLikeClick}
          onBookmarkClick={handleBookmarkClick}
          isLiked={likedIds.has('trip-2')}
          isBookmarked={bookmarkedIds.has('trip-2')}
        />
      </div>

      {/* ===== 3번 변형: 설명 없는 상태 ===== */}
      <div>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '12px', color: '#999' }}>설명 없음</h4>
        <TripCard
          trip={{ ...sampleTrip, id: 'trip-3', description: null }}
          onCardClick={(id) => console.log('클릭:', id)}
          onLikeClick={handleLikeClick}
          onBookmarkClick={handleBookmarkClick}
          isLiked={likedIds.has('trip-3')}
          isBookmarked={bookmarkedIds.has('trip-3')}
        />
      </div>
    </div>
  );
}

TripCardPreview.meta = {
  title: 'Trip Card',
  order: 1,
};

export default TripCardPreview;
