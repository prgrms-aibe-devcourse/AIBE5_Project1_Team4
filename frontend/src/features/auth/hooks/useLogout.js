import { useAuth } from './useAuth';
import { clearReturnTo } from '@/features/auth/auth.feature';
import { Toast } from '@/shared/ui/toast';

export function useLogout() {
  const { signOut } = useAuth();

  const logout = async () => {
    try {
      clearReturnTo();
      await signOut();

      Toast.fire({
        icon: 'success',
        title: '로그아웃되었습니다',
      });
    } catch (e) {
      console.error('[logout failed]', e);

      Toast.fire({
        icon: 'error',
        title: '로그아웃에 실패했습니다',
      });
    }
  };

  return { logout };
}
