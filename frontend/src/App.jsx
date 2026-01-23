// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';

// 페이지 컴포넌트 import
import HomePage from './pages/HomePage';

// 기존 개발용 컴포넌트
import AuthCallbackPage from './pages/AuthCallbackPage';
import Health from './pages/Health';
import TripCreate from './pages/TripCreate';
import UiPreview from './pages/UiPreview';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import ExplorePreviewPage from './components/ExplorePreviewPage';

function App() {
  return (
    <div>
      <Routes>
        {/* 1. 메인 기능 라우트 */}
        <Route path="/" element={<HomePage />} />

        {/* TripCreate 페이지 라우트 */}
        <Route path="/trip-create" element={<TripCreate />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
      </Routes>
    </div>
  );
}

export default App;
