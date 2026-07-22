from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)

from app.core.database import db
from app.core.security import (
    hash_password, verify_password, generate_otp, hash_otp, verify_otp,
    generate_secure_token
)
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.services.notification_service import NotificationService
from app.utils.validators import (
    validate_email, validate_phone, validate_password
)
from app.core.logging import log_user_action

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user or provider"""
    data = request.get_json() or {}
    
    # Validate required fields
    required_fields = ['email', 'phone', 'password', 'full_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'error': f'Missing required field: {field}'
            }), 400

    email = data['email'].strip().lower()
    phone = data['phone'].strip()
    password = data['password']
    full_name = data['full_name'].strip()

    if not validate_email(email):
        return jsonify({'success': False, 'error': 'Invalid email format'}), 400
        
    if not validate_phone(phone):
        return jsonify({
            'success': False,
            'error': 'Invalid phone number. Must be a valid Nigerian number.'
        }), 400
        
    if not validate_password(password):
        return jsonify({
            'success': False,
            'error': 'Password must be at least 8 characters with letters and numbers'
        }), 400
    
    # Check if user exists
    existing_user = User.query.filter(
        (User.email == email) | (User.phone == phone)
    ).first()
    
    if existing_user:
        return jsonify({
            'success': False,
            'error': 'User with this email or phone already exists'
        }), 409
    
    # Determine role safely
    requested_role = str(data.get('role', 'customer')).lower()
    user_role = UserRole.PROVIDER if requested_role == 'provider' else UserRole.CUSTOMER

    user = User(
        email=email,
        phone=phone,
        password_hash=hash_password(password),
        full_name=full_name,
        role=user_role,
        is_verified=False
    )
    
    if user_role == UserRole.PROVIDER:
        user.is_verified_provider = False
        user.verification_status = 'pending'
        
        provider = Provider(
            user=user,
            skills=data.get('skills', []),
            years_experience=data.get('years_experience', 0),
            hourly_rate=data.get('hourly_rate'),
            service_radius_km=data.get('service_radius_km', 10)
        )
        db.session.add(provider)
    
    # Verification token setup
    verification_code = generate_otp()
    user.verification_code = hash_otp(verification_code)
    user.verification_sent_at = datetime.now(timezone.utc)
    
    db.session.add(user)
    db.session.commit()
    
    # Notification handling
    sms_sent = True
    try:
        NotificationService.send_verification_sms(user.phone, verification_code)
    except Exception as e:
        current_app.logger.error(f"Failed to send verification SMS to {user.id}: {e}")
        sms_sent = False
    
    log_user_action(current_app, user.id, 'user_registered', {
        'email': user.email,
        'role': user.role.value if hasattr(user.role, 'value') else str(user.role)
    })
    
    return jsonify({
        'success': True,
        'message': 'Registration successful. Please verify your account.',
        'data': {
            'user': user.to_dict(include_sensitive=True),
            'verification_sent': sms_sent
        }
    }), 201


@auth_bp.route('/verify', methods=['POST'])
def verify_account():
    """Verify user account with OTP"""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    code = data.get('code', '').strip()
    
    if not email or not code:
        return jsonify({
            'success': False,
            'error': 'Email and verification code required'
        }), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    if user.is_verified:
        return jsonify({'success': False, 'error': 'Account already verified'}), 400
    
    # Code expiration (10 minutes window)
    if user.verification_sent_at:
        sent_at = user.verification_sent_at
        if sent_at.tzinfo is None:
            sent_at = sent_at.replace(tzinfo=timezone.utc)
        
        if (datetime.now(timezone.utc) - sent_at) > timedelta(minutes=10):
            return jsonify({
                'success': False,
                'error': 'Verification code expired. Request a new one.'
            }), 400
    
    if not user.verification_code or not verify_otp(code, user.verification_code):
        return jsonify({'success': False, 'error': 'Invalid verification code'}), 400
    
    user.is_verified = True
    user.verification_code = None
    user.verification_sent_at = None
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    log_user_action(current_app, user.id, 'user_verified')
    
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
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'success': False, 'error': 'Email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    if user.is_verified:
        return jsonify({'success': False, 'error': 'Account already verified'}), 400
    
    verification_code = generate_otp()
    user.verification_code = hash_otp(verification_code)
    user.verification_sent_at = datetime.now(timezone.utc)
    db.session.commit()
    
    try:
        NotificationService.send_verification_sms(user.phone, verification_code)
    except Exception as e:
        current_app.logger.error(f"Failed to resend verification SMS to {user.id}: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to send SMS code. Please try again shortly.'
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Verification code sent successfully'
    }), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and issue JWTs"""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'Email and password required'
        }), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not verify_password(password, user.password_hash):
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    
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
    
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    log_user_action(current_app, user.id, 'user_login')
    
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
    """Refresh access token using a valid refresh token"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({'success': False, 'error': 'User invalid or inactive'}), 401
    
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
    """Logout current user"""
    user_id = get_jwt_identity()
    log_user_action(current_app, user_id, 'user_logout')
    
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset link/token"""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'success': False, 'error': 'Email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    # Generic success message prevents user enumeration attacks
    generic_response = (
        jsonify({
            'success': True,
            'message': 'If an account with this email exists, a reset link has been sent'
        }), 200
    )
    
    if not user:
        return generic_response
    
    reset_token = generate_secure_token()
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    db.session.commit()
    
    try:
        NotificationService.send_password_reset_email(user.email, reset_token)
    except Exception as e:
        current_app.logger.error(f"Failed to send reset email to {user.id}: {e}")
    
    return generic_response


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset account password using reset token"""
    data = request.get_json() or {}
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '')
    
    if not token or not new_password:
        return jsonify({
            'success': False,
            'error': 'Token and new password required'
        }), 400
    
    user = User.query.filter_by(reset_token=token).first()
    
    if not user or not user.reset_token_expires:
        return jsonify({
            'success': False,
            'error': 'Invalid or expired reset token'
        }), 400
    
    expires_at = user.reset_token_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if expires_at < datetime.now(timezone.utc):
        return jsonify({'success': False, 'error': 'Reset token expired'}), 400
    
    if not validate_password(new_password):
        return jsonify({
            'success': False,
            'error': 'Password must be at least 8 characters with letters and numbers'
        }), 400
    
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    log_user_action(current_app, user.id, 'password_reset')
    
    return jsonify({
        'success': True,
        'message': 'Password reset successfully'
    }), 200