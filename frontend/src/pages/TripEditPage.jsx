import React, { useState } from 'react';
import { Container, Row, Col, Button, Nav, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Share2, Users, Lock, Calendar, 
  ChevronLeft, ChevronRight, Search 
} from 'lucide-react';

// 👇 [NEW] 아까 만든 PlaceItem 컴포넌트 가져오기
import PlaceItem from '../components/places/PlaceItem';
import ScheduleItem from '../components/trips/ScheduleItem';

// 더미 데이터: 일정 목록
const DUMMY_SCHEDULE = [
  { id: 1, startTime: '09:00:00', placeName: '서울역', category: 'transport', memo: '서울 중구 한강대로 405' },
  { id: 2, startTime: '10:30:00', placeName: '성수 카페', category: 'cafe', memo: null },
  { id: 3, startTime: '13:00:00', placeName: '점심 식사', category: 'food', memo: '유명한 맛집 웨이팅 있음' },
];

// 👇 [NEW] 더미 데이터: 검색 결과 (PlaceItem에 전달될 데이터)
const DUMMY_SEARCH_RESULTS = [
  { 
    id: 101, 
    place_name: '서울역', 
    road_address_name: '서울 중구 한강대로 405', 
    category_group_name: '기차역', 
    place_url: 'https://map.kakao.com' 
  },
  { 
    id: 102, 
    place_name: '스타벅스 서울역점', 
    road_address_name: '서울 중구 한강대로 405', 
    category_group_name: '카페', 
    place_url: 'https://map.kakao.com' 
  },
  { 
    id: 103, 
    place_name: '맥도날드 서울역점', 
    road_address_name: '서울 중구 한강대로 405', 
    category_group_name: '패스트푸드', 
    place_url: 'https://map.kakao.com' 
  },
];

const TripEditPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'group'

  // 장소 추가 핸들러 (임시)
  const handleAddPlace = (place) => {
    console.log('장소 추가됨:', place);
    alert(`"${place.place_name}"이(가) 추가되었습니다!(구현예정)`);
  };

  return (
    <Container fluid className="d-flex flex-column h-100 p-0">
      
      {/* 1. [Sub Header] 여행 정보 및 제어 바 */}
      <Row className="g-0 border-bottom bg-white py-2 flex-shrink-0">
        <Col className="d-flex align-items-center px-4 justify-content-between">
          
          {/* 왼쪽: 타이틀 & 날짜 */}
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="m-0 fw-bold">서울 2박 3일 먹방 여행</h4>
              <Badge bg="light" text="dark" className="border border-secondary fw-normal">
                <Lock size={12} className="me-1"/> 비공개
              </Badge>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <Calendar size={14} /> 2025.12.01 - 2025.12.04
            </div>
          </div>

          {/* 오른쪽: 버튼 그룹 */}
          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" className="d-flex align-items-center gap-2">
              <Users size={16} /> 구성원 보기
            </Button>
            <Button variant="outline-dark" size="sm" className="d-flex align-items-center gap-2">
              <Share2 size={16} /> 공유하기
            </Button>
            <Button variant="dark" size="sm" onClick={() => navigate('/trips/1')}>
              <Save size={16} className="me-2"/> 저장됨
            </Button>
          </div>
        </Col>
      </Row>

      {/* 2. [Main Content] 3단 레이아웃 */}
      <Row className="flex-grow-1 g-0 overflow-hidden">
        
        {/* (1) 왼쪽: 장소 검색 패널 */}
        <Col lg={3} className="d-none d-lg-flex flex-column border-end bg-white h-100">
          
          {/* 검색창 헤더 (보라색 배경) */}
          <div className="p-3 bg-primary text-white">
            <div className="position-relative">
              <Search className="position-absolute text-muted" size={18} style={{ top: '10px', left: '12px' }} />
              <input 
                type="text" 
                className="form-control ps-5 border-0" 
                placeholder="장소 검색" 
                style={{ height: '40px' }}
              />
            </div>
          </div>

          {/* 👇 [변경됨] 검색 결과 리스트 (PlaceItem 적용) */}
          <div className="flex-grow-1 p-0 overflow-auto">
            {DUMMY_SEARCH_RESULTS.map((place) => (
              <PlaceItem 
                key={place.id} 
                place={place} 
                onAdd={handleAddPlace} 
              />
            ))}

            <div className="text-center text-muted small mt-4 pb-4">
              검색 결과 더보기...
            </div>
          </div>
        </Col>

        {/* (2) 중앙: 지도 영역 */}
        <Col lg={5} className="h-100 position-relative bg-light">
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
            <div className="text-center">
              <h3>🗺️ Map Area</h3>
              <p>지도가 표시될 영역입니다.</p>
            </div>
          </div>
        </Col>

        {/* (3) 오른쪽: 일정 패널 */}
        <Col lg={4} className="d-flex flex-column border-start bg-white h-100 shadow-sm">
          
          {/* 탭 버튼 */}
          <div className="p-3 pb-0">
             <Nav variant="pills" className="bg-light p-1 rounded mb-3">
               <Nav.Item className="w-50">
                 <Nav.Link 
                    active={activeTab === 'schedule'} 
                    onClick={() => setActiveTab('schedule')}
                    className={activeTab === 'schedule' ? 'bg-primary text-white text-center fw-bold' : 'text-center text-muted'}
                 >
                   📅 일정
                 </Nav.Link>
               </Nav.Item>
               <Nav.Item className="w-50">
                 <Nav.Link 
                    active={activeTab === 'group'} 
                    onClick={() => setActiveTab('group')}
                    className={activeTab === 'group' ? 'bg-primary text-white text-center fw-bold' : 'text-center text-muted'}
                 >
                   👥 그룹
                 </Nav.Link>
               </Nav.Item>
             </Nav>
          </div>

          {/* Day 네비게이션 & 리스트 */}
          {activeTab === 'schedule' && (
            <div className="d-flex flex-column flex-grow-1 overflow-hidden">
               <div className="d-flex align-items-center justify-content-center py-2 border-bottom">
                 <Button variant="link" className="text-dark p-0"><ChevronLeft /></Button>
                 <div className="text-center mx-3">
                   <h5 className="m-0 fw-bold">Day 1</h5>
                   <small className="text-muted">2025.12.01</small>
                 </div>
                 <Button variant="link" className="text-dark p-0"><ChevronRight /></Button>
               </div>

               {/* 일정 리스트 (ScheduleItem) */}
               <div className="flex-grow-1 p-3 overflow-auto">
                 {DUMMY_SCHEDULE.map((item) => (
                   <ScheduleItem key={item.id} item={item} />
                 ))}
                 <Button variant="outline-primary" className="w-100 py-2 border-dashed mt-2">
                   + 일정 추가
                 </Button>
               </div>
               
               <div className="p-2 border-top text-center text-muted small bg-light">
                 총 5곳 · 예상 이동 1시간 20분
               </div>
            </div>
          )}

          {/* 그룹 탭 */}
          {activeTab === 'group' && (
            <div className="d-flex flex-column flex-grow-1 p-4 align-items-center justify-content-center text-muted">
               <Users size={48} className="mb-3 opacity-50"/>
               <p>친구를 초대하여 함께 계획을 세워보세요!</p>
               <Button variant="dark">초대하기</Button>
            </div>
          )}

        </Col>

      </Row>
    </Container>
  );
};

export default TripEditPage;