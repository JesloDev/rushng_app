from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.core.database import db
from app.core.dependencies import get_current_user
from app.models.notification import Notification
from app.services.notification_service import NotificationService
from app.core.logging import log_user_action

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get current user's notifications"""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    query = Notification.query.filter_by(user_id=user.id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    paginated = query.order_by(Notification.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'notifications': [n.to_dict() for n in paginated.items],
            'unread_count': Notification.query.filter_by(user_id=user.id, is_read=False).count(),
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    """Mark notification as read"""
    user = get_current_user()
    
    notification = Notification.query.get(notification_id)
    
    if not notification:
        return jsonify({
            'success': False,
            'error': 'Notification not found'
        }), 404
    
    # Check ownership
    if str(notification.user_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 403
    
    notification.mark_as_read()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Notification marked as read'
    }), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read"""
    user = get_current_user()
    
    notifications = Notification.query.filter_by(user_id=user.id, is_read=False).all()
    
    for notification in notifications:
        notification.mark_as_read()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Marked {len(notifications)} notifications as read'
    }), 200


@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    user = get_current_user()
    
    notification = Notification.query.get(notification_id)
    
    if not notification:
        return jsonify({
            'success': False,
            'error': 'Notification not found'
        }), 404
    
    # Check ownership
    if str(notification.user_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 403
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Notification deleted'
    }), 200


@notifications_bp.route('/test-sms', methods=['POST'])
@jwt_required()
def test_sms():
    """Test SMS notification (for development)"""
    user = get_current_user()
    data = request.get_json()
    
    phone = data.get('phone', user.phone)
    message = data.get('message', 'This is a test SMS from RUSHNG.')
    
    try:
        NotificationService.send_sms(phone, message)
        return jsonify({
            'success': True,
            'message': 'SMS sent successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500