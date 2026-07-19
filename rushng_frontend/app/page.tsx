'use client';

import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/app-store';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { setView } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'provider') {
        setView('provider-dashboard');
      } else if (user.role === 'admin') {
        setView('admin-dashboard');
      }
    }
  }, [isAuthenticated, user, setView]);

  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <Testimonials />
    </>
  );
}