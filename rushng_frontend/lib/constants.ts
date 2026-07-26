// ============================================================
// USER ROLES
// ============================================================

export const USER_ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  SUPPORT: 'support',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  provider: 'Provider',
  admin: 'Administrator',
  support: 'Support',
} as const;

// ============================================================
// JOB CATEGORIES
// ============================================================

export const JOB_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'tiling', label: 'Tiling' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'welding', label: 'Welding' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'errands', label: 'Errands' },
  { value: 'repair', label: 'Repair' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'installation', label: 'Installation' },
  { value: 'other', label: 'Other' },
] as const;

export type JobCategoryValue = (typeof JOB_CATEGORIES)[number]['value'];

// ============================================================
// JOB STATUSES
// ============================================================

export const JOB_STATUSES = {
  POSTED: 'posted',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  posted: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
} as const;

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  posted: 'bg-blue-100 text-blue-700 border-blue-200',
  assigned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  disputed: 'bg-purple-100 text-purple-700 border-purple-200',
} as const;

// ============================================================
// PAYMENT PROVIDERS & STATUSES
// ============================================================

export const PAYMENT_PROVIDERS = [
  { value: 'opay', label: 'OPay', icon: 'smartphone' },
  { value: 'paystack', label: 'Paystack', icon: 'credit-card' },
  { value: 'flutterwave', label: 'Flutterwave', icon: 'building' },
] as const;

export type PaymentProviderValue = (typeof PAYMENT_PROVIDERS)[number]['value'];

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  DISPUTED: 'disputed',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  held: 'bg-amber-100 text-amber-700',
  released: 'bg-emerald-100 text-emerald-700',
  refunded: 'bg-blue-100 text-blue-700',
  failed: 'bg-rose-100 text-rose-700',
  disputed: 'bg-purple-100 text-purple-700',
} as const;

// ============================================================
// VIOLATION TYPES
// ============================================================

export const VIOLATION_TYPES = [
  { value: 'no_show', label: 'No Show' },
  { value: 'poor_quality', label: 'Poor Quality Work' },
  { value: 'theft', label: 'Theft' },
  { value: 'damage', label: 'Damage' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'late_arrival', label: 'Late Arrival' },
  { value: 'incomplete_work', label: 'Incomplete Work' },
  { value: 'bad_communication', label: 'Bad Communication' },
  { value: 'cancellation', label: 'Cancellation' },
  { value: 'other', label: 'Other' },
] as const;

export type ViolationTypeValue = (typeof VIOLATION_TYPES)[number]['value'];

export const VIOLATION_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  CONFIRMED: 'confirmed',
  DISMISSED: 'dismissed',
  APPEALED: 'appealed',
  RESOLVED: 'resolved',
} as const;

export type ViolationStatus = (typeof VIOLATION_STATUSES)[keyof typeof VIOLATION_STATUSES];

// ============================================================
// APP CONSTANTS & LOCALIZATION
// ============================================================

export const APP_NAME = 'RUSHNG';
export const APP_DESCRIPTION = "Nigeria's Premier Service Marketplace";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const CURRENCY = 'NGN';
export const CURRENCY_SYMBOL = '₦';

// ============================================================
// PAGINATION
// ============================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============================================================
// FILE UPLOAD
// ============================================================

export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const MAX_FILE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ============================================================
// MESSAGES
// ============================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SAVED: 'Saved successfully!',
} as const;