import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useTripDetail } from '../hooks/trips/useTripDetail';

import TripSummaryBar from '../components/trip-detail/TripSummaryBar';
import TripMapSection from '../components/trip-detail/TripMapSection';
import { TripReviewSection } from '../components/review';
import './TripDetailPage.css';

// 목록 페이지에서 사용 중인 토글 서비스 재사용 (supabase 직접 호출 ❌)
import { toggleTripLike, toggleTripBookmark } from '@/services/trips.service';

const EMPTY_SUMMARY = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  regions: [],
  themes: [],
  author: { name: '', avatar_url: null },
  like_count: 0,
  bookmark_count: 0,
  is_liked: false,
  is_bookmarked: false,
};

/**
 * 여행 상세 페이지 컴포넌트
 * URL 파라미터로 받은 ID를 이용해 여행 정보를 로드하고 화면에 표시합니다.
 */
const TripDetailPage = () => {
const { id } = useParams();
const [selectedId, setSelectedId] = useState(null);

  // 진입 시 스크롤 위치 초기화 (이전 페이지 스크롤 유지되는 이슈 대응)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 커스텀 훅을 통해 DB 데이터 로드 (요약 / 일정 / 멤버 / 리뷰 등 포함)
  const { tripData, loading, error } = useTripDetail(id);

  /**
   * SummaryBar에서 사용할 로컬 상태
   * - 서버 응답을 그대로 덮어쓰는 방식
   * - optimistic UI 사용 ❌
   */
  const [summaryState, setSummaryState] = useState(EMPTY_SUMMARY);

  /**
   * 서버에서 내려온 summary 데이터를
   * TripSummaryBar에서 사용하는 규격으로 정규화
   */
  const normalizedSummary = useMemo(() => {
    if (!tripData) return EMPTY_SUMMARY;

    const summaryPayload = tripData.summary ?? {};
    const trip = summaryPayload.trip ?? {};
    const author = summaryPayload.author ?? {};
    const counts = summaryPayload.counts ?? {};
    const viewer = summaryPayload.viewer ?? {}; // ✅ 여기 추가

    return {
      title: trip.title ?? '',
      description: trip.summary ?? '',
      start_date: trip.startDate ?? trip.start_date ?? '',
      end_date: trip.endDate ?? trip.end_date ?? '',
      regions: trip.regions ?? [],
      themes: trip.themes ?? [],
      author: {
        name: author.displayName ?? author.name ?? '',
        avatar_url: author.avatarUrl ?? author.avatar_url ?? null,
      },
      like_count: counts.likeCount ?? counts.like_count ?? 0,
      bookmark_count: counts.bookmarkCount ?? counts.bookmark_count ?? 0,

      //  초기 아이콘 상태 (서버 기준) - viewer에서 읽기
      is_liked: viewer.isLiked ?? viewer.is_liked ?? false,
      is_bookmarked: viewer.isBookmarked ?? viewer.is_bookmarked ?? false,
    };
  }, [tripData]);

  /**
   * tripData 로드 완료 시
   * SummaryBar 상태를 서버 응답 기준으로 동기화
   */
  useEffect(() => {
    setSummaryState(normalizedSummary);
  }, [normalizedSummary]);

  /**
   * 좋아요 토글
   * - 서버 RPC 응답 기준으로 상태 덮어쓰기
   */
  const handleLikeClick = async () => {
    if (!id) return;
    try {
      const { is_liked, like_count } = await toggleTripLike(id);
      setSummaryState((prev) => ({
        ...prev,
        is_liked,
        like_count,
      }));
    } catch (e) {
      console.error('상세 페이지 좋아요 토글 실패:', e);
    }
  };

  /**
   * 북마크 토글
   * - 서버 RPC 응답 기준으로 상태 덮어쓰기
   */
  const handleBookmarkClick = async () => {
    if (!id) return;
    try {
      const { is_bookmarked, bookmark_count } = await toggleTripBookmark(id);
      setSummaryState((prev) => ({
        ...prev,
        is_bookmarked,
        bookmark_count,
      }));
    } catch (e) {
      console.error('상세 페이지 북마크 토글 실패:', e);
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return <div className="text-center mt-5">로딩 중... ⏳</div>;
  }

  // 에러 / 데이터 없음 처리
  if (error || !tripData) {
    return <div className="text-center mt-5">데이터를 불러올 수 없습니다. 😢</div>;
  }

  return (
    <div className="trip-detail-page">
      {/* 상단 요약 바 영역 (제목, 작성자, 좋아요/북마크 등) */}
      <div className="trip-detail-header">
        <TripSummaryBar
          summary={summaryState}
          onLikeClick={handleLikeClick}
          onBookmarkClick={handleBookmarkClick}
        />
      </div>

      {/* 메인 바디 영역 (지도 및 일정 섹션) */}
      <div className="trip-detail-body">
        <TripMapSection
          schedules={tripData.schedule?.days}
          members={tripData.members?.members}
          selectedId={null}
          onScheduleClick={setSelectedId}
        />
      </div>

      {/* 리뷰 섹션 */}
      <Container className="py-4">
        <TripReviewSection tripId={id} />
      </Container>
    </div>
  );
};

export default TripDetailPage;