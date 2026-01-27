import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

// 기능 및 인증 관련 훅
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { assertTripEditor } from '@/services/trips.service';

// UI 및 유틸리티
import { alert } from '@/shared/ui/overlay'; // 예쁜 커스텀 알림창
import { supabase } from '../lib/supabaseClient'; 

// 컴포넌트 및 스타일
import TripCreateView from '../components/trip-create/TripCreateView';
import './trip-create.css';

const TripCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, loading } = useAuth();

  // -------------------------------------------------------------------------
  // [1] 여행 ID 파싱 (URL 파라미터 vs 쿼리스트링)
  // -------------------------------------------------------------------------
  // URL 경로(/trips/:id)에 ID가 있으면 그걸 쓰고, 없으면 쿼리스트링(?tripId=...) 사용
  const { id: paramsId } = useParams(); 
  const tripId = paramsId || searchParams.get('tripId'); 

  const [accessStatus, setAccessStatus] = useState('checking');

  // -------------------------------------------------------------------------
  // [2] 로그인 여부 체크
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (loading) return;
    if (!user) {
      // 비로그인 시 현재 주소 저장 후 로그인 페이지로 리다이렉트
      setReturnToIfEmpty(location.pathname + location.search);
      navigate('/login', { replace: true });
    }
  }, [loading, user, location.pathname, location.search, navigate]);

  // -------------------------------------------------------------------------
  // [3] 편집 권한 체크 (Trip ID가 존재할 경우)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    
    // 새 여행 작성 중이라 ID가 아직 없다면 권한 체크 패스
    if (!tripId) {
      setAccessStatus('allowed');
      return;
    }

    let isMounted = true;

    const checkAccess = async () => {
      try {
        // 서버에 편집 권한(owner/editor)이 있는지 확인
        await assertTripEditor({ tripId });
        if (isMounted) setAccessStatus('allowed');
      } catch (error) {
        if (!isMounted) return;
        setAccessStatus('denied');
        await alert({
          title: '편집 권한이 없습니다',
          text: '여행 생성자(owner) 또는 편집자(editor)만 수정할 수 있습니다.',
          icon: 'error',
        });
        navigate('/', { replace: true });
      }
    };

    void checkAccess();

    return () => {
      isMounted = false;
    };
  }, [loading, user, tripId, navigate]);

  // -------------------------------------------------------------------------
  // [4] 이벤트 핸들러 (네비게이션)
  // -------------------------------------------------------------------------
  const handleSubmit = () => {
    navigate('/');
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      navigate('/');
    }
  };

  // -------------------------------------------------------------------------
  // [5] 초대 링크 생성 및 복사 핸들러 (핵심 기능)
  // -------------------------------------------------------------------------
  const handleCreateInvite = async () => {
    // 1. 방어 코드: 여행이 저장되지 않아 ID가 없는 경우
    if (!tripId) {
      await alert({
        title: '잠시만요! ✋',
        text: '먼저 여행을 저장해야 초대를 할 수 있습니다.',
        icon: 'warning'
      });
      return;
    }

    try {
      // 2. Supabase Edge Function 호출 (초대 토큰 생성 요청)
      const { data, error } = await supabase.functions.invoke('create-invite-link', {
        body: { trip_id: tripId }
      });

      if (error) throw error;

      // 3. 토큰 추출 (응답 데이터 구조 방어 로직 포함)
      const token = data?.data?.token || data?.token;
      if (!token) throw new Error("토큰 생성에 실패했습니다.");

      // 4. 전체 초대 링크 URL 조립
      const inviteUrl = `${window.location.origin}/invite?token=${token}`;

      // 5. 클립보드 복사 시도
      try {
        await navigator.clipboard.writeText(inviteUrl);
        
        // 성공 시 예쁜 알림창 출력
        await alert({
          title: '링크 복사 완료! 📋',
          text: '초대 링크가 클립보드에 복사되었습니다.\n친구에게 붙여넣기(Ctrl+V) 해주세요!',
          icon: 'success'
        });

      } catch (clipboardError) {
        // 브라우저 보안 등으로 자동 복사 실패 시, 링크를 직접 보여줌
        await alert({
          title: '링크 생성 완료! ✨',
          text: `아래 링크를 복사해서 공유하세요:\n\n${inviteUrl}`,
          icon: 'info'
        });
      }

    } catch (err) {
      console.error('초대 생성 에러:', err);
      await alert({
        title: '초대장 생성 실패',
        text: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        icon: 'error'
      });
    }
  };

  // -------------------------------------------------------------------------
  // [6] 조건부 렌더링 (로딩 중, 권한 없음 처리)
  // -------------------------------------------------------------------------
  if (loading || !user || accessStatus === 'checking') return null;
  
  if (accessStatus === 'denied') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        편집 권한이 없습니다.
      </div>
    );
  }

  return (
    <TripCreateView
      onNavigate={handleNavigate}
      onSubmit={handleSubmit}
      tripId={tripId}
      onInvite={handleCreateInvite} // View 컴포넌트로 초대 기능 전달
    />
  );
};

export default TripCreate;