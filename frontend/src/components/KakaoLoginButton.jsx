import { Button } from 'react-bootstrap';
import { setReturnTo, signInWithKakao } from '@/features/auth/auth.feature';

export function KakaoLoginButton() {
  const login = async () => {
    // 원래 페이지 복귀 URL 저장
    try {
      setReturnTo(window.location.pathname + window.location.search);
      await signInWithKakao();
    } catch (e) {
      alert(e?.message || '로그인을 시작할 수 없어요.');
    }
  };

  return (
    <Button variant="dark" onClick={login}>
      카카오 로그인
    </Button>
  );
}
