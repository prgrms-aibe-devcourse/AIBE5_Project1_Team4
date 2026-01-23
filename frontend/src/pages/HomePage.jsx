import { useRef } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import TripCard from '../components/TripCard';

// 더미 데이터 (기존 유지)
const MOCK_TRIPS = [
  { id: 1, title: "제주도 식도락 여행 🍊", start_date: "2024-02-10", end_date: "2024-02-13", cover_image_url: "https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=500&auto=format&fit=crop&q=60", region: "제주", author_name: "여행자1", likes_count: 12, bookmarks_count: 5 },
  { id: 2, title: "부산 2박 3일 힐링 코스 🌊", start_date: "2024-03-01", end_date: "2024-03-03", cover_image_url: "https://images.unsplash.com/photo-1621845199676-787140c94609?w=500&auto=format&fit=crop&q=60", region: "부산", author_name: "BusanLover", likes_count: 24, bookmarks_count: 8 },
  { id: 3, title: "도쿄 벚꽃 여행 계획 🌸", start_date: "2024-04-05", end_date: "2024-04-09", cover_image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&auto=format&fit=crop&q=60", region: "도쿄", author_name: "J-Pop", likes_count: 45, bookmarks_count: 20 },
  { id: 4, title: "강릉 커피 투어 ☕", start_date: "2024-01-25", end_date: "2024-01-26", cover_image_url: "https://images.unsplash.com/photo-1627447186259-fc53907c6f09?w=500&auto=format&fit=crop&q=60", region: "강릉", author_name: "Coffee", likes_count: 8, bookmarks_count: 2 },
  { id: 5, title: "뉴욕 도심 탐방 🗽", start_date: "2024-05-10", end_date: "2024-05-17", region: "뉴욕", cover_image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=60", author_name: "NY_Lover", likes_count: 30, bookmarks_count: 12 },
  { id: 6, title: "파리 낭만 여행 🥖", start_date: "2024-06-01", end_date: "2024-06-07", region: "파리", cover_image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=60", author_name: "Bonjour", likes_count: 55, bookmarks_count: 22 },
  { id: 7, title: "방콕 먹방 투어 🍜", start_date: "2024-07-15", end_date: "2024-07-20", region: "방콕", cover_image_url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&q=60", author_name: "ThaiFood", likes_count: 18, bookmarks_count: 4 },
  { id: 8, title: "스위스 알프스 🏔️", start_date: "2024-08-10", end_date: "2024-08-18", region: "스위스", cover_image_url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&q=60", author_name: "Alps", likes_count: 40, bookmarks_count: 15 },
];

export default function HomePage() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
          .slider-btn {
            width: 40px; 
            height: 40px;
            border-radius: 50%;
            display: flex; 
            align-items: center; 
            justify-content: center;
            opacity: 0.9;
            transition: all 0.2s;
          }
          .slider-btn:hover {
            transform: scale(1.1);
            opacity: 1;
          }
        `}
      </style>

      {/* 1. Hero Section*/}
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

      {/* 2. Content Section */}
      <Container>
        {/* 섹션 헤더 */}
        <div className="d-flex justify-content-between align-items-end mb-4 px-2">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>🔥 지금 뜨는 여행 일정</h3>
            <p className="text-muted mb-0 small">다른 여행자들에게 가장 인기 있는 계획들을 모아봤어요.</p>
          </div>
          <Link to="/trips" className="text-decoration-none fw-bold small text-primary">
            전체보기 &rarr;
          </Link>
        </div>

        <Tabs defaultActiveKey="popular" className="mb-4 border-bottom-0" variant="pills">
          <Tab eventKey="popular" title="인기순">
            <div className="position-relative px-2">
              {/* 왼쪽 화살표 */}
              <Button 
                variant="white" 
                className="slider-btn position-absolute start-0 top-50 translate-middle-y shadow z-1"
                style={{ left: '-15px' }}
                onClick={() => scroll('left')}
              >
                ❮
              </Button>

              {/* 슬라이더 영역 */}
              <div 
                ref={scrollRef} 
                className="d-flex gap-4 overflow-auto py-3 px-1 hide-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                {MOCK_TRIPS.map(trip => (
                  <div key={trip.id} style={{ minWidth: '280px', maxWidth: '280px' }}>
                    {/* 카드에 그림자 효과 추가 */}
                    <div className="shadow-sm h-100 rounded overflow-hidden">
                      <TripCard trip={trip} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 오른쪽 화살표 */}
              <Button 
                variant="white" 
                className="slider-btn position-absolute end-0 top-50 translate-middle-y shadow z-1"
                style={{ right: '-15px' }}
                onClick={() => scroll('right')}
              >
                ❯
              </Button>
            </div>
          </Tab>

          <Tab eventKey="recent" title="최신순">
             <div className="text-center py-5 text-muted bg-light rounded-3 mt-3">
               <span className="fs-1 d-block mb-2">🐢</span>
               최신 여행 일정을 불러오는 중입니다...
             </div>
          </Tab>
        </Tabs>

        {/* 3. 하단 CTA 배너 (그라데이션 적용) */}
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
           
           {/* 배경 장식용 원 (디자인 요소) */}
           <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '300px', height: '300px', top: '-100px', left: '-100px' }}></div>
           <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '200px', height: '200px', bottom: '-50px', right: '-50px' }}></div>
        </div>
      </Container>
    </div>
  );
}