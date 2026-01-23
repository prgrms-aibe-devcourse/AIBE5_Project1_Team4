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


function App() {
  return (
   <div>
        <Routes>
          {/* 1. 메인 기능 라우트 */}
          <Route path="/" element={<HomePage />} />


          {/* 개발용 UI 쇼룸 */}
          {import.meta.env.DEV && (
          <Route path="/preview" element={<UiPreview />} />
        )}
        
          {/* TripCreate 페이지 라우트 */}
          <Route path="/trip-create" element={<TripCreate />} />

        {import.meta.env.DEV && <Route path="/health" element={<Health />} />}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </div>

  );
}

export default App;
