'use client';

import { useAppStore } from '@/store/app-store';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/rushng/navbar';
import { Hero } from '@/components/rushng/hero';
import { Services } from '@/components/rushng/services';
import { BookingFlow } from '@/components/rushng/booking-flow';
import { MerchantDashboard } from '@/components/rushng/merchant-dashboard';
import { MerchantBuilder } from '@/components/rushng/merchant-builder';
import { MerchantSignup } from '@/components/rushng/merchant-signup';
import { BuyerDashboard } from '@/components/rushng/BuyerDashboard';
import { Login } from '@/components/rushng/Login';
import { Signup } from '@/components/rushng/Signup';
import { HowItWorks } from '@/components/rushng/how-it-works';
import { PricingSection } from '@/components/rushng/pricing-section';
import { TrackOrder } from '@/components/rushng/track-order';
import { Footer } from '@/components/rushng/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { api } from '@/lib/api';

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <HowItWorks />
      <PricingSection />
    </>
  );
}

export default function RushngApp() {
  const { currentView, setUser, setAuth, isAuthenticated } = useAppStore();
  const { loading } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          api.setToken(token);
          const response = await api.getMe();
          if (response.success) {
            setUser(response.data.user);
            setAuth(true);
          } else {
            api.clearTokens();
            setAuth(false);
          }
        } catch {
          api.clearTokens();
          setAuth(false);
        }
      }
    };
    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'booking':
        return <BookingFlow />;
      case 'merchant-dashboard':
        return <MerchantDashboard />;
      case 'merchant-builder':
        return <MerchantBuilder />;
      case 'merchant-signup':
        return <MerchantSignup />;
      case 'buyer-dashboard':
        return <BuyerDashboard />;
      case 'login':
        return <Login />;
      case 'signup':
        return <Signup />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'pricing':
        return <PricingSection />;
      case 'track':
        return <TrackOrder />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}