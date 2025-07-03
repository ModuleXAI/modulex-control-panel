import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authStore.isAuthenticated && !authStore.isLoading) {
      router.push('/login');
    }
  }, [authStore.isAuthenticated, authStore.isLoading, router]);

  return authStore;
};

export const useRequireAuth = () => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    return null;
  }
  
  return auth;
}; 