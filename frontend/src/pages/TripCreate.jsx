import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import TripCreateView from '../components/trip-create/TripCreateView';

const TripCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setReturnToIfEmpty(location.pathname + location.search);
      navigate('/login', { replace: true });
    }
  }, [loading, user, location.pathname, location.search, navigate]);

  const handleSubmit = () => {
    navigate('/');
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      navigate('/');
    }
  };

  if (loading || !user) return null;

  return (
    <TripCreateView
      onNavigate={handleNavigate}
      onSubmit={handleSubmit}
    />
  );
};

export default TripCreate;
