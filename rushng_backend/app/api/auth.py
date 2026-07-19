from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime, timedelta
import re

from app.core.database import db
from app.core.security import (
    hash_password, verify_password, generate_otp, hash_otp, verify_otp
)
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.services.notification_service import NotificationService
from app.utils.validators import (
    validate_email, validate_phone, validate_password,
    validate_nin, validate_bvn
)
from app.core.logging import log_user_action, log_security_event

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'phone', 'password', 'full_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'error': f'Missing required field: {field}'
            }), 400
    
    # Validate email
    if not validate_email(data['email']):
        return jsonify({
            'success': False,
            'error': 'Invalid email format'
        }), 400
    
    # Validate phone
    if not validate_phone(data['phone']):
        return jsonify({
            'success': False,
            'error': 'Invalid phone number. Must be a valid Nigerian number.'
        }), 400
    
    # Validate password
    if not validate_password(data['password']):
        return jsonify({
            'success': False,
            'error': 'Password must be at least 8 characters with letters and numbers'
        }), 400
    
    # Check if user exists
    existing_user = User.query.filter(
        (User.email == data['email']) | (User.phone == data['phone'])
    ).first()
    
    if existing_user:
        return jsonify({
            'success': False,
            'error': 'User with this email or phone already exists'
        }), 409
    
    # Create user
    user = User(
        email=data['email'],
        phone=data['phone'],
        password_hash=hash_password(data['password']),
        full_name=data['full_name'],
        role=UserRole.CUSTOMER,
        is_verified=False
    )
    
    # If role is provider, set up provider profile
    if data.get('role') == 'provider':
        user.role = UserRole.PROVIDER
        user.is_verified_provider = False
        user.verification_status = 'pending'
        
        # Create provider profile
        provider = Provider(
            user=user,
            skills=data.get('skills', []),
            years_experience=data.get('years_experience', 0),
            hourly_rate=data.get('hourly_rate'),
            service_radius_km=data.get('service_radius_km', 10)
        )
        db.session.add(provider)
    
    # Generate verification code
    verification_code = generate_otp()
    user.verification_code = hash_otp(verification_code)
    user.verification_sent_at = datetime.utcnow()
    
    db.session.add(user)
    db.session.commit()
    
    # Send verification code via SMS
    try:
        NotificationService.send_verification_sms(user.phone, verification_code)
    except Exception as e:
        app.logger.error(f"Failed to send verification SMS: {e}")
    
    log_user_action(app, user.id, 'user_registered', {
        'email': user.email,
        'role': user.role.value if user.role else None
    })
    
    return jsonify({
        'success': True,
        'message': 'Registration successful. Please verify your account.',
        'data': {
            'user': user.to_dict(include_sensitive=True),
            'verification_sent': True
        }
    }), 201


@auth_bp.route('/verify', methods=['POST'])
def verify_account():
    """Verify user account with OTP"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('code'):
        return jsonify({
            'success': False,
            'error': 'Email and verification code required'
        }), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    if user.is_verified:
        return jsonify({
            'success': False,
            'error': 'Account already verified'
        }), 400
    
    # Check if verification code is expired (10 minutes)
    if user.verification_sent_at and (
        datetime.utcnow() - user.verification_sent_at
    ) > timedelta(minutes=10):
        return jsonify({
            'success': False,
            'error': 'Verification code expired. Request a new one.'
        }), 400
    
    # Verify code
    if not verify_otp(data['code'], user.verification_code):
        return jsonify({
            'success': False,
            'error': 'Invalid verification code'
        }), 400
    
    user.is_verified = True
    user.verification_code = None
    db.session.commit()
    
    # Generate JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    log_user_action(app, user.id, 'user_verified')
    
    return jsonify({
        'success': True,
        'message': 'Account verified successfully',
        'data': {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    }), 200


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification code"""
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({
            'success': False,
            'error': 'Email required'
        }), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    if user.is_verified:
        return jsonify({
            'success': False,
            'error': 'Account already verified'
        }), 400
    
    # Generate new verification code
    verification_code = generate_otp()
    user.verification_code = hash_otp(verification_code)
    user.verification_sent_at = datetime.utcnow()
    db.session.commit()
    
    # Send verification code via SMS
    try:
        NotificationService.send_verification_sms(user.phone, verification_code)
    except Exception as e:
        app.logger.error(f"Failed to send verification SMS: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Verification code sent successfully'
    }), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': 'Email and password required'
        }), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'Invalid credentials'
        }), 401
    
    if not verify_password(data['password'], user.password_hash):
        return jsonify({
            'success': False,
            'error': 'Invalid credentials'
        }), 401
    
    if not user.is_active:
        return jsonify({
            'success': False,
            'error': 'Account is deactivated. Contact support.'
        }), 403
    
    if not user.is_verified:
        return jsonify({
            'success': False,
            'error': 'Account not verified. Please check your email/phone.'
        }), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    log_user_action(app, user.id, 'user_login')
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'data': {
            'access_token': access_token
        }
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    user_id = get_jwt_identity()
    log_user_action(app, user_id, 'user_logout')
    
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({
            'success': False,
            'error': 'Email required'
        }), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        # Don't reveal if user exists (security)
        return jsonify({
            'success': True,
            'message': 'If an account with this email exists, a reset link has been sent'
        }), 200
    
    # Generate reset token
    reset_token = generate_secure_token()
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.session.commit()
    
    # Send reset link via email
    try:
        NotificationService.send_password_reset_email(user.email, reset_token)
    except Exception as e:
        app.logger.error(f"Failed to send password reset email: {e}")
    
    return jsonify({
        'success': True,
        'message': 'If an account with this email exists, a reset link has been sent'
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    data = request.get_json()
    
    if not data.get('token') or not data.get('new_password'):
        return jsonify({
            'success': False,
            'error': 'Token and new password required'
        }), 400
    
    user = User.query.filter_by(reset_token=data['token']).first()
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'Invalid or expired reset token'
        }), 400
    
    if user.reset_token_expires < datetime.utcnow():
        return jsonify({
            'success': False,
            'error': 'Reset token expired'
        }), 400
    
    if not validate_password(data['new_password']):
        return jsonify({
            'success': False,
            'error': 'Password must be at least 8 characters with letters and numbers'
        }), 400
    
    user.password_hash = hash_password(data['new_password'])
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    log_user_action(app, user.id, 'password_reset')
    
    return jsonify({
        'success': True,
        'message': 'Password reset successfully'
    }), 200