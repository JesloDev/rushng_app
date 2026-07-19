from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.core.database import db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.job import Job, JobStatus
from app.models.violation import Violation
from app.services.notification_service import NotificationService
from app.utils.validators import validate_email, validate_phone
from app.core.logging import log_user_action

users_bp = Blueprint('users', __name__)


@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current user profile"""
    user = get_current_user()
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict(include_sensitive=True)
        }
    }), 200


@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    """Update current user profile"""
    user = get_current_user()
    data = request.get_json()
    
    # Update allowed fields
    allowed_fields = ['full_name', 'address', 'city', 'state', 'country']
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # Update email (if changed)
    if 'email' in data and data['email'] != user.email:
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            return jsonify({
                'success': False,
                'error': 'Email already in use'
            }), 409
        
        user.email = data['email']
    
    # Update phone (if changed)
    if 'phone' in data and data['phone'] != user.phone:
        if not validate_phone(data['phone']):
            return jsonify({
                'success': False,
                'error': 'Invalid phone number'
            }), 400
        
        existing = User.query.filter_by(phone=data['phone']).first()
        if existing and existing.id != user.id:
            return jsonify({
                'success': False,
                'error': 'Phone number already in use'
            }), 409
        
        user.phone = data['phone']
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    log_user_action(app, user.id, 'profile_updated')
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'data': {
            'user': user.to_dict(include_sensitive=True)
        }
    }), 200


@users_bp.route('/me', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account (with clean record check)"""
    user = get_current_user()
    data = request.get_json()
    
    # Check if account can be deleted
    can_delete, message = user.can_delete_account()
    
    if not can_delete:
        return jsonify({
            'success': False,
            'error': message
        }), 400
    
    # Request deletion confirmation
    if not data.get('confirm'):
        return jsonify({
            'success': True,
            'message': 'Please confirm account deletion',
            'data': {
                'requires_confirmation': True,
                'cooldown_days': 7,
                'effects': [
                    'All personal data will be anonymized',
                    'Your account will be deactivated',
                    'You will not be able to log in',
                    'You cannot re-register with same email/phone for 30 days'
                ]
            }
        }), 200
    
    # Process deletion
    reason = data.get('reason', 'User requested deletion')
    
    # Anonymize user data
    user.full_name = 'Deleted User'
    user.email = f'deleted_{user.id}@rushng.com'
    user.phone = f'deleted_{user.id[:8]}'
    user.nin = None
    user.bvn = None
    user.address = None
    user.profile_picture = None
    user.is_active = False
    user.deleted_at = datetime.utcnow()
    user.deletion_reason = reason
    
    db.session.commit()
    
    log_user_action(app, user.id, 'account_deleted', {'reason': reason})
    
    # Send confirmation
    try:
        NotificationService.send_account_deletion_email(user.email, user.id)
    except Exception as e:
        app.logger.error(f"Failed to send deletion email: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Account deleted successfully'
    }), 200


@users_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID (public profile)"""
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Return limited info for public profile
    return jsonify({
        'success': True,
        'data': {
            'user': {
                'id': str(user.id),
                'full_name': user.full_name,
                'profile_picture': user.profile_picture,
                'role': user.role.value if user.role else None,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
        }
    }), 200


@users_bp.route('/<user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics"""
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Count jobs
    jobs_as_customer = Job.query.filter_by(customer_id=user.id).count()
    jobs_as_provider = Job.query.filter_by(provider_id=user.id).count()
    
    # Count completed jobs
    completed_as_customer = Job.query.filter_by(
        customer_id=user.id,
        status=JobStatus.COMPLETED
    ).count()
    
    completed_as_provider = Job.query.filter_by(
        provider_id=user.id,
        status=JobStatus.COMPLETED
    ).count()
    
    return jsonify({
        'success': True,
        'data': {
            'jobs_posted': jobs_as_customer,
            'jobs_completed_as_customer': completed_as_customer,
            'jobs_completed_as_provider': completed_as_provider,
            'total_jobs': jobs_as_customer + jobs_as_provider,
            'member_since': user.created_at.isoformat() if user.created_at else None
        }
    }), 200