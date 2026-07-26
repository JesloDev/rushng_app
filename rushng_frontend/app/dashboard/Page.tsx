'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    switch (user.role) {
      case 'provider':
        router.replace('/dashboard/provider');
        break;
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      case 'customer':
      default:
        router.replace('/dashboard/customer');
        break;
    }
  }, [user, loading, isAuthenticated, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto" />
        <p className="text-sm font-medium text-muted-foreground">Directing to your dashboard...</p>
      </div>
    </div>
  );
}