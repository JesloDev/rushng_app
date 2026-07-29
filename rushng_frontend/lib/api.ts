import axios from 'axios';
import { ApiResponse } from '@/types';

// Flask routes are all prefixed with /api
// Example: /api/auth/login, /api/jobs, /api/providers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Remove trailing slashes to match Flask routes
    if (config.url) {
      config.url = config.url.replace(/\/+$/, '');
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the full URL for debugging
    console.log('📤 API Request:', config.method?.toUpperCase(), `${API_BASE_URL}${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error:', error);
      return Promise.reject({
        ...error,
        message: 'Unable to connect to server. Please check your connection.',
        isNetworkError: true
      });
    }
    
    // Handle 401 unauthorized - try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
          if (response.data?.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('🔄 Refresh token failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Log error for debugging
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API - Matches Flask routes: /api/auth/*
// ============================================================
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: any; access_token: string; refresh_token?: string }>>('/auth/login', data),
  
  register: (data: { full_name: string; email: string; phone: string; password: string; role?: string }) =>
    api.post<ApiResponse<{ user: any }>>('/auth/register', data),
  
  verify: (data: { email: string; code: string }) =>
    api.post<ApiResponse>('/auth/verify', data),
  
  resendVerification: (data: { email: string }) =>
    api.post<ApiResponse>('/auth/resend-verification', data),
  
  me: () =>
    api.get<ApiResponse<{ user: any }>>('/auth/me'),
  
  logout: () =>
    api.post<ApiResponse>('/auth/logout'),
  
  updateProfile: (data: any) =>
    api.put<ApiResponse<{ user: any }>>('/auth/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post<ApiResponse>('/auth/change-password', data),
  
  deleteAccount: () =>
    api.delete<ApiResponse>('/auth/delete-account'),
  
  refresh: (data: { refresh_token: string }) =>
    api.post<ApiResponse<{ access_token: string }>>('/auth/refresh', data),
};

// ============================================================
// JOB API - Matches Flask routes: /api/jobs/*
// ============================================================
export const jobApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ jobs: any[] }>>('/jobs', { params }),
  
  get: (id: string) =>
    api.get<ApiResponse<{ job: any }>>(`/jobs/${id}`),
  
  create: (data: any) =>
    api.post<ApiResponse<{ job: any }>>('/jobs', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<{ job: any }>>(`/jobs/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse>(`/jobs/${id}`),
  
  getMyJobs: () =>
    api.get<ApiResponse<{ jobs: any[] }>>('/jobs/my'),
  
  // Provider stats endpoints
  getCustomerStats: () =>
    api.get<ApiResponse<any>>('/jobs/stats/customer'),
  
  getRecentDeliveries: () =>
    api.get<ApiResponse<any[]>>('/jobs/recent'),
  
  getWeeklySpending: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/jobs/spending/weekly'),
  
  getProviderStats: () =>
    api.get<ApiResponse<any>>('/jobs/stats/provider'),
  
  getAvailableJobs: () =>
    api.get<ApiResponse<any[]>>('/jobs/available'),
  
  getDailyEarnings: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/jobs/earnings/daily'),
};

// ============================================================
// PROVIDER API - Matches Flask routes: /api/providers/*
// ============================================================
export const providerApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ providers: any[] }>>('/providers', { params }),
  
  get: (id: string) =>
    api.get<ApiResponse<{ provider: any }>>(`/providers/${id}`),
  
  getMe: () =>
    api.get<ApiResponse<{ provider: any }>>('/providers/me'),
  
  register: (data: any) =>
    api.post<ApiResponse<{ provider: any }>>('/providers/register', data),
  
  update: (data: any) =>
    api.put<ApiResponse<{ provider: any }>>('/providers/me', data),
  
  verify: (data: any) =>
    api.post<ApiResponse>('/providers/verify', data),
};

// ============================================================
// ADMIN API - Matches Flask routes: /api/admin/*
// ============================================================
export const adminApi = {
  getMetrics: () =>
    api.get<ApiResponse<any>>('/admin/metrics'),
  
  getRegionStats: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/admin/regions'),
  
  getSystemLogs: () =>
    api.get<ApiResponse<any[]>>('/admin/logs'),
  
  getRevenueData: () =>
    api.get<ApiResponse<{ label: string; value: number }[]>>('/admin/revenue'),
};

// ============================================================
// USER API - Matches Flask routes: /api/users/*
// ============================================================
export const userApi = {
  getProfileStats: () =>
    api.get<ApiResponse<any>>('/users/stats'),
  
  updateProfile: (data: any) =>
    api.put<ApiResponse<{ user: any }>>('/users/profile', data),
  
  getSecuritySettings: () =>
    api.get<ApiResponse<any>>('/users/security'),
  
  updatePreferences: (data: any) =>
    api.put<ApiResponse>('/users/preferences', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post<ApiResponse>('/users/change-password', data),
};

// ============================================================
// PAYMENT API - Matches Flask routes: /api/payments/*
// ============================================================
export const paymentApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ payments: any[] }>>('/payments', { params }),
  
  get: (id: string) =>
    api.get<ApiResponse<{ payment: any }>>(`/payments/${id}`),
  
  create: (data: any) =>
    api.post<ApiResponse<{ payment: any }>>('/payments', data),
  
  verify: (data: { reference: string }) =>
    api.post<ApiResponse>('/payments/verify', data),
};

// ============================================================
// RATINGS API - Matches Flask routes: /api/ratings/*
// ============================================================
export const ratingApi = {
  create: (data: any) =>
    api.post<ApiResponse<{ rating: any }>>('/ratings', data),
  
  getForTarget: (targetId: string) =>
    api.get<ApiResponse<{ ratings: any[] }>>(`/ratings/target/${targetId}`),
};

// ============================================================
// NOTIFICATIONS API - Matches Flask routes: /api/notifications/*
// ============================================================
export const notificationApi = {
  list: () =>
    api.get<ApiResponse<{ notifications: any[] }>>('/notifications'),
  
  markAsRead: (id: string) =>
    api.put<ApiResponse>(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.put<ApiResponse>('/notifications/read-all'),
};

// ============================================================
// VIOLATIONS API - Matches Flask routes: /api/violations/*
// ============================================================
export const violationApi = {
  list: (params?: any) =>
    api.get<ApiResponse<{ violations: any[] }>>('/violations', { params }),
  
  create: (data: any) =>
    api.post<ApiResponse<{ violation: any }>>('/violations', data),
  
  get: (id: string) =>
    api.get<ApiResponse<{ violation: any }>>(`/violations/${id}`),
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const handleApiError = (error: any): string => {
  if (error.isNetworkError) {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export default api;