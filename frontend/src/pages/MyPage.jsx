import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '@/lib/supabaseClient';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { LogOut } from 'lucide-react'; 

// 🧱 마이페이지를 구성하는 독립된 컴포넌트들
import ProfileCard from '../components/mypage/ProfileCard';
import StatGroup from '../components/mypage/StatGroup';
import RecentTrips from '../components/mypage/RecentTrips';
import StatDetailModal from '../components/mypage/StatDetailModal';

// 📡 DB 조회를 위한 공통 서비스 함수
import { getQuickStatsList } from '../services/profiles.service';

const MyPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // 🔢 상단 카드의 실시간 수치를 관리하는 상태
  const [stats, setStats] = useState({ likes: 0, trips: 0, bookmarks: 0 });
  
  // 🔍 상세 목록 모달의 노출 상태와 데이터를 관리하는 상태
  const [modal, setModal] = useState({ show: false, title: '', list: [] });

  /**
   * 컴포넌트 마운트 시 유저 정보 및 초기 실시간 수치 로드
   */
  useEffect(() => {
    const loadUserDataAndStats = async () => {
      // 1. Supabase에서 현재 세션 유저 정보 획득
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. 유저 정보 설정 (피드백 반영: 카톡 프사 등 소셜 이미지 연동)
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.full_name || '여행자',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null 
        });

        // 3. ⚡️ 실시간 DB 데이터 개수(Count) 반영 로직
        try {
          // DB에서 실제 저장된 리스트를 가져와서 길이를 기반으로 숫자 세팅
          const likesData = await getQuickStatsList(user.id, 'likes');
          const bookmarksData = await getQuickStatsList(user.id, 'bookmarks');
          
          setStats({
            likes: likesData ? likesData.length : 0, 
            trips: 0, // 피드백 반영: '내 여행' 카운트 로직은 추후 확장 예정
            bookmarks: bookmarksData ? bookmarksData.length : 0
          });
        } catch (error) {
          console.error("실시간 수치 로드 실패:", error);
        }
      }
    };
    loadUserDataAndStats();
  }, []);

  /**
   * 📊 통계 카드(찜/북마크) 클릭 시 상세 리스트 모달 오픈
   * @param {string} title - 모달 상단에 표시할 한글 제목 (예: 찜)
   * @param {string} type - DB 조회를 위한 영어 타입 (예: likes)
   */
  const handleStatClick = async (title, type) => {
    if (!currentUser) return;
    
    // 클릭한 시점에 최신 리스트를 다시 조회하여 모달에 전달
    const data = await getQuickStatsList(currentUser.id, type);
    setModal({
      show: true,
      title: title,
      list: data || []
    });
  };

  /**
   * 🚪 로그아웃 처리 핸들러
   * 세션 종료 후 피드백대로 메인/로그인 페이지로 네비게이션 처리
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/login');
  };

  // 유저 정보를 불러오기 전까지 빈 화면 처리
  if (!currentUser) return null;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container className="py-5" style={{ maxWidth: '1000px' }}>
        <Row className="g-4">
          <Col lg={4}>
            {/* 👤 유저 프로필 카드 (프사 및 기본 정보 표시) */}
            <ProfileCard user={currentUser} />
            
            {/* ⚙️ 사이드바 (피드백 반영: '계정 설정' 제거 후 로그아웃만 유지) */}
            <Card className="border-0 shadow-sm overflow-hidden mt-3">
              <ListGroup variant="flush">
                <ListGroup.Item 
                  action 
                  className="d-flex align-items-center py-3 text-danger" 
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="me-3" />
                  <span>로그아웃</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          
          <Col lg={8}>
            {/* 📈 실시간 통계 영역 (클릭 시 모달 열림) */}
            <StatGroup 
              stats={stats} 
              onStatClick={(title, type) => handleStatClick(title, type)} 
            />
            
            {/* ✈️ 최근 여행 목록 영역 */}
            <RecentTrips />
          </Col>
        </Row>
      </Container>

      {/* 팝업 모달: 상세 찜/북마크 목록 표시 */}
      <StatDetailModal 
        show={modal.show} 
        onHide={() => setModal({ ...modal, show: false })}
        title={modal.title}
        data={modal.list}
      />
    </div>
  );
};

export default MyPage;