import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { tokenManager } from '@/lib/token-manager';

export const useAuth = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Hydrate the auth store on mount
    authStore.hydrate();
  }, []);

  // Function to make authenticated API requests
  const makeAuthenticatedRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return tokenManager.makeAuthenticatedRequest<T>(endpoint, options);
  };

  return {
    ...authStore,
    makeAuthenticatedRequest,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}; 