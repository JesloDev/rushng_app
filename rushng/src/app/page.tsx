'use client';

import { useAppStore } from '@/store/app-store';
import { Navbar } from '@/components/rushng/navbar';
import { Hero } from '@/components/rushng/hero';
import { Services } from '@/components/rushng/services';
import { BookingFlow } from '@/components/rushng/booking-flow';
import { MerchantDashboard } from '@/components/rushng/merchant-dashboard';
import { MerchantBuilder } from '@/components/rushng/merchant-builder';
import { MerchantSignup } from '@/components/rushng/merchant-signup';
import { Login } from '@/components/rushng/Login';
import { Signup } from '@/components/rushng/Signup';
import { HowItWorks } from '@/components/rushng/how-it-works';
import { PricingSection } from '@/components/rushng/pricing-section';
import { TrackOrder } from '@/components/rushng/track-order';
import { Footer } from '@/components/rushng/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
    </>
  );
}

export default function RushngApp() {
  const { currentView } = useAppStore();
  const { loading } = useAuth();

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