import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

export default function AppHeader() {
  const { user, status } = useAuth();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthed = !!user;

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogin = () => {
    setReturnToIfEmpty(location.pathname + location.search);
    navigate('/login');
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  // 바깥 클릭 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
        background: 'rgba(255,255,255,0.85)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/"
            style={{
              fontWeight: 800,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Trip Planner
          </Link>

          {/* TODO: 검색바 추가 */}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <nav style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/trips"
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={() => setOpen(false)}
            >
              Trips
            </Link>
            {isAuthed && (
              <Link
                to="/trips/bookmarks"
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => setOpen(false)}
              >
                Wishlist
              </Link>
            )}
            {isAuthed && (
              <Link
                to="/trips/likedList"
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => setOpen(false)}
              >
                likeList
              </Link>
            )}
            {isAuthed && (
              <Link
                to="/trips/myTrips"
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => setOpen(false)}
              >
                myTrips
              </Link>
            )}
            {isAuthed && (
              <Link
                to="/me"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                My Page
              </Link>
            )}
          </nav>

          {status === 'loading' ? (
            <span style={{ opacity: 0.6, fontSize: 14 }}>Loading...</span>
          ) : isAuthed ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: 'white',
                  borderRadius: 999,
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user?.user_metadata?.avatar_url}
                    alt="avatar"
                    style={{
                      width: '2.2rem',
                      height: '2.2rem',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <User className="text-secondary" />
                )}
                <span style={{ fontSize: 12, opacity: 0.7 }}>▼</span>
              </button>

              {/* Dropdown */}
              {open && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    minWidth: 160,
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    zIndex: 100,
                  }}
                >
                  <Link
                    to="/me"
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 12px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    👤 프로필
                  </Link>

                  <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                      color: '#d33',
                    }}
                  >
                    🚪 로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.15)',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
