import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { setReturnToIfEmpty } from '@/features/auth/auth.feature';
import { useEffect, useRef, useState } from 'react';
import { User, LogOut, UserCircle } from 'lucide-react';

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

  // 메뉴 링크 공통 스타일 (깔끔하게 통일)
  const navLinkStyle = {
    textDecoration: 'none',
    color: '#334155', // 진한 회색 (가독성 UP)
    fontWeight: 600,  // 글씨 두껍게
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/"
            style={{
              fontWeight: 800,
              fontSize: '1.4rem',
              textDecoration: 'none',
              color: '#0061ff', // 오션 블루 포인트
              letterSpacing: '-0.5px',
            }}
          >
            Trip Planner
          </Link>
        </div>

        {/* Center/Right: Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* 1. Trips 이름 그대로 유지 */}
            <Link to="/trips" style={navLinkStyle}>
              Trips
            </Link>
            
            {isAuthed && (
              <>
                <Link to="/trips/bookmarks" style={navLinkStyle}>
                  Wishlist
                </Link>
                {/* 2. likeList -> Liked 로 변경 */}
                <Link to="/trips/likedList" style={navLinkStyle}>
                  Liked
                </Link>
                {/* 3. myTrips -> My Trips 로 변경 */}
                <Link to="/trips/myTrips" style={navLinkStyle}>
                  My Trips
                </Link>
                {/* 4. My Page 링크 살려둠 (요청하신 대로!) */}
                <Link to="/me" style={navLinkStyle}>
                  My Page
                </Link>
              </>
            )}
          </nav>

          {/* User Profile / Login Button */}
          {status === 'loading' ? (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9' }} />
          ) : isAuthed ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #e2e8f0',
                  background: open ? '#f8fafc' : 'white',
                  borderRadius: 999,
                  padding: '4px',
                  paddingRight: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user?.user_metadata?.avatar_url}
                    alt="avatar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} className="text-gray-500" />
                  </div>
                )}
                <span style={{ fontSize: 12, color: '#64748b' }}>▼</span>
              </button>

              {/* Dropdown Menu */}
              {open && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: 180,
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    zIndex: 100,
                    padding: '8px'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                    내 계정
                  </div>
                  
                  <Link
                    to="/me"
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      textDecoration: 'none',
                      color: '#334155',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      borderRadius: 8,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserCircle size={18} />
                    프로필
                  </Link>

                  <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                      color: '#ef4444',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      borderRadius: 8,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={18} />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              style={{
                padding: '10px 20px',
                borderRadius: 50,
                border: 'none',
                background: '#0061ff', // 로고랑 깔맞춤
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 97, 255, 0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}