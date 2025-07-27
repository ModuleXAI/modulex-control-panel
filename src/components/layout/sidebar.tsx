'use client';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Settings, 
  Package, 
  Menu, 
  X,
  BarChart3,
  Users,
  LogOut,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tools', href: '/dashboard/tools', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    console.log('🔴 Logout button clicked - Sidebar');
    setIsLoggingOut(true);
    try {
      logout();
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 border-r",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4">
          <h2 className={cn(
            "font-semibold text-gray-900 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}>
            ModuleX Control
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "ml-3 transition-opacity duration-300",
                  sidebarOpen ? "opacity-100" : "opacity-0"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout section */}
        <div className="border-t">
          {/* User info (when expanded) */}
          {sidebarOpen && user && (
            <div className="px-4 py-3 border-b">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Logout button */}
          <div className="p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              title={!sidebarOpen ? "Sign out" : undefined}
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 flex-shrink-0" />
              )}
              {sidebarOpen && (
                <span className="ml-3 font-medium">
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 