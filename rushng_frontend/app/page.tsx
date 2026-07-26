'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'provider') {
        router.push('/dashboard/provider');
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Prevent flash of landing page content while checking auth status
  if (isLoading || (isAuthenticated && user?.role !== 'customer')) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <Testimonials />
    </>
  );
}