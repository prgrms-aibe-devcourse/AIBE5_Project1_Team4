import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '@/lib/supabaseClient';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { LogOut } from 'lucide-react'; 

// 🧱 마이페이지를 구성하는 독립된 컴포넌트들
import ProfileCard from '../components/mypage/ProfileCard';
import StatGroup from '../components/mypage/StatGroup';
import ProfileTripList from '../components/mypage/ProfileTripList'; // ✅ RecentTrips 대신 동적 리스트 사용
import FloatingActionGroup from '@/components/common/FloatingActionGroup';


const MyPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // 🔢 상단 카드의 실시간 수치를 관리하는 상태
  const [stats, setStats] = useState({ likes: 0, trips: 0, bookmarks: 0 });
  
  // 📍 탭 상태 관리 (모달 상태 제거 후 추가)
  const [activeTab, setActiveTab] = useState('trips');

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
      try {
        // ⚡️ 중요: 데이터를 가져오지 않고(head: true), 숫자만 정확히 세어옴(count: 'exact')
        const [likesCount, tripsCount, bookmarksCount] = await Promise.all([
          supabase.from('trip_likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('trips').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('trip_bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        setStats({
          // .length 대신 .count를 사용합니다.
          likes: likesCount.count || 0, 
          trips: tripsCount.count || 0,    // ✅ 이제 5를 넘어 10, 20 등 실제 전체 개수가 표시됩니다.
          bookmarks: bookmarksCount.count || 0
        });
      } catch (error) {
        console.error("실시간 수치 로드 실패:", error);
      }
        }
      };
      loadUserDataAndStats();
    }, []);

  /**
   * 📊 통계 카드 클릭 시 리스트 영역 전환 (모달 대신 탭 전환으로 변경)
   */
  const handleStatClick = (title, type) => {
    setActiveTab(type); // 탭 상태만 변경하여 하단 리스트 교체
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
            {/* 📈 실시간 통계 영역 (클릭 시 하단 리스트 전환) */}
            <StatGroup 
              stats={stats} 
              onStatClick={(title, type) => handleStatClick(title, type)} 
            />
            
            {/* ✈️ 동적 여행 목록 영역 (RecentTrips 대체) */}
            <div className="mt-4">
              {/* key를 통해 탭 변경 시 컴포넌트를 새로 고침하여 데이터를 다시 로드함 */}
              <ProfileTripList key={activeTab} type={activeTab} />
            </div>
          </Col>
        </Row>
      </Container>

      <FloatingActionGroup />
    </div>
    
  );
};

export default MyPage;