import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { supabase } from '@/lib/supabaseClient';

import ProfileTripList from '@/components/mypage/ProfileTripList';

const MyPageFetchPreview = () => {
  const [userId, setUserId] = useState(null);
  const [activeType, setActiveType] = useState(null);

  // 1. 실제 로그인된 유저 ID 가져오기
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    checkUser();
  }, []);

  // 2. 타입 전환 함수
  const handleTypeChange = (type) => {
    if (!userId) {
      alert("로그인이 필요합니다!");
      return;
    }
    setActiveType(type);
  };

  return (
    <Container className="py-5 text-center">
      <h3 className="mb-4">MyPage API 조회 프리뷰 (개편 버전)</h3>
      
      <Card className="p-4 shadow-sm mb-4 border-0">
        <p className="text-muted mb-3">현재 유저 UUID: <code>{userId || '로그인 안됨'}</code></p>
        
        <div className="d-flex justify-content-center gap-3">
          <Button 
            variant={activeType === 'likes' ? "danger" : "outline-danger"} 
            onClick={() => handleTypeChange('likes')}
          >
            찜(Likes) 리스트 보기
          </Button>
          <Button 
            variant={activeType === 'bookmarks' ? "warning" : "outline-warning"} 
            onClick={() => handleTypeChange('bookmarks')}
          >
            북마크(Bookmarks) 리스트 보기
          </Button>
          <Button 
            variant={activeType === 'trips' ? "primary" : "outline-primary"} 
            onClick={() => handleTypeChange('trips')}
          >
            내 여행(Trips) 리스트 보기
          </Button>
        </div>
      </Card>

      {/* ✅ 삭제된 StatDetailModal 대신, 실제 서비스에서 사용하는 리스트 컴포넌트 출력 */}
      {activeType ? (
        <div className="text-start mt-4 p-3 bg-white rounded shadow-sm">
          <ProfileTripList key={activeType} type={activeType} />
        </div>
      ) : (
        <div className="py-5 text-muted border rounded dashed">
          위 버튼을 눌러 실제 API 데이터가 어떻게 나오는지 확인하세요.
        </div>
      )}
      
      <p className="small text-secondary mt-3">
        * StatDetailModal은 제거되었으며, 이제 ProfileTripList를 통해 실제 UI와 동일한 데이터를 조회합니다.
      </p>
    </Container>
  );
};

export default MyPageFetchPreview;