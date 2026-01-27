import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { alert } from '@/shared/ui/overlay';
import { assertTripEditor } from '@/services/trips.service';
import TripCreateView from '../components/trip-create/TripCreateView';
import './trip-create.css';

const TripCreate = () => {
  const navigate = useNavigate();
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
    />
  );
};

export default TripCreate;
