from flask_jwt_extended import get_jwt_identity, jwt_required
from functools import wraps
from flask import jsonify
from app.models.user import User

def get_current_user():
    """Get the current authenticated user"""
    user_id = get_jwt_identity()
    return User.query.get(user_id)

def get_current_provider():
    """Get the current authenticated provider"""
    user = get_current_user()
    if not user:
        return None
    return user.provider

def roles_required(*roles):
    """Decorator to check if user has required roles"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user or user.role not in roles:
                return jsonify({
                    'success': False,
                    'error': 'Unauthorized'
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def provider_required(f):
    """Decorator to check if user is a provider"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user or user.role != 'provider':
            return jsonify({
                'success': False,
                'error': 'Provider access required'
            }), 403
        return f(*args, **kwargs)
    return decorated_function

def customer_required(f):
    """Decorator to check if user is a customer"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user or user.role != 'customer':
            return jsonify({
                'success': False,
                'error': 'Customer access required'
            }), 403
        return f(*args, **kwargs)
    return decorated_function