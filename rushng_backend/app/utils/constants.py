from app.models.job import JobCategory, JobStatus
from app.models.payment import PaymentStatus, PaymentProvider
from app.models.violation import ViolationType, ViolationSeverity
from app.models.user import UserRole

# ==================== ROLES ====================

ROLES = {
    'CUSTOMER': UserRole.CUSTOMER,
    'PROVIDER': UserRole.PROVIDER,
    'ADMIN': UserRole.ADMIN,
    'SUPPORT': UserRole.SUPPORT
}

ROLE_LABELS = {
    'customer': 'Customer',
    'provider': 'Provider',
    'admin': 'Administrator',
    'support': 'Support'
}

# ==================== JOB CATEGORIES ====================

JOB_CATEGORIES = {
    'PLUMBING': JobCategory.PLUMBING,
    'ELECTRICAL': JobCategory.ELECTRICAL,
    'CARPENTRY': JobCategory.CARPENTRY,
    'PAINTING': JobCategory.PAINTING,
    'TILING': JobCategory.TILING,
    'MASONRY': JobCategory.MASONRY,
    'WELDING': JobCategory.WELDING,
    'CLEANING': JobCategory.CLEANING,
    'LAUNDRY': JobCategory.LAUNDRY,
    'SHOPPING': JobCategory.SHOPPING,
    'ERRANDS': JobCategory.ERRANDS,
    'REPAIR': JobCategory.REPAIR,
    'MAINTENANCE': JobCategory.MAINTENANCE,
    'INSTALLATION': JobCategory.INSTALLATION,
    'OTHER': JobCategory.OTHER
}

JOB_CATEGORY_LABELS = {
    'plumbing': 'Plumbing',
    'electrical': 'Electrical',
    'carpentry': 'Carpentry',
    'painting': 'Painting',
    'tiling': 'Tiling',
    'masonry': 'Masonry',
    'welding': 'Welding',
    'cleaning': 'Cleaning',
    'laundry': 'Laundry',
    'shopping': 'Shopping',
    'errands': 'Errands',
    'repair': 'Repair',
    'maintenance': 'Maintenance',
    'installation': 'Installation',
    'other': 'Other'
}

# ==================== JOB STATUSES ====================

JOB_STATUSES = {
    'POSTED': JobStatus.POSTED,
    'ASSIGNED': JobStatus.ASSIGNED,
    'IN_PROGRESS': JobStatus.IN_PROGRESS,
    'COMPLETED': JobStatus.COMPLETED,
    'CANCELLED': JobStatus.CANCELLED,
    'DISPUTED': JobStatus.DISPUTED
}

JOB_STATUS_LABELS = {
    'posted': 'Posted',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'disputed': 'Disputed'
}

JOB_STATUS_COLORS = {
    'posted': '#FFB800',      # Yellow
    'assigned': '#2196F3',    # Blue
    'in_progress': '#FF9800', # Orange
    'completed': '#4CAF50',   # Green
    'cancelled': '#F44336',   # Red
    'disputed': '#9C27B0'     # Purple
}

# ==================== PAYMENT STATUSES ====================

PAYMENT_STATUSES = {
    'PENDING': PaymentStatus.PENDING,
    'HELD': PaymentStatus.HELD,
    'RELEASED': PaymentStatus.RELEASED,
    'REFUNDED': PaymentStatus.REFUNDED,
    'FAILED': PaymentStatus.FAILED,
    'DISPUTED': PaymentStatus.DISPUTED
}

PAYMENT_STATUS_LABELS = {
    'pending': 'Pending',
    'held': 'Held in Escrow',
    'released': 'Released',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'disputed': 'Disputed'
}

# ==================== PAYMENT PROVIDERS ====================

PAYMENT_PROVIDERS = {
    'OPAY': PaymentProvider.OPAY,
    'PAYSTACK': PaymentProvider.PAYSTACK,
    'FLUTTERWAVE': PaymentProvider.FLUTTERWAVE
}

PAYMENT_PROVIDER_NAMES = {
    'opay': 'OPay',
    'paystack': 'Paystack',
    'flutterwave': 'Flutterwave'
}

# ==================== VIOLATION TYPES ====================

VIOLATION_TYPES = {
    'NO_SHOW': ViolationType.NO_SHOW,
    'POOR_QUALITY': ViolationType.POOR_QUALITY,
    'THEFT': ViolationType.THEFT,
    'DAMAGE': ViolationType.DAMAGE,
    'HARASSMENT': ViolationType.HARASSMENT,
    'FRAUD': ViolationType.FRAUD,
    'LATE_ARRIVAL': ViolationType.LATE_ARRIVAL,
    'INCOMPLETE_WORK': ViolationType.INCOMPLETE_WORK,
    'BAD_COMMUNICATION': ViolationType.BAD_COMMUNICATION,
    'CANCELLATION': ViolationType.CANCELLATION,
    'OTHER': ViolationType.OTHER
}

VIOLATION_TYPE_LABELS = {
    'no_show': 'No Show',
    'poor_quality': 'Poor Quality Work',
    'theft': 'Theft',
    'damage': 'Damage',
    'harassment': 'Harassment',
    'fraud': 'Fraud',
    'late_arrival': 'Late Arrival',
    'incomplete_work': 'Incomplete Work',
    'bad_communication': 'Bad Communication',
    'cancellation': 'Cancellation',
    'other': 'Other'
}

# ==================== VIOLATION SEVERITY ====================

VIOLATION_SEVERITY = {
    'MINOR': ViolationSeverity.MINOR,
    'MAJOR': ViolationSeverity.MAJOR,
    'CRITICAL': ViolationSeverity.CRITICAL
}

VIOLATION_SEVERITY_LABELS = {
    'minor': 'Minor',
    'major': 'Major',
    'critical': 'Critical'
}

VIOLATION_SEVERITY_POINTS = {
    'minor': 3,
    'major': 7,
    'critical': 15
}

# ==================== ERROR MESSAGES ====================

ERROR_MESSAGES = {
    'not_found': 'Resource not found',
    'unauthorized': 'Unauthorized access',
    'forbidden': 'Access forbidden',
    'bad_request': 'Invalid request',
    'validation_error': 'Validation error',
    'server_error': 'Internal server error',
    'rate_limit': 'Too many requests. Please try again later.',
    'invalid_credentials': 'Invalid credentials',
    'user_exists': 'User already exists',
    'email_exists': 'Email already registered',
    'phone_exists': 'Phone number already registered',
    'invalid_email': 'Invalid email format',
    'invalid_phone': 'Invalid phone number',
    'invalid_password': 'Password must be at least 8 characters with letters and numbers',
    'invalid_nin': 'Invalid NIN format',
    'invalid_bvn': 'Invalid BVN format',
    'invalid_location': 'Invalid location coordinates',
    'job_not_found': 'Job not found',
    'payment_failed': 'Payment failed',
    'violation_reported': 'Violation already reported',
    'account_deleted': 'Account deleted successfully'
}

# ==================== SUCCESS MESSAGES ====================

SUCCESS_MESSAGES = {
    'user_created': 'User created successfully',
    'user_verified': 'User verified successfully',
    'user_logged_in': 'User logged in successfully',
    'user_logged_out': 'User logged out successfully',
    'user_updated': 'User updated successfully',
    'user_deleted': 'User deleted successfully',
    'job_created': 'Job created successfully',
    'job_updated': 'Job updated successfully',
    'job_cancelled': 'Job cancelled successfully',
    'job_completed': 'Job completed successfully',
    'payment_processed': 'Payment processed successfully',
    'payment_released': 'Payment released successfully',
    'rating_created': 'Rating created successfully',
    'violation_reported': 'Violation reported successfully',
    'violation_resolved': 'Violation resolved successfully',
    'notification_sent': 'Notification sent successfully'
}

# ==================== APP CONFIG ====================

APP_CONFIG = {
    'MAX_IMAGE_SIZE_MB': 5,
    'MAX_OTP_ATTEMPTS': 3,
    'OTP_EXPIRY_MINUTES': 10,
    'JOB_SEARCH_RADIUS_KM': 10,
    'PROVIDER_SEARCH_RADIUS_KM': 20,
    'MIN_JOBS_FOR_RATING': 3,
    'PLATFORM_FEE_PERCENTAGE': 10,
    'VIOLATION_POINTS_RESET_DAYS': 90,
    'ACCOUNT_DELETION_COOLDOWN_DAYS': 7,
    'MAX_JOBS_PER_PROVIDER': 5,
    'MIN_PROVIDER_RATING': 3.0
}