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
import FloatingActionGroup from '@/components/common/FloatingActionGroup';

// 📡 DB 조회를 위한 공통 서비스 함수
import { getQuickStatsList } from '../services/profiles.service';
import { listLikedTrips, listMyTrips } from '../services/trips.service';

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
   * 📊 통계 카드 클릭 시 상세 리스트 모달 오픈 (Likes 패턴과 100% 일치)
   */
  const handleStatClick = async (title, type) => {
    if (!currentUser) return;
    setModal({ show: true, title, list: [], loading: true });

    try {
      let result;
      
      // 1. 타입에 따른 RPC 호출
      if (type === 'likes') {
        result = await listLikedTrips({ limit: 5 });
      } else if (type === 'trips') {
        result = await listMyTrips({ limit: 5 }); // ✅ 이제 400 에러 없이 호출됩니다.
      } else {
        // 북마크 등 기타 처리
        result = await getQuickStatsList(currentUser.id, type);
      }

      // 2. 데이터 가공 (mapRowToCard에서 이미 summary -> description으로 바뀜)
      // 찜(Likes)에서 쓰신 trip.summary 대신 trip.description을 써야 실제 내용이 나옵니다.
      const rawItems = Array.isArray(result) ? result : (result?.items || []);
      
      const data = rawItems.map(trip => ({
        id: trip.id,
        title: trip.title,
        // DB의 summary가 NULL이면 날짜를 대신 보여주어 UI 보강
        description: trip.description || (trip.start_date ? `${trip.start_date} ~ ${trip.end_date}` : '상세 정보가 없습니다.'),
        date: `${trip.start_date} ~ ${trip.end_date}`
      }));

      setModal({ show: true, title, list: data, loading: false });
    } catch (error) {
      console.error(`${title} 조회 실패:`, error);
      setModal({ show: true, title, list: [], loading: false });
    }
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
        loading={modal.loading}
      />
      <FloatingActionGroup />
    </div>
    
  );
};

export default MyPage;