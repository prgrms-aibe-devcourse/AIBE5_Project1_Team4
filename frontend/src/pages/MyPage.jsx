import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Settings, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Supabase 클라이언트 임포트 필수

// 분리한 컴포넌트들 Import
import ProfileCard from '../components/mypage/ProfileCard';
import StatGroup from '../components/mypage/StatGroup';
import RecentTrips from '../components/mypage/RecentTrips';
import StatDetailModal from '../components/mypage/StatDetailModal';

// API 서비스
import { getQuickStatsList } from '../services/profiles.service';

const MyPage = () => {
  // 1. 유저 정보를 담을 상태 (초기값 null)
  const [currentUser, setCurrentUser] = useState(null);
  const [modalData, setModalData] = useState({ show: false, title: '', type: '', list: [] });
  const [loading, setLoading] = useState(false);

  // 임시 통계 수치 (나중에 이 부분도 API로)
  const stats = { likes: 12, trips: 5, bookmarks: 8 };

  // 2. 페이지 로드 시 현재 로그인한 유저 정보 자동 가져오기
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Supabase에서 받은 실제 UUID와 이메일을 세팅함
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.full_name || '여행자',
          email: user.email
        });
      }
    };
    fetchSession();
  }, []);

  const handleStatClick = async (type, label) => {
    // 유저 정보가 없거나 '내 여행' 탭일 경우 실행 방지
    if (!currentUser?.id || type === 'trips') return; 

    setLoading(true);
    try {
      // 자동으로 가져온 currentUser.id(진짜 UUID)를 API에 전달함
      const data = await getQuickStatsList(currentUser.id, type);
      setModalData({ show: true, title: label, type, list: data || [] });
    } catch (error) {
      console.error("데이터 조회 실패:", error);
      alert("목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 유저 정보를 불러오기 전에는 빈 화면이나 로딩바를 보여줄 수 있어
  if (!currentUser) return <div className="text-center py-5">로그인 정보를 확인 중입니다...</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container className="py-5" style={{ maxWidth: '1000px' }}>
        <Row className="g-4">
          <Col lg={4}>
            {/* 이제 진짜 유저 데이터가 ProfileCard로 전달됨 */}
            <ProfileCard user={currentUser} />

            <Card className="border-0 shadow-sm overflow-hidden">
              <ListGroup variant="flush">
                <ListGroup.Item action className="d-flex align-items-center py-3">
                  <Settings size={18} className="me-3 text-muted" />
                  <span>계정 설정</span>
                </ListGroup.Item>
                <ListGroup.Item 
                  action 
                  className="d-flex align-items-center py-3 text-danger border-top"
                  onClick={() => supabase.auth.signOut()} // 로그아웃 기능도 연결!
                >
                  <LogOut size={18} className="me-3" />
                  <span>로그아웃</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          <Col lg={8}>
            <StatGroup stats={stats} onStatClick={handleStatClick} />
            <RecentTrips />
          </Col>
        </Row>
      </Container>

      <StatDetailModal 
        show={modalData.show} 
        onHide={() => setModalData({ ...modalData, show: false })}
        title={modalData.title}
        data={modalData.list}
        loading={loading}
      />
    </div>
  );
};

export default MyPage;