"""
Helper utility functions for RUSHNG
"""

import re
import uuid
import random
import string
from datetime import datetime
from decimal import Decimal
import json
from functools import wraps
import time
from flask import request


def generate_slug(text):
    """Generate a URL-friendly slug from text"""
    if not text:
        return ''
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug


def format_currency(amount, currency='NGN'):
    """Format amount as currency"""
    if amount is None:
        return '₦0'
    if isinstance(amount, (int, float, Decimal)):
        return f"₦{amount:,.2f}"
    return '₦0'


def truncate_text(text, max_length=100, suffix='...'):
    """Truncate text to max_length with suffix"""
    if not text:
        return ''
    if len(text) <= max_length:
        return text
    return text[:max_length].strip() + suffix


def calculate_age(birth_date):
    """Calculate age from birth date"""
    if not birth_date:
        return None
    today = datetime.utcnow().date()
    if hasattr(birth_date, 'date'):
        birth_date = birth_date.date()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


def generate_tracking_code():
    """Generate a unique tracking code"""
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    code = ''.join(random.choices(chars, k=8))
    return f"RSH-{code}"


def generate_otp(length=6):
    """Generate a random OTP of specified length"""
    return ''.join(random.choices('0123456789', k=length))


def generate_id():
    """Generate a unique UUID"""
    return str(uuid.uuid4())


def parse_boolean(value):
    """Parse boolean from string or other types"""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', 'yes', '1', 'on', 'y')
    return bool(value)


def get_client_ip():
    """Get client IP address from request"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
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
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'}
    ext = get_file_extension(filename)
    return ext in allowed_extensions


def generate_random_string(length=8):
    """Generate a random string"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))


def time_ago(dt):
    """Human readable time difference"""
    if not dt:
        return ''
    if hasattr(dt, 'replace'):
        dt = dt.replace(tzinfo=None)
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


def deep_clone(obj):
    """Deep clone an object using JSON serialization"""
    try:
        return json.loads(json.dumps(obj))
    except (TypeError, json.JSONDecodeError):
        # Fallback for objects that can't be JSON serialized
        if isinstance(obj, dict):
            return {k: deep_clone(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [deep_clone(v) for v in obj]
        elif hasattr(obj, '__dict__'):
            return deep_clone(obj.__dict__)
        return obj


def debounce(wait):
    """
    Debounce decorator - prevents a function from being called too frequently.
    
    Args:
        wait: Time in milliseconds to wait before calling the function
        
    Returns:
        Decorated function
    """
    def decorator(func):
        last_call = {'time': 0}
        timeout = {'timer': None}
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            def call():
                return func(*args, **kwargs)
            
            current_time = time.time() * 1000
            elapsed = current_time - last_call['time']
            
            if timeout['timer']:
                # Clear existing timer
                pass
            
            if elapsed >= wait:
                last_call['time'] = current_time
                return call()
            else:
                return None
        
        return wrapper
    return decorator


def format_phone_number(phone):
    """Format Nigerian phone number to standard format"""
    if not phone:
        return phone
    # Remove any spaces, dashes, parentheses
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    # If it starts with 0, replace with +234
    if phone.startswith('0'):
        phone = '+234' + phone[1:]
    # If it doesn't start with +, add +234
    if not phone.startswith('+'):
        phone = '+234' + phone
    return phone


def mask_email(email):
    """Mask email for privacy (e.g., j***@example.com)"""
    if not email:
        return ''
    parts = email.split('@')
    if len(parts) != 2:
        return email
    username, domain = parts
    if len(username) <= 2:
        masked_username = username[0] + '***'
    else:
        masked_username = username[0] + '***' + username[-1]
    return f"{masked_username}@{domain}"


def mask_phone(phone):
    """Mask phone number for privacy"""
    if not phone:
        return ''
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    if len(phone) <= 4:
        return phone
    return phone[:4] + '****' + phone[-2:]


def extract_coordinates(location_text):
    """Extract latitude and longitude from text"""
    if not location_text:
        return None, None
    
    # Try to find coordinates in format: lat, lng or lat/lng
    pattern = r'(-?\d+\.?\d*)\s*[,/]\s*(-?\d+\.?\d*)'
    match = re.search(pattern, location_text)
    if match:
        return float(match.group(1)), float(match.group(2))
    
    return None, None


def is_valid_uuid(uuid_str):
    """Check if string is a valid UUID"""
    try:
        uuid.UUID(uuid_str)
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def merge_dicts(dict1, dict2):
    """Deep merge two dictionaries"""
    result = deep_clone(dict1)
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = deep_clone(value)
    return result


def paginate_list(items, page, per_page):
    """Paginate a list"""
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    return {
        'items': items[start:end],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page if total > 0 else 0
        }
    }


def format_datetime(dt, format_string='%Y-%m-%d %H:%M:%S'):
    """Format datetime to string"""
    if not dt:
        return None
    if hasattr(dt, 'strftime'):
        return dt.strftime(format_string)
    return str(dt)


def parse_datetime(dt_str):
    """Parse datetime from string"""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        return None