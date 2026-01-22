import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';

// Layout & Pages
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import TripListPage from './pages/TripListPage';
import TripEditPage from './pages/TripEditPage';

// Dev Pages (기존 유지)
import Health from './pages/Health';
import UiPreview from './pages/UiPreview';

function App() {
  return (
    <Routes>
      {/* 1. 실제 앱 라우팅 (MainLayout 적용) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="trips" element={<TripListPage />} />
        
        {/* T-1004: 편집 페이지 (ID가 있는 경우와 없는 경우 모두 대응) */}
        <Route path="trips/new" element={<TripEditPage />} />
        <Route path="trips/:tripId/edit" element={<TripEditPage />} />
      </Route>

      {/* 2. 개발용 라우팅 (레이아웃 없이 렌더링) */}
      {import.meta.env.DEV && (
        <>
          <Route path="/preview" element={<UiPreview />} />
          <Route path="/health" element={<Health />} />
        </>
      )}
    </Routes>
  );
}

export default App;