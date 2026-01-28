import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FullScreenLoader from '@/components/FullScreenLoader';
import { createTripDraft, updateTripMeta } from '@/services/trips.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { isAuthError } from '@/services/_core/errors';

const DEFAULT_TITLE = '새 여행 1';

// ✅ 모듈 스코프 캐시 (StrictMode 재마운트에도 유지됨)
let inFlightCreatePromise = null;
let inFlightUserId = null;

export default function TripCreateEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setReturnToIfEmpty(location.pathname + location.search);
      navigate('/login', { replace: true });
      return;
    }

    // ✅ 유저가 바뀌면 캐시 초기화
    if (inFlightUserId && inFlightUserId !== user.id) {
      inFlightCreatePromise = null;
      inFlightUserId = null;
    }

    // ✅ 이미 생성 중이면 재사용
    if (!inFlightCreatePromise) {
      inFlightUserId = user.id;
      inFlightCreatePromise = (async () => {
        const tripId = await createTripDraft();
        try {
          await updateTripMeta({ tripId, title: DEFAULT_TITLE });
        } catch (e) {
          console.error('Failed to update trip title:', e);
        }
        return tripId;
      })();
    }

    let alive = true;

    inFlightCreatePromise
      .then((tripId) => {
        if (!alive) return;
        navigate(`/trips/${tripId}/edit`, { replace: true });
      })
      .catch((error) => {
        console.error('Failed to create trip:', error);

        // 다음 시도할 수 있게 캐시 해제
        inFlightCreatePromise = null;
        inFlightUserId = null;

        if (isAuthError(error)) {
          if (!alive) return;
          setReturnToIfEmpty(location.pathname + location.search);
          navigate('/login', { replace: true });
          return;
        }
        if (alive) setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [loading, user, navigate, location.pathname, location.search]);

  if (status === 'error') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        여행 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  return <FullScreenLoader message="여행 생성 중..." />;
}
