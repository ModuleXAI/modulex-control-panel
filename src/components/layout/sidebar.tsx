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
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tools', href: '/dashboard/tools', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();
  const pathname = usePathname();

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

        <div className="border-t p-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={cn(
              "ml-3 transition-opacity duration-300",
              sidebarOpen ? "opacity-100" : "opacity-0"
            )}>
              Sign out
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
} 