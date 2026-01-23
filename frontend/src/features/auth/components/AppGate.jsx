import FullScreenLoader from '@/components/FullScreenLoader';
import AuthBootError from '@/features/auth/components/AuthBootError';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function AppGate({ children }) {
  const { loading, error, retry } = useAuth();

  if (loading) return <FullScreenLoader message="세션 확인 중..." />;
  if (error) return <AuthBootError onRetry={retry} />;

  return children;
}
