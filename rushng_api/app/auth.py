from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt, set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies
)
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from app.database import db
from app.models import User, RefreshToken
from app.utils import validate_email, validate_phone, validate_password, generate_slug
import uuid
import re

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data.get('email') or not data.get('password') or not data.get('name') or not data.get('phone'):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    if not validate_email(data['email']):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    if not validate_phone(data['phone']):
        return jsonify({'success': False, 'message': 'Invalid phone number format'}), 400
    
    if not validate_password(data['password']):
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters with letters and numbers'}), 400
    
    # Check if user exists
    existing = User.query.filter(
        (User.email == data['email']) | (User.phone == data['phone'])
    ).first()
    
    if existing:
        return jsonify({'success': False, 'message': 'User with this email or phone already exists'}), 409
    
    # Create user
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        id=uuid.uuid4(),
        email=data['email'],
        name=data['name'],
        phone=data['phone'],
        password=hashed_password,
        role=data.get('role', 'buyer')
    )
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    # Store refresh token
    refresh = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(refresh)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'data': {
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    # Store refresh token
    refresh = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(refresh)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'success': False, 'message': 'Refresh token required'}), 400
    
    # Check if token exists and is not revoked
    db_token = RefreshToken.query.filter_by(token=refresh_token, revoked=False).first()
    
    if not db_token:
        return jsonify({'success': False, 'message': 'Invalid or revoked refresh token'}), 401
    
    if db_token.expires_at < datetime.utcnow():
        return jsonify({'success': False, 'message': 'Refresh token expired'}), 401
    
    # Get user
    user = User.query.get(db_token.user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 401
    
    # Generate new tokens
    new_access_token = create_access_token(identity=str(user.id))
    new_refresh_token = create_refresh_token(identity=str(user.id))
    
    # Revoke old refresh token
    db_token.revoked = True
    
    # Store new refresh token
    refresh = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=new_refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(refresh)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Token refreshed successfully',
        'data': {
            'access_token': new_access_token,
            'refresh_token': new_refresh_token
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    
    # Revoke all refresh tokens for user
    RefreshToken.query.filter_by(user_id=user_id, revoked=False).update({'revoked': True})
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'User retrieved successfully',
        'data': {
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'role': user.role,
                'avatar': user.avatar,
                'is_verified': user.is_verified
            }
        }
    }), 200