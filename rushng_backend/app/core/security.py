from flask_jwt_extended import create_access_token, create_refresh_token
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import random
import hashlib
import os

bcrypt = Bcrypt()

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.generate_password_hash(password).decode('utf-8')

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.check_password_hash(password_hash, password)

def generate_jwt_tokens(user_id):
    """Generate access and refresh tokens"""
    access_token = create_access_token(
        identity=str(user_id),
        expires_delta=timedelta(days=1)
    )
    refresh_token = create_refresh_token(
        identity=str(user_id),
        expires_delta=timedelta(days=30)
    )
    return access_token, refresh_token

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def hash_otp(otp):
    """Hash an OTP for secure storage"""
    salt = os.urandom(32).hex()
    hashed = hashlib.sha256(f"{salt}{otp}".encode()).hexdigest()
    return f"{salt}${hashed}"

def verify_otp(otp, stored_hash):
    """Verify an OTP against its stored hash"""
    salt, hashed = stored_hash.split('$')
    calculated = hashlib.sha256(f"{salt}{otp}".encode()).hexdigest()
    return hashed == calculated

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def generate_secure_token(length=32):
    """Generate a cryptographically secure token"""
    return os.urandom(length).hex()