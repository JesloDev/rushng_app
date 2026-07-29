'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile, shown on md+ */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 overflow-y-auto">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}