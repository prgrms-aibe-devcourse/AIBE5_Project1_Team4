import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import TripCreateView from '../components/trip-create/TripCreateView';
import './trip-create.css';

const TripCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: tripId } = useParams();
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
      tripId={tripId}
    />
  );
};

export default TripCreate;
