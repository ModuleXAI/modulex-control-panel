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
    hydrate();
  }, [hydrate]);

  useEffect(() => {
  }, [isAuthenticated, user]);

  return <>{children}</>;
} 