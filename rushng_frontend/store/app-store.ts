import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

export type ViewType = 
  | 'home'
  | 'login'
  | 'register'
  | 'verify'
  | 'reset-password'
  | 'customer-dashboard'
  | 'provider-dashboard'
  | 'admin-dashboard'
  | 'jobs'
  | 'job-post'
  | 'job-details'
  | 'job-tracking'
  | 'providers'
  | 'provider-register'
  | 'provider-profile'
  | 'payments'
  | 'violations'
  | 'notifications'
  | 'profile'
  | 'settings';

export interface AppState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;
  setView: (view: ViewType) => void;
  goBack: () => void;

  // User
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuth: (isAuth: boolean) => void;

  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  setToast: (toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null) => void;

  // Job filters
  jobFilters: {
    category?: string;
    status?: string;
    search?: string;
    city?: string;
    state?: string;
  };
  setJobFilters: (filters: any) => void;

  // Provider filters
  providerFilters: {
    skill?: string;
    city?: string;
    state?: string;
    minRating?: number;
  };
  setProviderFilters: (filters: any) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
}

const initialState = {
  currentView: 'home' as ViewType,
  previousView: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  mobileMenuOpen: false,
  toast: null,
  jobFilters: {},
  providerFilters: {},
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setView: (view) => set((state) => ({ 
        currentView: view, 
        previousView: state.currentView 
      })),
      goBack: () => set((state) => ({ 
        currentView: state.previousView || 'home', 
        previousView: null 
      })),

      // User
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuth: (isAuthenticated) => set({ isAuthenticated }),

      // UI
      setIsLoading: (isLoading) => set({ isLoading }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setToast: (toast) => set({ toast }),

      // Filters
      setJobFilters: (jobFilters) => set({ jobFilters }),
      setProviderFilters: (providerFilters) => set({ providerFilters }),

      // Auth actions
      login: async (email, password) => {
        try {
          // Implementation using authApi
          return true;
        } catch (error) {
          return false;
        }
      },
      register: async (data) => {
        try {
          // Implementation using authApi
          return true;
        } catch (error) {
          return false;
        }
      },
      logout: () => {
        localStorage.clear();
        set({ 
          user: null, 
          isAuthenticated: false, 
          currentView: 'home' 
        });
      },
    }),
    {
      name: 'rushng-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);