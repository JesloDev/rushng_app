'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProviderDashboard } from '@/components/dashboard/ProviderDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function ProviderDashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Get role and ensure it's lowercase
    const role = user?.role?.toLowerCase() || 'customer';
    
    // If user is not a provider, redirect to their correct dashboard
    if (role !== 'provider') {
      console.log('Redirecting from provider to:', role);
      router.replace(`/dashboard/${role}`);
      return;
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Only render if user is authenticated and is a provider
  if (!isAuthenticated || user?.role?.toLowerCase() !== 'provider') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ProviderDashboard />
    </div>
  );
}