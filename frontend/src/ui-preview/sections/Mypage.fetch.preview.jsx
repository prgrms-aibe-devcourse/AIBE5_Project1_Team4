import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { supabase } from '@/lib/supabaseClient';

// 우리가 만든 컴포넌트와 API 서비스 임포트// 
import StatDetailModal from '../../components/mypage/StatDetailModal';
import { getQuickStatsList } from '../../services/profiles.service';
const MyPageFetchPreview = () => {
  const [userId, setUserId] = useState(null);
  const [modal, setModal] = useState({ show: false, title: '', type: '', list: [] });
  const [loading, setLoading] = useState(false);

  // 1. 실제 로그인된 유저 ID 가져오기
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    checkUser();
  }, []);

  // 2. API 호출 테스트 함수
  const testFetch = async (type, label) => {
    if (!userId) {
      alert("로그인이 필요합니다!");
      return;
    }

    setLoading(true);
    console.log(`[Preview] ${label} 데이터 조회 시작...`);
    
    try {
      const data = await getQuickStatsList(userId, type);
      console.log(`[Preview] 조회 결과:`, data);
      setModal({ show: true, title: label, type, list: data || [] });
    } catch (error) {
      console.error("[Preview] 에러 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 text-center">
      <h3 className="mb-4">MyPage API 조회 프리뷰</h3>
      
      <Card className="p-4 shadow-sm mb-4 border-0">
        <p className="text-muted mb-3">현재 유저 UUID: <code>{userId || '로그인 안됨'}</code></p>
        
        <div className="d-flex justify-content-center gap-3">
          <Button variant="outline-danger" onClick={() => testFetch('likes', '찜 목록')}>
            찜(Likes) 조회 테스트
          </Button>
          <Button variant="outline-warning" onClick={() => testFetch('bookmarks', '북마크 목록')}>
            북마크(Bookmarks) 조회 테스트
          </Button>
        </div>
      </Card>

      {/* 우리가 만든 모달 컴포넌트 검증 */}
      <StatDetailModal 
        show={modal.show} 
        onHide={() => setModal({ ...modal, show: false })}
        title={modal.title}
        data={modal.list}
        loading={loading}
      />
      
      <p className="small text-secondary mt-3">
        * 버튼을 눌렀을 때 콘솔창과 모달의 리스트를 확인하세요.
      </p>
    </Container>
  );
};

export default MyPageFetchPreview;