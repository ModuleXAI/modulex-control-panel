'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hydrate, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Clear any existing cookies first to prevent invalid redirects
    const existingToken = Cookies.get('auth-token');
    if (existingToken) {
      console.log('🧹 Clearing existing auth token');
      Cookies.remove('auth-token');
      logout(); // Clear the store state as well
    }
    
    // Hydrate auth state from cookies (should be empty now)
    hydrate();
    setIsInitialized(true);
  }, [hydrate, logout]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      // Always redirect to login since we cleared the cookies
      console.log('🔄 Redirecting to login page');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Show loading while determining authentication status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ModuleX Control Panel...</p>
      </div>
    </div>
  );
}
