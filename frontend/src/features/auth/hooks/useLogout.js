import { clearReturnTo } from '@/features/auth/auth.feature';
import { toast } from '../../../shared/ui/overlay';
import { useAuth } from './useAuth';

export function useLogout() {
  const { signOut } = useAuth();

  const logout = async () => {
    try {
      clearReturnTo();
      await signOut();

      toast('로그아웃되었습니다', { icon: 'success' });
    } catch (e) {
      console.error('[logout failed]', e);

      toast('로그아웃에 실패했습니다', { icon: 'error' });
    }
  };

  return { logout };
}
