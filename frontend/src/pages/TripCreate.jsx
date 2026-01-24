import { useNavigate } from 'react-router-dom';
import TripCreateView from '../components/trip-create/TripCreateView';

const TripCreate = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/');
  };

  const handleNavigate = (target) => {
    if (target === 'home') {
      navigate('/');
    }
  };

  return <TripCreateView onNavigate={handleNavigate} onSubmit={handleSubmit} />;
};

export default TripCreate;
