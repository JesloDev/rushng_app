import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, User } from '@/lib/api';

export type ViewType = 
  | 'home' 
  | 'booking' 
  | 'merchant-dashboard' 
  | 'merchant-builder' 
  | 'merchant-signup'
  | 'how-it-works'
  | 'pricing'
  | 'track'
  | 'login'
  | 'signup'
  | 'buyer-dashboard'
  | 'profile'
  | 'orders'
  | 'settings';

export type ServiceType = 'shopping' | 'errands' | 'condiments' | 'dispatch' | 'price_per_time' | 'laundry';

export interface BookingItem { name: string; quantity: number; price: number; }
export interface BookingForm {
  serviceType: ServiceType | null; pickupAddress: string; dropoffAddress: string;
  scheduledDate: string; scheduledTime: string; notes: string; weight: number; duration: number; items: BookingItem[];
}
export interface MerchantProduct { name: string; price: number; description: string; category: string; inStock: boolean; image: string; }
export interface MerchantProfile {
  name: string; category: string; description: string; phone: string; email: string;
  address: string; logo: string; coverColor: string; theme: string; slug?: string; plan?: string; products: MerchantProduct[];
}

interface AppState {
  // Navigation
  currentView: ViewType; 
  previousView: ViewType | null; 
  setView: (view: ViewType) => void; 
  goBack: () => void;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (isAuth: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  
  // Role-based routing
  redirectAfterLogin: ViewType | null;
  setRedirectAfterLogin: (view: ViewType | null) => void;
  getDefaultDashboard: () => ViewType;
  
  // Booking
  bookingForm: BookingForm; selectedService: ServiceType | null; 
  setService: (s: ServiceType) => void;
  updateBookingForm: (u: Partial<BookingForm>) => void; 
  addBookingItem: (i: BookingItem) => void;
  removeBookingItem: (idx: number) => void; 
  resetBooking: () => void;
  
  // Merchant
  merchantProfile: MerchantProfile; 
  updateMerchantProfile: (u: Partial<MerchantProfile>) => void;
  addMerchantProduct: (p: MerchantProduct) => void; 
  removeMerchantProduct: (idx: number) => void;
  setMerchantProducts: (products: MerchantProduct[]) => void;
  
  // UI
  mobileMenuOpen: boolean; setMobileMenuOpen: (o: boolean) => void; 
  bookingStep: number; setBookingStep: (s: number) => void;
}

const defaultBooking: BookingForm = { 
  serviceType: null, pickupAddress: '', dropoffAddress: '', 
  scheduledDate: '', scheduledTime: '', notes: '', weight: 0, duration: 1, items: [] 
};

const defaultMerchant: MerchantProfile = { 
  name: '', category: 'General', description: '', phone: '', email: '', 
  address: '', logo: '', coverColor: '#FF6D00', theme: 'orange', products: [] 
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home', previousView: null,
      setView: (v) => set((s) => ({ currentView: v, previousView: s.currentView })),
      goBack: () => set((s) => ({ currentView: s.previousView || 'home', previousView: 'home' })),

      // Auth
      user: null,
      isAuthenticated: false,
      setAuth: (isAuthenticated) => set({ isAuthenticated }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      redirectAfterLogin: null,
      setRedirectAfterLogin: (view) => set({ redirectAfterLogin: view }),
      
      getDefaultDashboard: () => {
        const user = get().user;
        if (!user) return 'home';
        
        switch (user.role) {
          case 'merchant':
            return 'merchant-dashboard';
          case 'admin':
            return 'admin-dashboard';
          case 'buyer':
            return 'home'; // Buyers go to home page
          case 'rider':
            return 'home'; // Riders have their own app
          default:
            return 'home';
        }
      },
      
      login: async (email: string, password: string) => {
        try {
          const response = await api.login(email, password);
          if (response.success) {
            const user = response.data.user;
            set({ user, isAuthenticated: true });
            
            // Redirect to appropriate dashboard
            const redirectView = get().getDefaultDashboard();
            set({ currentView: redirectView });
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      register: async (userData: any) => {
        try {
          const response = await api.register(userData);
          if (response.success) {
            const user = response.data.user;
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },
      
      logout: () => {
        api.clearTokens();
        set({ user: null, isAuthenticated: false, currentView: 'home' });
      },

      // Booking
      bookingForm: { ...defaultBooking }, selectedService: null,
      setService: (s) => set({ 
        selectedService: s, 
        bookingForm: { ...defaultBooking, serviceType: s }, 
        bookingStep: 1 
      }),
      updateBookingForm: (u) => set((s) => ({ 
        bookingForm: { ...s.bookingForm, ...u } 
      })),
      addBookingItem: (i) => set((s) => ({ 
        bookingForm: { ...s.bookingForm, items: [...s.bookingForm.items, i] } 
      })),
      removeBookingItem: (idx) => set((s) => ({ 
        bookingForm: { ...s.bookingForm, items: s.bookingForm.items.filter((_, i) => i !== idx) } 
      })),
      resetBooking: () => set({ 
        bookingForm: { ...defaultBooking }, 
        selectedService: null, 
        bookingStep: 0, 
        currentView: 'home' 
      }),

      // Merchant
      merchantProfile: { ...defaultMerchant },
      updateMerchantProfile: (u) => set((s) => ({ 
        merchantProfile: { ...s.merchantProfile, ...u } 
      })),
      addMerchantProduct: (p) => set((s) => ({ 
        merchantProfile: { 
          ...s.merchantProfile, 
          products: [...s.merchantProfile.products, p] 
        } 
      })),
      removeMerchantProduct: (idx) => set((s) => ({ 
        merchantProfile: { 
          ...s.merchantProfile, 
          products: s.merchantProfile.products.filter((_, i) => i !== idx) 
        } 
      })),
      setMerchantProducts: (products) => set((s) => ({ 
        merchantProfile: { ...s.merchantProfile, products } 
      })),

      // UI
      mobileMenuOpen: false, 
      setMobileMenuOpen: (o) => set({ mobileMenuOpen: o }),
      bookingStep: 0, 
      setBookingStep: (s) => set({ bookingStep: s }),
    }),
    {
      name: 'rushng-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        merchantProfile: state.merchantProfile,
      }),
    }
  )
);