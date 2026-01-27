import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FullScreenLoader from '@/components/FullScreenLoader';
import { createTripDraft, updateTripMeta } from '@/services/trips.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { isAuthError } from '@/services/_core/errors';

const DEFAULT_TITLE = '새 여행 1';

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

    let isMounted = true;

    const run = async () => {
      try {
        const tripId = await createTripDraft();
        try {
          await updateTripMeta({ tripId, title: DEFAULT_TITLE });
        } catch (metaError) {
          console.error('Failed to update trip title:', metaError);
        }
        if (!isMounted) return;
        navigate(`/trips/${tripId}/edit`, { replace: true });
      } catch (error) {
        console.error('Failed to create trip:', error);
        if (isAuthError(error)) {
          if (isMounted) {
            setReturnToIfEmpty(location.pathname + location.search);
            navigate('/login', { replace: true });
          }
          return;
        }
        if (isMounted) setStatus('error');
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [loading, user, location.pathname, location.search, navigate]);

  if (status === 'error') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        여행 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  return <FullScreenLoader message="여행 생성 중..." />;
}
