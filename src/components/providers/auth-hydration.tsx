'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

interface AuthHydrationProps {
  children: React.ReactNode;
}

export function AuthHydration({ children }: AuthHydrationProps) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    console.log('🔄 Auth Hydration - Starting hydration process');
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    console.log('🔍 Auth State Changed:', {
      isAuthenticated,
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, user]);

  return <>{children}</>;
} 