import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { alert } from '@/shared/ui/overlay';
import { assertTripEditor } from '@/services/trips.service';
import { useNavigate, useSearchParams } from 'react-router-dom';
// ✅ [1. 추가] Supabase 클라이언트 불러오기 
import { supabase } from '../lib/supabaseClient'; 
import { alert } from '@/shared/ui/overlay';
import { assertTripEditor } from '@/services/trips.service';
import TripCreateView from '../components/trip-create/TripCreateView';
import './trip-create.css';

const TripCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId'); // URL에서 여행 ID 가져오기
  const location = useLocation();
  const { id: tripId } = useParams();
  const { user, loading } = useAuth();
  const [accessStatus, setAccessStatus] = useState('checking');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setReturnToIfEmpty(location.pathname + location.search);
      navigate('/login', { replace: true });
    }
  }, [loading, user, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!tripId) {
      setAccessStatus('allowed');
      return;
    }

    let isMounted = true;

    const checkAccess = async () => {
      try {
        await assertTripEditor({ tripId });
        if (isMounted) setAccessStatus('allowed');
      } catch (error) {
        if (!isMounted) return;
        setAccessStatus('denied');
        await alert({
          title: '편집 권한이 없습니다',
          text: 'owner 또는 editor 권한이 있는 사용자만 편집할 수 있습니다.',
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

  const handleSubmit = () => {
    navigate('/');
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      navigate('/');
    }
  };

  // ✅ [2. 추가] 초대 링크 생성 함수 (여기서 tripId를 씀)
  const handleCreateInvite = async () => {
    // 여행을 저장하기 전이라면 ID가 없을 수 있음
    if (!tripId) {
      alert("먼저 여행을 저장해야 초대를 할 수 있습니다! 💾");
      return;
    }
  if (loading || !user || accessStatus === 'checking') return null;
  if (accessStatus === 'denied') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        편집 권한이 없습니다.
      </div>
    );
  }

    try {
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('create-invite-link', {
        body: { trip_id: tripId }
      });

      if (error) throw error;

      // 링크 생성 및 복사
      const inviteUrl = `${window.location.origin}/invite?token=${data.data.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      alert(`초대 링크가 복사되었습니다! 📋\n\n${inviteUrl}`);

    } catch (err) {
      console.error('초대 생성 실패:', err);
      alert('초대 링크 생성 실패. 다시 시도해주세요.');
    }
  };

  return (
    <TripCreateView
      onNavigate={handleNavigate}
      onSubmit={handleSubmit}
      tripId={tripId}
      // ✅ [3. 추가] 만든 함수를 View로 내려줌
      onInvite={handleCreateInvite}
    />
  );
};

export default TripCreate;