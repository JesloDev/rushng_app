import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone):
    """Validate Nigerian phone number"""
    # Remove any spaces, dashes, parentheses
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    # Check if it's a valid Nigerian number
    pattern = r'^(\+234|0)[789][01]\d{8}$'
    return bool(re.match(pattern, phone))


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False
    if not any(c.isalpha() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    return True


def validate_nin(nin):
    """Validate NIN (11 digits)"""
    return bool(re.match(r'^[0-9]{11}$', nin))


def validate_bvn(bvn):
    """Validate BVN (11 digits)"""
    return bool(re.match(r'^[0-9]{11}$', bvn))


def validate_location(lat, lng):
    """Validate GPS coordinates"""
    if lat is None or lng is None:
        return False
    try:
        lat = float(lat)
        lng = float(lng)
        return -90 <= lat <= 90 and -180 <= lng <= 180
    except (ValueError, TypeError):
        return False


def validate_nigerian_state(state):
    """Validate Nigerian state"""
    states = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
        'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
        'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
        'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
        'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ]
    return state.title() in states


def validate_service_area(radius_km):
    """Validate service area radius"""
    try:
        radius = float(radius_km)
        return 1 <= radius <= 100
    except (ValueError, TypeError):
        return False


def validate_amount(amount):
    """Validate payment amount"""
    try:
        amount = float(amount)
        return amount > 0
    except (ValueError, TypeError):
        return False