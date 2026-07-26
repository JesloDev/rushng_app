// ============================================================
// USER & AUTH TYPES
// ============================================================

export type UserRole = 'customer' | 'provider' | 'admin' | 'support';

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================
// PROVIDER TYPES
// ============================================================

export type VerificationLevel = 'basic' | 'verified' | 'certified';

export interface Provider {
  id: string;
  user_id: string;
  skills: string[];
  years_experience: number;
  hourly_rate?: number;
  service_radius_km: number;
  verification_level: VerificationLevel;
  is_available: boolean;
  rating: number;
  total_jobs_completed: number;
  total_jobs_cancelled: number;
  compliance_score: number;
  portfolio_urls: string[];
  current_latitude?: number;
  current_longitude?: number;
  nin?: string;
  bvn?: string;
  id_card_url?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

// ============================================================
// JOB TYPES
// ============================================================

export type JobStatus =
  | 'posted'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

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
  latitude?: number;
  longitude?: number;
  status: JobStatus;
  estimated_price?: number;
  final_price?: number;
  start_time?: string;
  end_time?: string;
  check_in_time?: string;
  check_out_time?: string;
  check_in_photo?: string;
  check_out_photo?: string;
  created_at: string;
  updated_at?: string;
  customer?: User;
  provider?: Provider;
}

// ============================================================
// PAYMENT & ESCROW TYPES
// ============================================================

export type PaymentGateway = 'opay' | 'paystack' | 'flutterwave';
export type PaymentStatus =
  | 'pending'
  | 'held'
  | 'released'
  | 'refunded'
  | 'failed'
  | 'disputed';

export interface Payment {
  id: string;
  job_id: string;
  amount: number;
  platform_fee: number;
  provider_earnings: number;
  provider: PaymentGateway;
  reference: string;
  status: PaymentStatus;
  held_at?: string;
  released_at?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================
// VIOLATIONS & COMPLIANCE
// ============================================================

export type ViolationSeverity = 'minor' | 'major' | 'critical';
export type ViolationStatus =
  | 'pending_review'
  | 'confirmed'
  | 'dismissed'
  | 'appealed'
  | 'resolved';

export interface Violation {
  id: string;
  user_id: string;
  job_id?: string;
  type: string;
  severity: ViolationSeverity;
  title: string;
  description: string;
  status: ViolationStatus;
  points_deducted: number;
  created_at: string;
  updated_at?: string;
}

// ============================================================
// NOTIFICATIONS & REVIEWS
// ============================================================

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Rating {
  id: string;
  job_id: string;
  rater_id: string;
  target_id: string;
  rating: number;
  comment?: string;
  categories?: Record<string, number>;
  created_at: string;
}

// ============================================================
// API RESPONSE HELPERS
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}