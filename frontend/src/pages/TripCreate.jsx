import { useNavigate, useSearchParams } from 'react-router-dom';
import TripCreateView from '../components/trip-create/TripCreateView';

const TripCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');

  const handleSubmit = () => {
    navigate('/');
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      navigate('/');
    }
  };

  return (
    <TripCreateView
      onNavigate={handleNavigate}
      onSubmit={handleSubmit}
      tripId={tripId}
    />
  );
};

export default TripCreate;
