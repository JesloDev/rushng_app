import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id?: string;
  message: string;
  type: ToastType;
}

export interface JobFilters {
  category?: string;
  status?: string;
  search?: string;
  city?: string;
  state?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface ProviderFilters {
  skill?: string;
  city?: string;
  state?: string;
  minRating?: number;
  availableOnly?: boolean;
}

export interface AppState {
  // SSR Hydration State
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;
  setView: (view: ViewType) => void;
  goBack: () => void;

  // User & Auth State
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuth: (isAuth: boolean) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Toast System
  toast: ToastMessage | null;
  setToast: (toast: ToastMessage | null) => void;
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;

  // Filters
  jobFilters: JobFilters;
  setJobFilters: (filters: Partial<JobFilters> | ((prev: JobFilters) => JobFilters)) => void;
  resetJobFilters: () => void;

  providerFilters: ProviderFilters;
  setProviderFilters: (filters: Partial<ProviderFilters> | ((prev: ProviderFilters) => ProviderFilters)) => void;
  resetProviderFilters: () => void;

  // Global Auth Actions
  logout: () => void;
}

const defaultJobFilters: JobFilters = {};
const defaultProviderFilters: ProviderFilters = {};

let toastTimer: NodeJS.Timeout | null = null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // SSR Hydration
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      // Navigation Defaults
      currentView: 'home',
      previousView: null,
      setView: (view) =>
        set((state) => ({
          currentView: view,
          previousView: state.currentView,
        })),
      goBack: () =>
        set((state) => ({
          currentView: state.previousView || 'home',
          previousView: null,
        })),

      // User & Auth - Fixed to sync properly
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        // Normalize role when setting user
        if (user && user.role) {
          user.role = user.role.toLowerCase() as any;
        }
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },
      setAuth: (isAuthenticated) => {
        // When setting auth to false, also clear user
        if (!isAuthenticated) {
          set({ user: null, isAuthenticated: false });
        } else {
          // If setting auth to true, ensure we have a user
          const state = get();
          if (!state.user) {
            // Try to get user from localStorage
            try {
              const stored = localStorage.getItem('rushng-app-storage');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.state?.user) {
                  const user = parsed.state.user;
                  if (user.role) {
                    user.role = user.role.toLowerCase();
                  }
                  set({ user, isAuthenticated: true });
                  return;
                }
              }
            } catch (e) {
              console.error('Error restoring user from storage:', e);
            }
          }
          set({ isAuthenticated });
        }
      },

      // UI
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

      // Toast System
      toast: null,
      setToast: (toast) => set({ toast }),
      showToast: (message, type = 'info', durationMs = 4000) => {
        if (toastTimer) clearTimeout(toastTimer);

        set({ toast: { message, type } });

        toastTimer = setTimeout(() => {
          set({ toast: null });
        }, durationMs);
      },

      // Job Filters
      jobFilters: defaultJobFilters,
      setJobFilters: (filters) =>
        set((state) => ({
          jobFilters:
            typeof filters === 'function'
              ? filters(state.jobFilters)
              : { ...state.jobFilters, ...filters },
        })),
      resetJobFilters: () => set({ jobFilters: defaultJobFilters }),

      // Provider Filters
      providerFilters: defaultProviderFilters,
      setProviderFilters: (filters) =>
        set((state) => ({
          providerFilters:
            typeof filters === 'function'
              ? filters(state.providerFilters)
              : { ...state.providerFilters, ...filters },
        })),
      resetProviderFilters: () => set({ providerFilters: defaultProviderFilters }),

      // Auth Cleanup
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('access_token');
        }
        set({
          user: null,
          isAuthenticated: false,
          currentView: 'home',
          previousView: null,
        });
      },
    }),
    {
      name: 'rushng-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentView: state.currentView,
      }),
      onRehydrateStorage: () => (state) => {
        // Normalize role on rehydration
        if (state?.user?.role) {
          state.user.role = state.user.role.toLowerCase() as any;
        }
        state?.setHasHydrated(true);
      },
    }
  )
);