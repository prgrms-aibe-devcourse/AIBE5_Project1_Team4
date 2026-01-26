// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';

// 페이지 컴포넌트 import
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import MyPage from './pages/MyPage';

// 기존 개발용 컴포넌트
import AuthCallbackPage from './pages/AuthCallbackPage';
import Health from './pages/Health';
import TripCreate from './pages/TripCreate';
import TripDetailPage from './pages/TripDetailPage';
import UiPreview from './pages/UiPreview';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import ExplorePreviewPage from './components/ExplorePreviewPage';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <div>
      <Routes>
        <Route element={<AppLayout />}>
          {/* 1. 메인 기능 라우트 */}
          <Route index element={<HomePage />} />
          <Route path="/trips" element={<TripsPage />} />

          {/* TripCreate 페이지 라우트 */}
          <Route path="/trip-create" element={<TripCreate />} />
          {/* TripDetailPage 페이지 라우트 */}
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          {/* MyPage 페이지 라우트*/}
          <Route path="/me" element={<MyPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />

          {import.meta.env.DEV && (
            <>
              {/* 개발용 UI 쇼룸 */}
              <Route path="/preview" element={<UiPreview />} />

              {/* Supabase Health Checkl */}
              <Route path="/health" element={<Health />} />

              <Route path="/search-preview" element={<ExplorePreviewPage />} />
            </>
          )}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
