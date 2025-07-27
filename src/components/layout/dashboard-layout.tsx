'use client';

import { useAuthStore } from '@/store/auth-store';
import { useOrganizationStore } from '@/store/organization-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { OrganizationSwitcher } from './organization-switcher';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const { 
    selectedOrganization, 
    organizations,
    isLoading: orgLoading,
    fetchUserOrganizations,
    hydrate: hydrateOrganizations
  } = useOrganizationStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Hydrate organization store on first load
    if (isAuthenticated && !hasHydrated) {
      console.log('🏢 Dashboard: Starting organization hydration');
      hydrateOrganizations();
      setHasHydrated(true);
    }
  }, [isAuthenticated, isLoading, router, hasHydrated, hydrateOrganizations]);

  useEffect(() => {
    // After hydration, check if we need to fetch organizations
    if (isAuthenticated && hasHydrated && !orgLoading) {
      console.log('🏢 Dashboard: Post-hydration check:', {
        hasOrganizations: organizations.length > 0,
        hasSelected: !!selectedOrganization,
        organizationCount: organizations.length
      });

      // If no organizations are loaded, fetch them
      if (organizations.length === 0) {
        console.log('🔄 Dashboard: Fetching organizations (no organizations in store)');
        fetchUserOrganizations();
      }
      // If organizations are loaded but no selection, and we have multiple orgs, redirect to selection
      else if (!selectedOrganization && organizations.length > 1) {
        console.log('⚠️ Dashboard: Multiple organizations, no selection - redirecting to select');
        router.push('/select-organization');
      }
      // If single organization and no selection, auto-select it
      else if (!selectedOrganization && organizations.length === 1) {
        console.log('✅ Dashboard: Auto-selecting single organization');
        const singleOrg = organizations[0];
        useOrganizationStore.getState().selectOrganization(singleOrg.id);
      }
    }
  }, [isAuthenticated, hasHydrated, organizations, selectedOrganization, orgLoading, fetchUserOrganizations, router]);

  const handleLogout = async () => {
    console.log('🔴 Logout button clicked - Header');
    setIsLoggingOut(true);
    try {
      logout();
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  // Show loading while checking authentication or hydrating
  if (isLoading || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Loading...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while fetching organizations
  if (orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we have organizations loaded but no selection and multiple options
  if (organizations.length > 1 && !selectedOrganization) {
    // This will be handled by the useEffect above, but we show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Organization Switcher */}
            <OrganizationSwitcher />
            
            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || 'User'}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="text-red-600 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 