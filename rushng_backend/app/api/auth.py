import re
import json
import requests
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)

import brevo_python
from brevo_python.rest import ApiException

from app.core.database import db
from app.core.security import (
    hash_password, verify_password, generate_otp, hash_otp, verify_otp,
    generate_secure_token
)
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.utils.validators import (
    validate_email, validate_phone, validate_password
)
from app.core.logging import log_user_action

auth_bp = Blueprint('auth', __name__)


def get_utc_now():
    """Returns timezone-naive UTC datetime for consistent DB storage."""
    return datetime.utcnow()


def format_phone_e164(phone: str, default_country_code: str = "234") -> str:
    """
    Ensures a phone number is formatted strictly to E.164 standard required by Brevo.
    """
    if not phone:
        return ""
        
    cleaned = re.sub(r'[\s\-\(\)]', '', str(phone).strip())

    if cleaned.startswith('+'):
        return cleaned

    if cleaned.startswith('0'):
        return f"+{default_country_code}{cleaned[1:]}"

    if cleaned.startswith(default_country_code):
        return f"+{cleaned}"

    return f"+{default_country_code}{cleaned}"


class NotificationService:
    """Handle notifications via Brevo (SMS + Email)"""
    
    @staticmethod
    def send_sms(phone, message):
        """Send SMS via Brevo"""
        try:
            formatted_phone = format_phone_e164(phone)
            url = "https://api.brevo.com/v3/transactionalSMS/sms"
            
            payload = {
                "sender": current_app.config.get('BREVO_SMS_SENDER', 'RUSHNG'),
                "recipient": formatted_phone,
                "content": message,
                "type": "transactional",
                "tag": "notification"
            }
            
            headers = {
                'api-key': current_app.config['BREVO_API_KEY'],
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in (200, 201):
                current_app.logger.info(f"SMS sent to {formatted_phone}: {message[:50]}...")
                return {'success': True}
            else:
                current_app.logger.error(f"Brevo SMS error: {response.text}")
                return {'success': False, 'error': response.text}
                
        except Exception as e:
            current_app.logger.error(f"SMS sending failed: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_email(to_email, subject, html_content, template_id=None):
        """Send email via Brevo"""
        try:
            brevo_api = brevo_python.TransactionalEmailsApi(
                brevo_python.ApiClient(
                    brevo_python.Configuration()
                )
            )
            
            brevo_api.api_client.configuration.api_key['api-key'] = \
                current_app.config['BREVO_API_KEY']
            
            if template_id:
                send_smtp_email = brevo_python.SendSmtpEmail(
                    to=[{"email": to_email}],
                    template_id=template_id,
                    params={
                        "subject": subject,
                        "content": html_content
                    }
                )
            else:
                send_smtp_email = brevo_python.SendSmtpEmail(
                    to=[{"email": to_email}],
                    sender={"name": "RUSHNG", "email": current_app.config.get('BREVO_EMAIL_FROM', 'noreply@rushng.com')},
                    subject=subject,
                    html_content=html_content
                )
            
            response = brevo_api.send_transac_email(send_smtp_email)
            
            current_app.logger.info(f"Email sent to {to_email}: {subject}")
            return {'success': True, 'message_id': response.message_id}
            
        except Exception as e:
            current_app.logger.error(f"Email sending failed: {e}")
            return {'success': False, 'error': str(e)}

    # ==================== TEMPLATED NOTIFICATIONS ====================
    
    @staticmethod
    def send_verification_email(email, code):
        """Send verification code via Email"""
        subject = "Verify Your RUSHNG Account"
        html_content = f"""
        <h2>Welcome to RUSHNG!</h2>
        <p>Your verification code is: <strong style="font-size: 1.2em; color: #2b6cb0;">{code}</strong></p>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        """
        return NotificationService.send_email(email, subject, html_content)
    
    @staticmethod
    def send_job_notification(phone, job_title, price):
        """Send job notification to provider"""
        message = f"🔔 New job available on RUSHNG: {job_title}. Estimated: ₦{price:,.2f}. Accept now!"
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_provider_assigned_sms(phone, provider_name, job_title):
        """Send provider assignment notification to customer"""
        message = f"✅ A provider has been assigned to your job '{job_title}'. {provider_name} will be there soon."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_job_started_sms(phone, job_title, provider_name):
        """Send job started notification"""
        message = f"🔧 {provider_name} has started working on '{job_title}'. You will be notified when complete."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_job_completed_sms(phone, job_title, provider_name):
        """Send job completed notification"""
        message = f"✅ '{job_title}' has been completed by {provider_name}. Please confirm completion to release payment."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_payment_received_sms(phone, amount, job_title):
        """Send payment received notification to provider"""
        message = f"💰 Payment received! ₦{amount:,.2f} has been credited for '{job_title}'."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_rating_received_sms(phone, rater_name, rating, job_title):
        """Send rating received notification"""
        message = f"⭐ {rater_name} rated you {rating}/5 stars for '{job_title}'."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_violation_confirmed_sms(phone, violation_title, points, penalty_type):
        """Send violation confirmation notification"""
        message = f"⚠️ Violation confirmed: {violation_title}. {points} points deducted. Penalty: {penalty_type}"
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_violation_reported_admin(title, description, user_email):
        """Send violation report to admin via email"""
        subject = f"🚨 New Violation Reported: {title}"
        html_content = f"""
        <h2>New Violation Reported</h2>
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>User:</strong> {user_email}</p>
        <p><a href="https://rushng.com/admin/violations">Review Violation</a></p>
        """
        return NotificationService.send_email('admin@rushng.com', subject, html_content)
    
    @staticmethod
    def send_account_deletion_email(email, user_id):
        """Send account deletion confirmation email"""
        subject = "RUSHNG Account Deletion Confirmation"
        html_content = f"""
        <h2>Account Deleted</h2>
        <p>Your RUSHNG account has been successfully deleted.</p>
        <p>If this was not you, please contact support immediately.</p>
        <p>Reference: {user_id}</p>
        """
        return NotificationService.send_email(email, subject, html_content)
    
    @staticmethod
    def send_password_reset_email(email, token):
        """Send password reset email"""
        subject = "Reset Your RUSHNG Password"
        reset_link = f"https://rushng.com/reset-password?token={token}"
        html_content = f"""
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't request this, ignore this email.</p>
        """
        return NotificationService.send_email(email, subject, html_content)


# ==================== ROUTE HANDLERS ====================

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
    
    # Map role cleanly to UserRole Enum
    requested_role = str(data.get('role', 'customer')).upper()
    try:
        user_role = UserRole[requested_role]
    except KeyError:
        user_role = UserRole.CUSTOMER

    user = User(
        email=email,
        phone=phone,
        password_hash=hash_password(password),
        full_name=full_name,
        role=user_role,
        is_verified=False
    )
    
    # Verification token setup
    verification_code = generate_otp()
    user.verification_code = hash_otp(verification_code)
    user.verification_sent_at = get_utc_now()

    try:
        db.session.add(user)
        db.session.flush()

        if user_role == UserRole.PROVIDER:
            user.is_verified_provider = False
            user.verification_status = 'pending'
            
            provider = Provider(
                user_id=user.id,
                skills=data.get('skills', []),
                years_experience=data.get('years_experience', 0),
                hourly_rate=data.get('hourly_rate'),
                service_radius_km=data.get('service_radius_km', 10)
            )
            db.session.add(provider)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration DB transaction failed: {e}")
        return jsonify({'success': False, 'error': 'Registration failed. Please try again.'}), 500

    # Verification notification handling (Email)
    email_sent = True
    try:
        NotificationService.send_verification_email(user.email, verification_code)
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email to {user.id}: {e}")
        email_sent = False
    
    log_user_action(current_app, user.id, 'user_registered', {
        'email': user.email,
        'role': user.role.value if hasattr(user.role, 'value') else str(user.role)
    })
    
    return jsonify({
        'success': True,
        'message': 'Registration successful. Please check your email for your verification code.',
        'data': {
            'user': user.to_dict(include_sensitive=True),
            'verification_sent': email_sent
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
        return jsonify({'success': False, 'error': 'Invalid verification details'}), 400
    
    if user.is_verified:
        return jsonify({'success': False, 'error': 'Account already verified'}), 400
    
    # Code expiration check (10 minutes window)
    if user.verification_sent_at:
        sent_at = user.verification_sent_at
        if sent_at.tzinfo is not None:
            sent_at = sent_at.astimezone(timezone.utc).replace(tzinfo=None)
            
        if (get_utc_now() - sent_at) > timedelta(minutes=10):
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
    """Resend verification code via Email"""
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
    user.verification_sent_at = get_utc_now()
    db.session.commit()
    
    try:
        NotificationService.send_verification_email(user.email, verification_code)
    except Exception as e:
        current_app.logger.error(f"Failed to resend verification email to {user.id}: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to send verification email. Please try again shortly.'
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'Verification code sent to your email successfully'
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
            'error': 'Account not verified. Please check your email for the verification code.'
        }), 403
    
    user.last_login = get_utc_now()
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
    user.reset_token_expires = get_utc_now() + timedelta(hours=24)
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
    if expires_at.tzinfo is not None:
        expires_at = expires_at.astimezone(timezone.utc).replace(tzinfo=None)
        
    if expires_at < get_utc_now():
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


@auth_bp.route('/me', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True) # Allows OPTIONS preflights without requiring JWT header during preflight
def get_current_user():
    if request.method == 'OPTIONS':
        return '', 200

    # Ensure JWT identity is present for actual GET requests
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    return jsonify({
        'success': True,
        'data': user.to_dict()
    }), 200