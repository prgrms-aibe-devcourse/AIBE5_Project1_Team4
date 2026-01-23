import { useState, useRef } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import TripCard from '../components/TripCard';

// ==============================================================================
// 1. 초기 데이터 설정 (Mock Data)
// 좋아요/북마크 상태 추적을 위해 isLiked, isBookmarked 필드가 포함
const MOCK_TRIPS = [
  { id: 1, title: "제주도 식도락 여행 🍊", description: "제주 맛집 완전 정복 코스", start_date: "2024-02-10", end_date: "2024-02-13", cover_image_url: "https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=500&q=60", region: "제주", author: { name: "여행자1" }, like_count: 12, bookmark_count: 5, member_count: 4, created_at: "2024-01-20T10:00:00", isLiked: false, isBookmarked: false },
  { id: 2, title: "부산 2박 3일 힐링 🌊", description: "바다 보며 물멍 때리기", start_date: "2024-03-01", end_date: "2024-03-03", cover_image_url: "https://images.unsplash.com/photo-1621845199676-787140c94609?w=500&q=60", region: "부산", author: { name: "BusanLover" }, like_count: 24, bookmark_count: 8, member_count: 2, created_at: "2024-01-25T14:30:00", isLiked: false, isBookmarked: false },
  { id: 3, title: "도쿄 벚꽃 여행 🌸", description: "봄바람 휘날리며", start_date: "2024-04-05", end_date: "2024-04-09", cover_image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=60", region: "도쿄", author: { name: "J-Pop" }, like_count: 45, bookmark_count: 20, member_count: 3, created_at: "2024-02-01T09:00:00", isLiked: false, isBookmarked: false },
  { id: 4, title: "강릉 커피 투어 ☕", description: "커피 향 가득한 여행", start_date: "2024-01-25", end_date: "2024-01-26", cover_image_url: "https://images.unsplash.com/photo-1627447186259-fc53907c6f09?w=500&q=60", region: "강릉", author: { name: "Coffee" }, like_count: 8, bookmark_count: 2, member_count: 2, created_at: "2024-02-10T11:20:00", isLiked: false, isBookmarked: false },
  { id: 5, title: "뉴욕 도심 탐방 🗽", description: "잠들지 않는 도시", start_date: "2024-05-10", end_date: "2024-05-17", region: "뉴욕", cover_image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=60", author: { name: "NY_Lover" }, like_count: 30, bookmark_count: 12, member_count: 1, created_at: "2024-02-15T16:45:00", isLiked: false, isBookmarked: false },
  { id: 6, title: "파리 낭만 여행 🥖", description: "에펠탑 아래 피크닉", start_date: "2024-06-01", end_date: "2024-06-07", region: "파리", cover_image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=60", author: { name: "Bonjour" }, like_count: 55, bookmark_count: 22, member_count: 2, created_at: "2024-02-20T10:00:00", isLiked: false, isBookmarked: false },
  { id: 7, title: "방콕 먹방 투어 🍜", description: "팟타이와 똠양꿍", start_date: "2024-07-15", end_date: "2024-07-20", region: "방콕", cover_image_url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&q=60", author: { name: "ThaiFood" }, like_count: 18, bookmark_count: 4, member_count: 4, created_at: "2024-02-25T12:00:00", isLiked: false, isBookmarked: false },
  { id: 8, title: "스위스 알프스 🏔️", description: "대자연 속으로", start_date: "2024-08-10", end_date: "2024-08-18", region: "스위스", cover_image_url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&q=60", author: { name: "Alps" }, like_count: 40, bookmark_count: 15, member_count: 2, created_at: "2024-03-01T09:00:00", isLiked: false, isBookmarked: false },
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
    <div className="mb-5 position-relative">
      {/* 섹션 헤더 (제목 + 더보기 링크) */}
      <div className="d-flex justify-content-between align-items-end mb-3 px-2">
        <div>
          <h4 className="fw-bold mb-1">{title}</h4>
          {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
        </div>
        <Link to="/trips" className="text-decoration-none text-dark fw-bold small">
          더보기 <ChevronRight size={16} style={{ display: 'inline', marginBottom: '2px' }}/>
        </Link>
      </div>

      {/* 슬라이더 영역 */}
      <div className="position-relative group">
        {/* 왼쪽 화살표 버튼 */}
        <Button 
          variant="light" 
          className="position-absolute start-0 top-50 translate-middle-y shadow-sm rounded-circle border z-1 d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px', left: '-20px' }}
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={24} color="#333" />
        </Button>

        {/* 카드 리스트 (가로 스크롤) */}
        <div 
          ref={scrollRef} 
          className="d-flex gap-3 overflow-auto py-2 px-1 hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {trips.map(trip => (
            <div key={trip.id} style={{ minWidth: '280px', maxWidth: '280px' }}>
              {/* [중요] TripCard에 데이터와 핸들러 함수 전달 (Props Drilling) */}
              <TripCard 
                trip={trip}
                onLikeClick={onLike}         // 카드에서 하트 누르면 실행될 함수
                onBookmarkClick={onBookmark} // 카드에서 북마크 누르면 실행될 함수
                isLiked={trip.isLiked}       // 현재 하트가 칠해져야 하는지?
                isBookmarked={trip.isBookmarked} // 현재 북마크가 칠해져야 하는지?
              />
            </div>
          ))}
        </div>

        {/* 오른쪽 화살표 버튼 */}
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
  // [상태 관리] 데이터가 변경되면 화면을 다시 그리기 위해 useState 사용
  const [trips, setTrips] = useState(MOCK_TRIPS);

  // [핸들러 1] 좋아요 버튼 로직
  // id에 해당하는 여행지를 찾아 좋아요 상태(true/false)를 뒤집고 숫자를 변경함
  const handleLike = (id) => {
    setTrips(prevTrips => prevTrips.map(trip => {
      if (trip.id === id) {
        const newIsLiked = !trip.isLiked;
        return {
          ...trip,
          isLiked: newIsLiked,
          like_count: newIsLiked ? trip.like_count + 1 : trip.like_count - 1
        };
      }
      return trip;
    }));
  };

  // [핸들러 2] 북마크 버튼 로직
  // id에 해당하는 여행지를 찾아 북마크 상태를 변경함
  const handleBookmark = (id) => {
    setTrips(prevTrips => prevTrips.map(trip => {
      if (trip.id === id) {
        const newIsBookmarked = !trip.isBookmarked;
        return {
          ...trip,
          isBookmarked: newIsBookmarked,
          bookmark_count: newIsBookmarked ? trip.bookmark_count + 1 : trip.bookmark_count - 1
        };
      }
      return trip;
    }));
  };

  // [로직] 최신순 정렬 (state인 trips가 변하면 이 변수도 자동으로 다시 계산됨)
  const recentTrips = [...trips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="pb-5 bg-white">
      {/* 스타일 정의 (스크롤바 숨김 등) */}
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
          <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill fw-light">Trip Planner</Badge>
          <h1 className="display-4 fw-bolder mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            당신의 다음 여행은 어디인가요?
          </h1>
          <p className="lead mb-4 opacity-75 fw-light">
            전 세계 여행자들의 일정을 참고하고, 나만의 완벽한 계획을 세워보세요.
          </p>
          
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <InputGroup size="lg" className="mb-3">
                <Form.Control 
                  placeholder="여행지, 태그, 키워드로 검색" 
                  className="search-input py-3"
                />
                <Button variant="primary" className="search-btn fw-bold">검색</Button>
              </InputGroup>
              <div className="d-flex gap-2 justify-content-center text-white-50 small">
                <span>추천:</span>
                <span className="text-white text-decoration-underline cursor-pointer">#제주도</span>
                <span className="text-white text-decoration-underline cursor-pointer">#오사카</span>
                <span className="text-white text-decoration-underline cursor-pointer">#유럽배낭여행</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* [중요] 모든 섹션에 '데이터'와 '핸들러 함수'를 함께 전달해야 합니다. */}
        
        {/* 1. 내 관심사 섹션 */}
        <TripSection 
          title="내 관심사에 맞는 여행지를 찾아보세요" 
          subtitle="무엇을 좋아하시나요? 다른 사용자가 만든 여행지를 확인해보세요."
          trips={trips} 
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        {/* 2. 인기 테마 섹션 */}
        <TripSection 
          title="인기 테마" 
          subtitle="트렌디한 테마 여행을 만나보세요"
          trips={[...trips].reverse()} 
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        {/* 3. 인기 여행지 섹션 */}
        <TripSection 
          title="인기 여행지" 
          subtitle="가장 많은 사랑을 받은 여행지입니다"
          trips={trips} 
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        {/* 4. 최신 여행지 섹션 (위에서 정렬한 recentTrips 사용) */}
        <TripSection 
          title="최근 등록된 여행지" 
          subtitle="방금 올라온 따끈따끈한 여행 계획들입니다."
          trips={recentTrips} 
          onLike={handleLike}
          onBookmark={handleBookmark}
        />

        {/* 하단 CTA 배너 */}
        <div 
          className="rounded-4 p-5 mt-5 text-center text-white position-relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 10px 20px rgba(118, 75, 162, 0.3)'
          }}
        >
           <div className="position-relative z-1">
             <h2 className="fw-bold mb-3">나만의 여행을 계획할 준비가 되셨나요?</h2>
             <p className="mb-4 opacity-90">복잡한 여행 준비, 친구들과 함께라면 더 쉽고 즐거워집니다.</p>
             <Button variant="light" size="lg" className="rounded-pill px-5 fw-bold text-primary shadow-sm" as={Link} to="/trips/new">
               여행 일정 만들기 ✨
             </Button>
           </div>
           
           <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '300px', height: '300px', top: '-100px', left: '-100px' }}></div>
           <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '200px', height: '200px', bottom: '-50px', right: '-50px' }}></div>
        </div>
      </Container>
    </div>
  );
}