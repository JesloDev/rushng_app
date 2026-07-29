'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Dashboard Page Debug:');
    console.log('  - Loading:', loading);
    console.log('  - Is Authenticated:', isAuthenticated);
    console.log('  - User:', user);
    console.log('  - User Role:', user?.role);

    if (loading) {
      console.log('⏳ Still loading...');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, redirecting to login');
      router.replace('/login');
      return;
    }

    // Get role and ensure it's lowercase
    const role = user.role?.toLowerCase() || 'customer';
    console.log('🔄 Role detected:', role);

    // Redirect based on role
    if (role === 'provider') {
      console.log('➡️ Redirecting to provider dashboard');
      router.replace('/dashboard/provider');
    } else if (role === 'admin') {
      console.log('➡️ Redirecting to admin dashboard');
      router.replace('/dashboard/admin');
    } else {
      console.log('➡️ Redirecting to customer dashboard');
      router.replace('/dashboard/customer');
    }
  }, [user, loading, isAuthenticated, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm font-medium text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show a fallback while redirecting
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <LoadingSpinner />
        <p className="text-sm font-medium text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}