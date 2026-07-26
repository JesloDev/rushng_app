import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'sonner';

// ============================================================
// BASE CONFIG & URL SANITIZATION
// ============================================================

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BASE_HOST = RAW_URL.replace(/\/api\/?$/, '');

const api: AxiosInstance = axios.create({
  baseURL: `${BASE_HOST}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ============================================================
// REFRESH CONCURRENCY QUEUE
// ============================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to safely access localStorage during SSR/SSG
const getStoredToken = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

// ============================================================
// INTERCEPTORS
// ============================================================

// Request interceptor - Add Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Token refresh & global error handler
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - execute token refresh queue
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getStoredToken('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${BASE_HOST}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const access_token =
          response.data?.data?.access_token || response.data?.access_token;

        if (!access_token) {
          throw new Error('Failed to retrieve new access token');
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
        }

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }

        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Standard toast notifications for non-401 errors
    if (error.response?.status !== 401) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// ============================================================
// TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  providers?: T[];
  jobs?: T[];
  violations?: T[];
  notifications?: T[];
  data?: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'customer' | 'provider' | 'admin' | 'support';
  is_verified: boolean;
  is_active: boolean;
  profile_picture?: string;
  address?: string;
  city?: string;
  state?: string;
  created_at: string;
}

export interface Job {
  id: string;
  customer_id: string;
  provider_id?: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  address: string;
  city?: string;
  state?: string;
  status: 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  estimated_price?: number;
  final_price?: number;
  check_in_time?: string;
  check_out_time?: string;
  check_in_photo?: string;
  check_out_photo?: string;
  created_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  business_name?: string;
  bio?: string;
  skills: string[];
  hourly_rate?: number;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  user?: User;
  created_at: string;
}

export interface Payment {
  id: string;
  job_id: string;
  amount: number;
  platform_fee: number;
  provider_earnings: number;
  provider: 'opay' | 'paystack' | 'flutterwave';
  reference: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed' | 'disputed';
  created_at: string;
}

export interface Violation {
  id: string;
  user_id: string;
  job_id?: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  title: string;
  description: string;
  status: 'pending_review' | 'confirmed' | 'dismissed' | 'appealed' | 'resolved';
  points_deducted: number;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'payment' | 'rating' | 'violation' | 'system' | 'user';
  is_read: boolean;
  created_at: string;
}

export interface Rating {
  id: string;
  job_id: string;
  rater_id: string;
  target_id: string;
  rating: number;
  comment?: string;
  categories: Record<string, number>;
  created_at: string;
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  register: (data: Record<string, any>) => api.post<ApiResponse<User>>('/auth/register', data),
  login: (data: Record<string, any>) => api.post<ApiResponse<{ access_token: string; refresh_token: string; user: User }>>('/auth/login', data),
  verify: (data: Record<string, any>) => api.post<ApiResponse<any>>('/auth/verify', data),
  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  refresh: (data: { refresh_token: string }) => api.post<ApiResponse<{ access_token: string }>>('/auth/refresh', data),
  me: () => api.get<ApiResponse<User>>('/auth/me'),

  resendVerification: (data: { email: string }) => api.post<ApiResponse<void>>('/auth/resend-verification', data),
  forgotPassword: (data: { email: string }) => api.post<ApiResponse<void>>('/auth/forgot-password', data),
  resetPassword: (data: { token: string; new_password: string }) => api.post<ApiResponse<void>>('/auth/reset-password', data),
  changePassword: (data: { current_password: string; new_password: string }) => api.post<ApiResponse<void>>('/auth/change-password', data),

  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/auth/profile', data),
  deleteAccount: () => api.delete<ApiResponse<void>>('/auth/me'),
};

// ============================================================
// JOBS API
// ============================================================

export const jobApi = {
  create: (data: Record<string, any>) => api.post<ApiResponse<Job>>('/jobs', data),
  list: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Job>>>('/jobs', { params }),
  get: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),
  update: (id: string, data: Record<string, any>) => api.put<ApiResponse<Job>>(`/jobs/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/jobs/${id}`),

  my: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Job> | Job[]>>('/jobs/my', { params }),

  apply: (id: string, data?: Record<string, any>) => api.post<ApiResponse<any>>(`/jobs/${id}/apply`, data),
  assign: (id: string, data: { provider_id: string }) => api.post<ApiResponse<Job>>(`/jobs/${id}/assign`, data),

  checkIn: (id: string, data: Record<string, any>) => api.post<ApiResponse<Job>>(`/jobs/${id}/check-in`, data),
  checkOut: (id: string, data: Record<string, any>) => api.post<ApiResponse<Job>>(`/jobs/${id}/check-out`, data),

  confirm: (id: string, data?: Record<string, any>) => api.post<ApiResponse<Job>>(`/jobs/${id}/confirm`, data),
  cancel: (id: string, data?: Record<string, any>) => api.put<ApiResponse<Job>>(`/jobs/${id}/cancel`, data),

  track: (id: string) => api.get<ApiResponse<any>>(`/jobs/${id}/track`),
  estimate: (data: Record<string, any>) => api.post<ApiResponse<{ estimated_price: number }>>('/jobs/estimate', data),
};

// ============================================================
// PROVIDERS API
// ============================================================

export const providerApi = {
  register: (data: Record<string, any>) => api.post<ApiResponse<Provider>>('/providers/register', data),
  me: () => api.get<ApiResponse<Provider>>('/providers/me'),
  update: (data: Record<string, any>) => api.put<ApiResponse<Provider>>('/providers/me', data),

  verify: (data: Record<string, any>) => api.post<ApiResponse<any>>('/providers/verify', data),
  getVerificationStatus: () => api.get<ApiResponse<any>>('/providers/verify/status'),

  search: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Provider>>>('/providers/search', { params }),
  get: (id: string) => api.get<ApiResponse<Provider>>(`/providers/${id}`),

  stats: () => api.get<ApiResponse<Record<string, any>>>('/providers/me/stats'),
  availability: (data: { is_available: boolean; schedule?: any }) => api.put<ApiResponse<any>>('/providers/me/availability', data),

  addPortfolio: (data: Record<string, any>) => api.post<ApiResponse<any>>('/providers/portfolio', data),
  removePortfolio: (id: string) => api.delete<ApiResponse<void>>(`/providers/portfolio/${id}`),
};

// ============================================================
// PAYMENTS API
// ============================================================

export const paymentApi = {
  initialize: (data: Record<string, any>) => api.post<ApiResponse<any>>('/payments/initialize', data),
  verify: (data: { reference: string }) => api.post<ApiResponse<Payment>>('/payments/verify', data),

  get: (id: string) => api.get<ApiResponse<Payment>>(`/payments/${id}`),
  job: (jobId: string) => api.get<ApiResponse<Payment[] | { payments: Payment[] }>>(`/payments/job/${jobId}`),
  me: () => api.get<ApiResponse<Payment[] | { payments: Payment[] }>>('/payments/me'),

  webhook: (provider: string, data: Record<string, any>) => api.post<ApiResponse<void>>(`/payments/webhook/${provider}`, data),
  getMethods: () => api.get<ApiResponse<any>>('/payments/methods'),
};

// ============================================================
// VIOLATIONS API
// ============================================================

export const violationApi = {
  report: (data: Record<string, any>) => api.post<ApiResponse<Violation>>('/violations', data),

  list: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Violation>>>('/violations', { params }),
  my: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Violation> | Violation[]>>('/violations/my', { params }),
  get: (id: string) => api.get<ApiResponse<Violation>>(`/violations/${id}`),

  appeal: (id: string, data: Record<string, any>) => api.post<ApiResponse<Violation>>(`/violations/${id}/appeal`, data),
  stats: () => api.get<ApiResponse<Record<string, any>>>('/violations/stats'),
};

// ============================================================
// RATINGS API
// ============================================================

export const ratingApi = {
  create: (data: Record<string, any>) => api.post<ApiResponse<Rating>>('/ratings', data),

  user: (userId: string) => api.get<ApiResponse<Rating[]>>(`/ratings/user/${userId}`),
  me: () => api.get<ApiResponse<Rating[]>>('/ratings/me'),
  job: (jobId: string) => api.get<ApiResponse<Rating[]>>(`/ratings/job/${jobId}`),

  stats: (userId: string) => api.get<ApiResponse<Record<string, any>>>(`/ratings/stats/${userId}`),
};

// ============================================================
// NOTIFICATIONS API
// ============================================================

export const notificationApi = {
  list: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params }),

  markRead: (id: string) => api.put<ApiResponse<void>>(`/notifications/${id}/read`),
  markAllRead: () => api.put<ApiResponse<void>>('/notifications/read-all'),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/notifications/${id}`),
  deleteAll: () => api.delete<ApiResponse<void>>('/notifications'),

  unreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};

// ============================================================
// ADMIN API
// ============================================================

export const adminApi = {
  stats: () => api.get<ApiResponse<Record<string, any>>>('/admin/stats'),

  users: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params }),
  getUser: (id: string) => api.get<ApiResponse<User>>(`/admin/users/${id}`),
  banUser: (id: string) => api.put<ApiResponse<User>>(`/admin/users/${id}/ban`),
  unbanUser: (id: string) => api.put<ApiResponse<User>>(`/admin/users/${id}/unban`),
  verifyProvider: (id: string) => api.put<ApiResponse<User>>(`/admin/users/${id}/verify-provider`),

  jobs: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Job>>>('/admin/jobs', { params }),
  getJob: (id: string) => api.get<ApiResponse<Job>>(`/admin/jobs/${id}`),
  deleteJob: (id: string) => api.delete<ApiResponse<void>>(`/admin/jobs/${id}`),

  violations: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Violation>>>('/admin/violations', { params }),
  reviewViolation: (id: string, data: Record<string, any>) => api.put<ApiResponse<Violation>>(`/admin/violations/${id}/review`, data),

  payments: (params?: Record<string, any>) => api.get<ApiResponse<PaginatedResponse<Payment>>>('/admin/payments', { params }),
  refundPayment: (id: string) => api.post<ApiResponse<Payment>>(`/admin/payments/${id}/refund`),
};

export default api;