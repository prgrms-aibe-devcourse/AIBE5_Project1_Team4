// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';
import AuthCallbackPage from './pages/AuthCallbackPage';
import Health from './pages/Health';
import UiPreview from './pages/UiPreview';

function App() {
  return (
    <div>
      <Routes>
        {/* 개발용 UI 쇼룸 */}
        {import.meta.env.DEV && (
          <Route path="/preview" element={<UiPreview />} />
        )}
        {import.meta.env.DEV && <Route path="/health" element={<Health />} />}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </div>
  );
}

export default App;
