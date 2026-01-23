import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';

export default function AppLayout() {
  const location = useLocation();

  // 필요하면 특정 페이지에서만 main padding/bgc 등을 다르게 줄 수 있게 훅 포인트 마련
  const isEditor =
    location.pathname.startsWith('/trips/') &&
    location.pathname.endsWith('/edit');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'rgba(250,250,250,1)',
      }}
    >
      <AppHeader />

      <main
        style={{
          maxWidth: isEditor ? '100%' : 1100,
          margin: '0 auto',
          padding: isEditor ? 0 : '16px',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
