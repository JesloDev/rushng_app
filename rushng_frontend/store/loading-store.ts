import { create } from 'zustand';

interface LoadingStore {
  isLoading: boolean;
  message: string | null;
  setLoading: (isLoading: boolean, message?: string) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  message: null,
  setLoading: (isLoading, message = null) => set({ isLoading, message }),
  startLoading: (message = null) => set({ isLoading: true, message }),
  stopLoading: () => set({ isLoading: false, message: null }),
}));