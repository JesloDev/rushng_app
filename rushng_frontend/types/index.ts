export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'customer' | 'provider' | 'admin' | 'support';
  is_verified: boolean;
  is_active: boolean;
  profile_picture?: string;
  created_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  skills: string[];
  years_experience: number;
  hourly_rate?: number;
  service_radius_km: number;
  verification_level: 'basic' | 'verified' | 'certified';
  is_available: boolean;
  rating: number;
  total_jobs_completed: number;
  total_jobs_cancelled: number;
  compliance_score: number;
  portfolio_urls: string[];
  user: User;
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
  start_time?: string;
  end_time?: string;
  check_in_time?: string;
  check_out_time?: string;
  check_in_photo?: string;
  check_out_photo?: string;
  created_at: string;
  customer?: User;
  provider?: Provider;
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
  type: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}