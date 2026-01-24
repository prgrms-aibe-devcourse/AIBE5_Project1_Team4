/* eslint-disable */
import { useState, useRef, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Badge,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TripCard from '../components/trip/TripCard';
import TripFilterPanel from '../components/trip/TripFilterPanel';

// 좋아요/북마크 상태 추적을 위해 isLiked, isBookmarked 필드가 포함
// ==============================================================================
// 1. 초기 데이터 설정 (Mock Data)
// ==============================================================================
const MOCK_TRIPS = [
  // ✅ [T-4013] 필터링 테스트를 위해 'theme' 속성 추가 (기존 데이터 구조 유지)
  {
    id: 1,
    title: '제주도 식도락 여행 🍊',
    description: '제주 맛집 완전 정복 코스',
    start_date: '2024-02-10',
    end_date: '2024-02-13',
    cover_image_url:
      'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=500&q=60',
    region: '제주',
    theme: '미식',
    author: { name: '여행자1' },
    like_count: 12,
    bookmark_count: 5,
    member_count: 4,
    created_at: '2024-01-20T10:00:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    title: '부산 2박 3일 힐링 🌊',
    description: '바다 보며 물멍 때리기',
    start_date: '2024-03-01',
    end_date: '2024-03-03',
    cover_image_url:
      'https://images.unsplash.com/photo-1621845199676-787140c94609?w=500&q=60',
    region: '부산',
    theme: '힐링',
    author: { name: 'BusanLover' },
    like_count: 24,
    bookmark_count: 8,
    member_count: 2,
    created_at: '2024-01-25T14:30:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 3,
    title: '도쿄 벚꽃 여행 🌸',
    description: '봄바람 휘날리며',
    start_date: '2024-04-05',
    end_date: '2024-04-09',
    cover_image_url:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=60',
    region: '도쿄',
    theme: '관광',
    author: { name: 'J-Pop' },
    like_count: 45,
    bookmark_count: 20,
    member_count: 3,
    created_at: '2024-02-01T09:00:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 4,
    title: '강릉 커피 투어 ☕',
    description: '커피 향 가득한 여행',
    start_date: '2024-01-25',
    end_date: '2024-01-26',
    cover_image_url:
      'https://images.unsplash.com/photo-1627447186259-fc53907c6f09?w=500&q=60',
    region: '강릉',
    theme: '미식',
    author: { name: 'Coffee' },
    like_count: 8,
    bookmark_count: 2,
    member_count: 2,
    created_at: '2024-02-10T11:20:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 5,
    title: '뉴욕 도심 탐방 🗽',
    description: '잠들지 않는 도시',
    start_date: '2024-05-10',
    end_date: '2024-05-17',
    region: '뉴욕',
    theme: '관광',
    cover_image_url:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=60',
    author: { name: 'NY_Lover' },
    like_count: 30,
    bookmark_count: 12,
    member_count: 1,
    created_at: '2024-02-15T16:45:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 6,
    title: '파리 낭만 여행 🥖',
    description: '에펠탑 아래 피크닉',
    start_date: '2024-06-01',
    end_date: '2024-06-07',
    region: '파리',
    theme: '힐링',
    cover_image_url:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=60',
    author: { name: 'Bonjour' },
    like_count: 55,
    bookmark_count: 22,
    member_count: 2,
    created_at: '2024-02-20T10:00:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 7,
    title: '방콕 먹방 투어 🍜',
    description: '팟타이와 똠양꿍',
    start_date: '2024-07-15',
    end_date: '2024-07-20',
    region: '방콕',
    theme: '미식',
    cover_image_url:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&q=60',
    author: { name: 'ThaiFood' },
    like_count: 18,
    bookmark_count: 4,
    member_count: 4,
    created_at: '2024-02-25T12:00:00',
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 8,
    title: '스위스 알프스 🏔️',
    description: '대자연 속으로',
    start_date: '2024-08-10',
    end_date: '2024-08-18',
    region: '스위스',
    theme: '힐링',
    cover_image_url:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&q=60',
    author: { name: 'Alps' },
    like_count: 40,
    bookmark_count: 15,
    member_count: 2,
    created_at: '2024-03-01T09:00:00',
    isLiked: false,
    isBookmarked: false,
  },
];

// ==============================================================================
// 2. 여행 섹션 컴포넌트 (TripSection)
// ==============================================================================
// - 반복되는 UI(제목, 슬라이더, 카드 리스트)를 하나로 묶은 컴포넌트입니다.
// - 부모(HomePage)로부터 데이터(trips)와 함수(onLike, onBookmark)를 전달받습니다.
const TripSection = ({ title, subtitle, trips, onLike, onBookmark }) => {
  const scrollRef = useRef(null);

  // [기능] 좌우 스크롤 버튼 로직
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    /* 섹션 헤더 (제목 + 더보기 링크) */
    <div className="mb-5 position-relative">
      <div className="d-flex justify-content-between align-items-end mb-3 px-2">
        <div>
          <h4 className="fw-bold mb-1">{title}</h4>
          {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
        </div>
        <Link
          to="/trips"
          className="text-decoration-none text-dark fw-bold small"
        >
          더보기{' '}
          <ChevronRight
            size={16}
            style={{ display: 'inline', marginBottom: '2px' }}
          />
        </Link>
      </div>

      <div className="position-relative group">
        <Button
          variant="light"
          className="position-absolute start-0 top-50 translate-middle-y shadow-sm rounded-circle border z-1 d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px', left: '-20px' }}
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={24} color="#333" />
        </Button>

        <div
          ref={scrollRef}
          className="d-flex gap-3 overflow-auto py-2 px-1 hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div
                key={trip.id}
                style={{ minWidth: '280px', maxWidth: '280px' }}
              >
                <TripCard
                  trip={trip}
                  onLikeClick={onLike}
                  onBookmarkClick={onBookmark}
                  isLiked={trip.isLiked}
                  isBookmarked={trip.isBookmarked}
                />
              </div>
            ))
          ) : (
            // ✅ [T-4014] 필터링 결과가 없을 때 안내 메시지 표시
            <div className="w-100 text-center py-5 text-muted bg-light rounded-4">
              조건에 맞는 여행지가 없습니다. 🐢
            </div>
          )}
        </div>

        <Button
          variant="light"
          className="position-absolute end-0 top-50 translate-middle-y shadow-sm rounded-circle border z-1 d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px', right: '-20px' }}
          onClick={() => scroll('right')}
        >
          <ChevronRight size={24} color="#333" />
        </Button>
      </div>
    </div>
  );
};

// ==============================================================================
// 3. 메인 페이지 (HomePage)
// ==============================================================================
export default function HomePage() {
  const [trips, setTrips] = useState(MOCK_TRIPS);

  // ✅ [T-4012~4014] 통합 필터 상태 관리 (검색어, 지역, 테마, 기간)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTheme, setSelectedTheme] = useState('전체');
  const [dateFilter, setDateFilter] = useState('전체');

  // ✅ [T-4014] 통합 필터링 로직 구현 (useMemo 최적화)
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // 1. 키워드 검색
      const matchSearch = trip.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      // 2. 지역 필터
      const matchRegion =
        selectedRegion === '전체' || trip.region === selectedRegion;
      // 3. 테마 필터
      const matchTheme =
        selectedTheme === '전체' || trip.theme === selectedTheme;

      // 4. 기간 필터
      let matchDate = true;
      if (dateFilter !== '전체') {
        const now = new Date();
        const createdDate = new Date(trip.created_at);
        const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === '최근 1주') matchDate = diffDays <= 7;
        if (dateFilter === '최근 1달') matchDate = diffDays <= 30;
      }
      return matchSearch && matchRegion && matchTheme && matchDate;
    });
  }, [trips, searchTerm, selectedRegion, selectedTheme, dateFilter]);

  const handleLike = (id) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isLiked: !t.isLiked,
              like_count: !t.isLiked ? t.like_count + 1 : t.like_count - 1,
            }
          : t,
      ),
    );
  };

  const handleBookmark = (id) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isBookmarked: !t.isBookmarked,
              bookmark_count: !t.isBookmarked
                ? t.bookmark_count + 1
                : t.bookmark_count - 1,
            }
          : t,
      ),
    );
  };

  // ✅ [수정] 필터링된 결과(filteredTrips)를 기준으로 최신순 정렬
  const recentTrips = [...filteredTrips].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <div className="pb-5 bg-white">
      {/* CSS: 스크롤바 숨김 및 유틸리티 스타일 */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .hero-section {
            background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80);
            background-size: cover;
            background-position: center;
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .search-input {
            border-radius: 50px 0 0 50px;
            border: none;
            padding-left: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .search-btn {
            border-radius: 0 50px 50px 0;
            padding-right: 1.5rem;
            padding-left: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        `}
      </style>

      {/* Hero Section (상단 배너) */}
      <div className="hero-section mb-5">
        <Container className="text-center text-white">
          <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill fw-light">
            Trip Planner
          </Badge>
          <h1 className="display-4 fw-bolder mb-3">
            당신의 다음 여행은 어디인가요?
          </h1>

          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <InputGroup size="lg" className="mb-3">
                <Form.Control
                  placeholder="여행지, 태그, 키워드로 검색"
                  className="search-input py-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary" className="search-btn fw-bold">
                  검색
                </Button>
              </InputGroup>

              {/* ✅ [T-4012] 필터 패널 UI 렌더링 */}
              <TripFilterPanel
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Content Section */}
      <Container>
        {/* ✅ [수정] 모든 섹션에 원본(trips) 대신 필터링된 결과(filteredTrips) 전달 */}
        <TripSection
          title="내 관심사에 맞는 여행지를 찾아보세요"
          subtitle="무엇을 좋아하시나요?"
          trips={filteredTrips}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />
        <TripSection
          title="인기 테마"
          subtitle="트렌디한 테마 여행을 만나보세요"
          trips={[...filteredTrips].reverse()}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />
        <TripSection
          title="인기 여행지"
          subtitle="가장 많은 사랑을 받은 여행지입니다"
          trips={filteredTrips}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />
        <TripSection
          title="최근 등록된 여행지"
          subtitle="따끈따끈한 여행 계획들입니다."
          trips={recentTrips}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        <div
          className="rounded-4 p-5 mt-5 text-center text-white position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.3)',
          }}
        >
          <div className="position-relative z-1">
            <h2 className="fw-bold mb-3">
              나만의 여행을 계획할 준비가 되셨나요?
            </h2>
            <Button
              variant="light"
              size="lg"
              className="rounded-pill px-5 fw-bold text-primary shadow-sm"
              as={Link}
              to="/trips/new"
            >
              여행 일정 만들기 ✨
            </Button>
          </div>
          <div
            className="position-absolute rounded-circle bg-white opacity-10"
            style={{
              width: '300px',
              height: '300px',
              top: '-100px',
              left: '-100px',
            }}
          ></div>
          <div
            className="position-absolute rounded-circle bg-white opacity-10"
            style={{
              width: '200px',
              height: '200px',
              bottom: '-50px',
              right: '-50px',
            }}
          ></div>
        </div>
      </Container>
    </div>
  );
}
