from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.core.database import db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.job import Job, JobStatus
from app.models.payment import Payment, PaymentStatus
from app.models.violation import Violation
from app.core.logging import log_user_action

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Get platform-wide statistics (admin only)"""
    user = get_current_user()
    
    if user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    # User stats
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    providers = Provider.query.count()
    
    # Job stats
    total_jobs = Job.query.count()
    jobs_posted = Job.query.filter_by(status=JobStatus.POSTED).count()
    jobs_in_progress = Job.query.filter_by(status=JobStatus.IN_PROGRESS).count()
    jobs_completed = Job.query.filter_by(status=JobStatus.COMPLETED).count()
    jobs_cancelled = Job.query.filter_by(status=JobStatus.CANCELLED).count()
    
    # Job trends (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    jobs_last_7_days = Job.query.filter(Job.created_at >= seven_days_ago).count()
    
    # Payment stats
    total_payments = Payment.query.filter_by(status=PaymentStatus.RELEASED).count()
    total_revenue = db.session.query(db.func.sum(Payment.platform_fee)).filter(
        Payment.status == PaymentStatus.RELEASED
    ).scalar() or 0
    
    pending_payments = Payment.query.filter_by(status=PaymentStatus.HELD).count()
    
    # Violation stats
    total_violations = Violation.query.count()
    pending_violations = Violation.query.filter_by(status='pending_review').count()
    
    # New users today
    today = datetime.utcnow().date()
    today_start = datetime(today.year, today.month, today.day, 0, 0, 0)
    new_users_today = User.query.filter(User.created_at >= today_start).count()
    
    return jsonify({
        'success': True,
        'data': {
            'users': {
                'total': total_users,
                'active': active_users,
                'providers': providers,
                'new_today': new_users_today
            },
            'jobs': {
                'total': total_jobs,
                'posted': jobs_posted,
                'in_progress': jobs_in_progress,
                'completed': jobs_completed,
                'cancelled': jobs_cancelled,
                'last_7_days': jobs_last_7_days
            },
            'payments': {
                'total': total_payments,
                'total_revenue': total_revenue,
                'pending': pending_payments
            },
            'violations': {
                'total': total_violations,
                'pending': pending_violations
            }
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users_admin():
    """Get all users with filters (admin only)"""
    user = get_current_user()
    
    if user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    role = request.args.get('role')
    search = request.args.get('search')
    is_active = request.args.get('is_active')
    
    query = User.query
    
    if role:
        query = query.filter_by(role=role)
    
    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%')) |
            (User.phone.ilike(f'%{search}%'))
        )
    
    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')
    
    paginated = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    users = []
    for u in paginated.items:
        users.append(u.to_dict(include_sensitive=True))
    
    return jsonify({
        'success': True,
        'data': {
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@admin_bp.route('/users/<user_id>/ban', methods=['PUT'])
@jwt_required()
def ban_user(user_id):
    """Ban a user (admin only)"""
    admin_user = get_current_user()
    
    if admin_user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    user_to_ban = User.query.get(user_id)
    
    if not user_to_ban:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Can't ban admin
    if user_to_ban.role == 'admin':
        return jsonify({
            'success': False,
            'error': 'Cannot ban an admin user'
        }), 400
    
    data = request.get_json()
    reason = data.get('reason', 'Banned by admin')
    
    user_to_ban.is_active = False
    db.session.commit()
    
    log_user_action(current_app, admin_user.id, 'user_banned', {
        'target_user_id': str(user_to_ban.id),
        'reason': reason
    })
    
    return jsonify({
        'success': True,
        'message': f'User {user_to_ban.full_name} has been banned',
        'data': {
            'user_id': str(user_to_ban.id),
            'full_name': user_to_ban.full_name,
            'is_active': user_to_ban.is_active
        }
    }), 200


@admin_bp.route('/users/<user_id>/unban', methods=['PUT'])
@jwt_required()
def unban_user(user_id):
    """Unban a user (admin only)"""
    admin_user = get_current_user()
    
    if admin_user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    user_to_unban = User.query.get(user_id)
    
    if not user_to_unban:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    user_to_unban.is_active = True
    db.session.commit()
    
    log_user_action(current_app, admin_user.id, 'user_unbanned', {
        'target_user_id': str(user_to_unban.id)
    })
    
    return jsonify({
        'success': True,
        'message': f'User {user_to_unban.full_name} has been unbanned',
        'data': {
            'user_id': str(user_to_unban.id),
            'full_name': user_to_unban.full_name,
            'is_active': user_to_unban.is_active
        }
    }), 200


@admin_bp.route('/users/<user_id>/verify-provider', methods=['PUT'])
@jwt_required()
def verify_provider(user_id):
    """Verify a provider (admin only)"""
    admin_user = get_current_user()
    
    if admin_user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    if not user.is_provider():
        return jsonify({
            'success': False,
            'error': 'User is not a provider'
        }), 400
    
    data = request.get_json()
    verify = data.get('verify', True)
    
    if verify:
        user.is_verified = True
        user.is_verified_provider = True
        user.verification_status = 'verified'
        
        if user.provider:
            user.provider.verification_level = 'verified'
    else:
        user.is_verified_provider = False
        user.verification_status = 'rejected'
        
        if user.provider:
            user.provider.verification_level = 'basic'
    
    db.session.commit()
    
    log_user_action(current_app, admin_user.id, 'provider_verified', {
        'target_user_id': str(user.id),
        'verified': verify
    })
    
    return jsonify({
        'success': True,
        'message': f'Provider {user.full_name} has been {"verified" if verify else "unverified"}',
        'data': {
            'user_id': str(user.id),
            'full_name': user.full_name,
            'is_verified_provider': user.is_verified_provider,
            'verification_status': user.verification_status
        }
    }), 200


@admin_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs_admin():
    """Get all jobs with filters (admin only)"""
    user = get_current_user()
    
    if user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    status = request.args.get('status')
    category = request.args.get('category')
    
    query = Job.query
    
    if status:
        query = query.filter_by(status=status)
    
    if category:
        query = query.filter_by(category=category)
    
    paginated = query.order_by(Job.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    jobs = []
    for job in paginated.items:
        customer = User.query.get(job.customer_id)
        provider = User.query.get(job.provider_id) if job.provider_id else None
        
        jobs.append({
            'id': str(job.id),
            'title': job.title,
            'customer': customer.full_name if customer else None,
            'provider': provider.full_name if provider else None,
            'category': job.category.value if job.category else None,
            'status': job.status.value if job.status else None,
            'estimated_price': job.estimated_price,
            'created_at': job.created_at.isoformat() if job.created_at else None
        })
    
    return jsonify({
        'success': True,
        'data': {
            'jobs': jobs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200