'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function CustomerDashboardPage() {
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
    
    // If user is not a customer, redirect to their correct dashboard
    if (role !== 'customer') {
      console.log('Redirecting from customer to:', role);
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

  // Only render if user is authenticated and is a customer
  if (!isAuthenticated || user?.role?.toLowerCase() !== 'customer') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomerDashboard />
    </div>
  );
}