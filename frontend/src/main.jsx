import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/components/AuthProvider.jsx';
import AppGate from './features/auth/components/AppGate.jsx';

const isDevelopment = import.meta.env.MODE === 'development';

const Root = isDevelopment ? ({ children }) => children : StrictMode;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppGate>
          <App />
        </AppGate>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);