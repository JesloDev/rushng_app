import re
import uuid
from datetime import datetime
from decimal import Decimal

def generate_slug(text):
    """Generate a URL-friendly slug from text"""
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug


def format_currency(amount, currency='NGN'):
    """Format amount as currency"""
    if isinstance(amount, (int, float, Decimal)):
        return f"₦{amount:,.2f}"
    return f"₦0.00"


def truncate_text(text, max_length=100, suffix='...'):
    """Truncate text to max_length with suffix"""
    if not text:
        return ''
    if len(text) <= max_length:
        return text
    return text[:max_length] + suffix


def calculate_age(birth_date):
    """Calculate age from birth date"""
    if not birth_date:
        return None
    today = datetime.utcnow().date()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


def generate_tracking_code():
    """Generate a unique tracking code"""
    return f"RSH-{uuid.uuid4().hex[:8].upper()}"


def generate_otp():
    """Generate a 6-digit OTP"""
    import random
    return ''.join(str(random.randint(0, 9)) for _ in range(6))


def generate_id():
    """Generate a unique ID"""
    return str(uuid.uuid4())


def parse_boolean(value):
    """Parse boolean from string"""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', 'yes', '1', 'on')
    return bool(value)


def get_client_ip(request):
    """Get client IP address from request"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    if request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    return request.remote_addr


def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not text:
        return ''
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove script tags
    text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL)
    return text.strip()


def validate_image_size(size_bytes, max_mb=5):
    """Validate image size"""
    max_bytes = max_mb * 1024 * 1024
    return size_bytes <= max_bytes


def get_file_extension(filename):
    """Get file extension from filename"""
    if not filename:
        return ''
    return filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''


def is_allowed_image(filename):
    """Check if file is an allowed image type"""
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'}
    ext = get_file_extension(filename)
    return ext in allowed_extensions


def generate_random_string(length=8):
    """Generate a random string"""
    import string
    import random
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def time_ago(dt):
    """Human readable time difference"""
    if not dt:
        return ''
    diff = datetime.utcnow() - dt
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)}s ago"
    if seconds < 3600:
        return f"{int(seconds / 60)}m ago"
    if seconds < 86400:
        return f"{int(seconds / 3600)}h ago"
    if seconds < 604800:
        return f"{int(seconds / 86400)}d ago"
    return dt.strftime('%Y-%m-%d')