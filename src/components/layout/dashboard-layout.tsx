'use client';

import { useRequireAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';
import { useUIStore } from '@/store/ui-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const auth = useRequireAuth();
  const { sidebarOpen } = useUIStore();

  if (!auth) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 