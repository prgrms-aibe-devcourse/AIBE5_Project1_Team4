// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import UiPreview from './pages/UiPreview';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 개발용 UI 쇼룸 */}
        {import.meta.env.DEV && (
          <Route path="/preview" element={<UiPreview />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
