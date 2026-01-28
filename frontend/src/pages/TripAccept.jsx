import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function TripAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    // 1. 인증 체크: 로그인 안 되어 있으면 로그인 페이지로!
    if (!authLoading && !user) {
      // ✅ 헬퍼 함수 대신 직접 LocalStorage에 저장 (이게 메모장 역할)
      const returnUrl = window.location.pathname + window.location.search;
      localStorage.setItem('auth:returnTo', returnUrl); 
      
      navigate('/login');
      return;
    }

    // 2. 토큰 체크
    if (!token) {
      setStatus('error');
      setErrorMsg('유효하지 않은 초대장입니다. 토큰이 없습니다.');
      return;
    }

    // 3. 엣지 펑션 호출
    const acceptInvite = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('accept-invite-link', {
          body: { token },
        });

     const tripId = data?.trip_id || data?.data?.trip?.id;

        if (error || !tripId) throw error || new Error('여행 ID를 찾을 수 없습니다.');

        setStatus('success');
        
        // ✅ 마스터의 명령대로 '상세'가 아닌 '편집' 페이지로 바로 쏩니다!
        setTimeout(() => {
          navigate(`/trips/${tripId}/edit`); 
        }, 1500);

      } catch (err) {
        console.error('Invite error:', err);
        setStatus('error');
        setErrorMsg(err.message || '초대 수락 중 오류가 발생했습니다.');
      }
    };

    if (user && token && status === 'processing') {
      acceptInvite();
    }
  }, [user, authLoading, token, navigate, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      {status === 'processing' && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">초대장을 확인하고 있습니다...</p>
        </>
      )}

      {status === 'success' && (
        <div className="text-green-600">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-xl font-bold">초대 수락 완료!</p>
          <p className="text-gray-600">곧 여행 계획으로 이동합니다.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-red-600">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-xl font-bold">초대를 처리할 수 없어요</p>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            홈으로 가기
          </button>
        </div>
      )}
    </div>
  );
}