/**
 * NOTE:
 * - 이 페이지는 로그아웃 "UI"만 담당합니다.
 * - 실제 로그아웃(세션 종료)은 useAuth() 또는 상위 AuthProvider에서 처리합니다.
 * - Supabase 직접 호출(signOut)은 팀 합의에 따라 제거했습니다.
 */
const LogoutPage = () => {
  return <p>로그아웃 중...</p>;
};

export default LogoutPage;
