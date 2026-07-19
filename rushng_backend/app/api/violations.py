from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.core.database import db
from app.core.dependencies import get_current_user, get_current_user
from app.models.violation import Violation, ViolationType, ViolationSeverity, ViolationStatus
from app.models.user import User
from app.models.job import Job
from app.services.notification_service import NotificationService
from app.core.logging import log_user_action, log_business_event

violations_bp = Blueprint('violations', __name__)


@violations_bp.route('/', methods=['POST'])
@jwt_required()
def report_violation():
    """Report a violation"""
    user = get_current_user()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['user_id', 'type', 'title', 'description']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'error': f'Missing required field: {field}'
            }), 400
    
    # Validate user exists
    target_user = User.query.get(data['user_id'])
    
    if not target_user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Can't report yourself
    if str(target_user.id) == str(user.id):
        return jsonify({
            'success': False,
            'error': 'You cannot report yourself'
        }), 400
    
    # Validate violation type
    try:
        violation_type = ViolationType(data['type'])
    except ValueError:
        return jsonify({
            'success': False,
            'error': f'Invalid violation type. Valid: {[t.value for t in ViolationType]}'
        }), 400
    
    # Determine severity based on type
    severity_map = {
        ViolationType.NO_SHOW: ViolationSeverity.MAJOR,
        ViolationType.POOR_QUALITY: ViolationSeverity.MINOR,
        ViolationType.THEFT: ViolationSeverity.CRITICAL,
        ViolationType.DAMAGE: ViolationSeverity.MAJOR,
        ViolationType.HARASSMENT: ViolationSeverity.CRITICAL,
        ViolationType.FRAUD: ViolationSeverity.CRITICAL,
        ViolationType.LATE_ARRIVAL: ViolationSeverity.MINOR,
        ViolationType.INCOMPLETE_WORK: ViolationSeverity.MAJOR,
        ViolationType.BAD_COMMUNICATION: ViolationSeverity.MINOR,
        ViolationType.CANCELLATION: ViolationSeverity.MINOR,
        ViolationType.OTHER: ViolationSeverity.MINOR
    }
    
    severity = severity_map.get(violation_type, ViolationSeverity.MINOR)
    
    # Create violation
    violation = Violation(
        user_id=target_user.id,
        job_id=data.get('job_id'),
        reported_by=user.id,
        type=violation_type,
        severity=severity,
        title=data['title'],
        description=data['description'],
        evidence=data.get('evidence', []),
        status=ViolationStatus.PENDING_REVIEW,
        points_deducted=0
    )
    
    db.session.add(violation)
    db.session.commit()
    
    log_user_action(current_app, user.id, 'violation_reported', {
        'target_user_id': str(target_user.id),
        'violation_id': str(violation.id),
        'type': violation.type.value
    })
    
    # Notify admin
    try:
        # Send notification to admins
        NotificationService.send_violation_reported_admin(
            violation.title,
            violation.description,
            target_user.email
        )
    except Exception as e:
        current_app.logger.error(f"Failed to send admin notification: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Violation reported successfully. Admin will review.',
        'data': {
            'violation_id': str(violation.id),
            'status': violation.status.value,
            'severity': violation.severity.value
        }
    }), 201


@violations_bp.route('/', methods=['GET'])
@jwt_required()
def get_violations():
    """Get violations (with filters)"""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    type_filter = request.args.get('type')
    
    # Only admins can see all violations
    if user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    query = Violation.query
    
    if status:
        query = query.filter_by(status=status)
    
    if type_filter:
        query = query.filter_by(type=type_filter)
    
    paginated = query.order_by(Violation.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    violations = []
    for violation in paginated.items:
        reported_user = User.query.get(violation.user_id)
        reporter = User.query.get(violation.reported_by)
        
        violations.append({
            **violation.to_dict(),
            'reported_user': reported_user.full_name if reported_user else None,
            'reported_user_email': reported_user.email if reported_user else None,
            'reporter_name': reporter.full_name if reporter else None
        })
    
    return jsonify({
        'success': True,
        'data': {
            'violations': violations,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@violations_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_violations():
    """Get violations for current user"""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get violations where user is the subject
    query = Violation.query.filter_by(user_id=user.id)
    
    paginated = query.order_by(Violation.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'violations': [v.to_dict() for v in paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@violations_bp.route('/<violation_id>', methods=['GET'])
def get_violation(violation_id):
    """Get violation by ID"""
    violation = Violation.query.get(violation_id)
    
    if not violation:
        return jsonify({
            'success': False,
            'error': 'Violation not found'
        }), 404
    
    reported_user = User.query.get(violation.user_id)
    reporter = User.query.get(violation.reported_by)
    
    return jsonify({
        'success': True,
        'data': {
            **violation.to_dict(),
            'reported_user': reported_user.full_name if reported_user else None,
            'reporter_name': reporter.full_name if reporter else None,
            'all_evidence': violation.evidence
        }
    }), 200


@violations_bp.route('/<violation_id>/review', methods=['PUT'])
@jwt_required()
def review_violation(violation_id):
    """Admin review a violation"""
    user = get_current_user()
    data = request.get_json()
    
    # Check admin access
    if user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    violation = Violation.query.get(violation_id)
    
    if not violation:
        return jsonify({
            'success': False,
            'error': 'Violation not found'
        }), 404
    
    action = data.get('action')  # confirm, dismiss
    points = data.get('points', violation.get_points())
    
    if action == 'confirm':
        violation.confirm(user.id, points)
        
        # Apply penalty to user's compliance score
        target_user = User.query.get(violation.user_id)
        if target_user and target_user.provider:
            target_user.provider.update_compliance_score()
            db.session.commit()
        
        log_business_event(current_app, 'violation_confirmed', {
            'violation_id': str(violation.id),
            'user_id': str(violation.user_id),
            'points_deducted': points
        })
        
        # Notify user
        try:
            NotificationService.send_violation_confirmed_sms(
                target_user.phone,
                violation.title,
                points,
                violation.penalty_type.value if violation.penalty_type else None
            )
        except Exception as e:
            current_app.logger.error(f"Failed to send notification: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Violation confirmed and penalty applied',
            'data': violation.to_dict()
        }), 200
        
    elif action == 'dismiss':
        reason = data.get('reason', 'Insufficient evidence')
        violation.dismiss(user.id, reason)
        db.session.commit()
        
        log_business_event(current_app, 'violation_dismissed', {
            'violation_id': str(violation.id),
            'user_id': str(violation.user_id)
        })
        
        return jsonify({
            'success': True,
            'message': 'Violation dismissed',
            'data': violation.to_dict()
        }), 200
    
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid action. Must be "confirm" or "dismiss"'
        }), 400


@violations_bp.route('/<violation_id>/appeal', methods=['POST'])
@jwt_required()
def appeal_violation(violation_id):
    """Appeal a violation"""
    user = get_current_user()
    data = request.get_json()
    
    violation = Violation.query.get(violation_id)
    
    if not violation:
        return jsonify({
            'success': False,
            'error': 'Violation not found'
        }), 404
    
    # Check ownership
    if str(violation.user_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'You can only appeal your own violations'
        }), 403
    
    # Check if can appeal
    if violation.status != ViolationStatus.CONFIRMED:
        return jsonify({
            'success': False,
            'error': 'Only confirmed violations can be appealed'
        }), 400
    
    reason = data.get('reason')
    
    if not reason:
        return jsonify({
            'success': False,
            'error': 'Appeal reason required'
        }), 400
    
    violation.appeal(reason)
    db.session.commit()
    
    log_user_action(current_app, user.id, 'violation_appealed', {
        'violation_id': str(violation.id),
        'reason': reason
    })
    
    return jsonify({
        'success': True,
        'message': 'Appeal submitted successfully. Admin will review.',
        'data': violation.to_dict()
    }), 200


@violations_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_violation_stats():
    """Get violation statistics (admin only)"""
    user = get_current_user()
    
    if user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Admin access required'
        }), 403
    
    # Overall stats
    total = Violation.query.count()
    pending = Violation.query.filter_by(status=ViolationStatus.PENDING_REVIEW).count()
    confirmed = Violation.query.filter_by(status=ViolationStatus.CONFIRMED).count()
    dismissed = Violation.query.filter_by(status=ViolationStatus.DISMISSED).count()
    
    # By severity
    minor = Violation.query.filter_by(severity=ViolationSeverity.MINOR).count()
    major = Violation.query.filter_by(severity=ViolationSeverity.MAJOR).count()
    critical = Violation.query.filter_by(severity=ViolationSeverity.CRITICAL).count()
    
    # By type
    type_stats = {}
    for vtype in ViolationType:
        count = Violation.query.filter_by(type=vtype).count()
        if count > 0:
            type_stats[vtype.value] = count
    
    return jsonify({
        'success': True,
        'data': {
            'total': total,
            'pending': pending,
            'confirmed': confirmed,
            'dismissed': dismissed,
            'by_severity': {
                'minor': minor,
                'major': major,
                'critical': critical
            },
            'by_type': type_stats,
            'confirmation_rate': f'{(confirmed / (confirmed + dismissed) * 100) if (confirmed + dismissed) > 0 else 0:.1f}%'
        }
    }), 200