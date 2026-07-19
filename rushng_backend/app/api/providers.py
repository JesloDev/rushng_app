from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from geoalchemy2.functions import ST_Distance, ST_SetSRID, ST_Point

from app.core.database import db
from app.core.dependencies import get_current_user, provider_required
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.job import Job, JobStatus
from app.services.verification_service import VerificationService
from app.utils.validators import validate_nin, validate_bvn
from app.utils.geo import calculate_distance
from app.core.logging import log_user_action

providers_bp = Blueprint('providers', __name__)


@providers_bp.route('/register', methods=['POST'])
@jwt_required()
def register_as_provider():
    """Register as a service provider"""
    user = get_current_user()
    data = request.get_json()
    
    # Check if already a provider
    if user.is_provider():
        return jsonify({
            'success': False,
            'error': 'You are already registered as a provider'
        }), 400
    
    # Validate NIN
    if 'nin' in data and not validate_nin(data['nin']):
        return jsonify({
            'success': False,
            'error': 'Invalid NIN format'
        }), 400
    
    # Validate BVN
    if 'bvn' in data and not validate_bvn(data['bvn']):
        return jsonify({
            'success': False,
            'error': 'Invalid BVN format'
        }), 400
    
    # Update user role
    user.role = UserRole.PROVIDER
    
    # Create provider profile
    provider = Provider(
        user=user,
        skills=data.get('skills', []),
        years_experience=data.get('years_experience', 0),
        hourly_rate=data.get('hourly_rate'),
        service_radius_km=data.get('service_radius_km', 10),
        verification_level='basic',
        is_available=True
    )
    
    db.session.add(provider)
    db.session.commit()
    
    log_user_action(app, user.id, 'provider_registered')
    
    return jsonify({
        'success': True,
        'message': 'Provider registration successful. Complete verification to start accepting jobs.',
        'data': {
            'provider': provider.to_dict(),
            'verification_required': True,
            'next_steps': [
                'Verify your identity (NIN/BVN)',
                'Upload portfolio photos',
                'Set your availability schedule'
            ]
        }
    }), 201


@providers_bp.route('/me', methods=['GET'])
@jwt_required()
@provider_required
def get_my_provider_profile():
    """Get current provider profile"""
    user = get_current_user()
    provider = user.provider
    
    if not provider:
        return jsonify({
            'success': False,
            'error': 'Provider profile not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'provider': provider.to_dict(),
            'user': user.to_dict(),
            'pending_verification': user.verification_status == 'pending',
            'is_available': provider.is_available
        }
    }), 200


@providers_bp.route('/me', methods=['PUT'])
@jwt_required()
@provider_required
def update_provider_profile():
    """Update provider profile"""
    user = get_current_user()
    provider = user.provider
    data = request.get_json()
    
    # Update provider fields
    allowed_fields = [
        'skills', 'years_experience', 'hourly_rate',
        'service_radius_km', 'is_available', 'portfolio_urls'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(provider, field, data[field])
    
    provider.updated_at = datetime.utcnow()
    db.session.commit()
    
    log_user_action(app, user.id, 'provider_profile_updated')
    
    return jsonify({
        'success': True,
        'message': 'Provider profile updated successfully',
        'data': {
            'provider': provider.to_dict()
        }
    }), 200


@providers_bp.route('/verify', methods=['POST'])
@jwt_required()
@provider_required
def submit_verification():
    """Submit verification documents"""
    user = get_current_user()
    data = request.get_json()
    
    # Validate NIN
    if data.get('nin'):
        if not validate_nin(data['nin']):
            return jsonify({
                'success': False,
                'error': 'Invalid NIN format'
            }), 400
        user.nin = data['nin']
    
    # Validate BVN
    if data.get('bvn'):
        if not validate_bvn(data['bvn']):
            return jsonify({
                'success': False,
                'error': 'Invalid BVN format'
            }), 400
        user.bvn = data['bvn']
    
    # Upload verification documents
    if data.get('documents'):
        provider = user.provider
        provider.verification_documents = data['documents']
        provider.verification_level = 'pending'
    
    user.verification_status = 'pending'
    db.session.commit()
    
    log_user_action(app, user.id, 'verification_submitted')
    
    return jsonify({
        'success': True,
        'message': 'Verification documents submitted. Awaiting review.',
        'data': {
            'verification_status': user.verification_status,
            'estimated_review_time': '24-48 hours'
        }
    }), 200


@providers_bp.route('/search', methods=['GET'])
def search_providers():
    """Search for providers by skill, location, rating"""
    skill = request.args.get('skill')
    city = request.args.get('city')
    state = request.args.get('state')
    min_rating = request.args.get('min_rating', type=float)
    max_distance = request.args.get('max_distance', type=float, default=10)
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Build query
    query = Provider.query.join(User).filter(
        User.is_active == True,
        User.is_verified == True,
        Provider.is_available == True
    )
    
    # Filter by skill
    if skill:
        query = query.filter(Provider.skills.any(skill))
    
    # Filter by location
    if city:
        query = query.filter(User.city == city)
    if state:
        query = query.filter(User.state == state)
    
    # Filter by rating
    if min_rating:
        query = query.filter(Provider.rating >= min_rating)
    
    # Filter by distance
    if lat and lng:
        # Add distance calculation
        point = ST_SetSRID(ST_Point(lng, lat), 4326)
        query = query.filter(
            ST_Distance(Provider.location, point) <= (max_distance * 1000)
        )
    
    # Paginate
    paginated = query.order_by(Provider.rating.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    providers = []
    for provider in paginated.items:
        user = provider.user
        provider_data = provider.to_dict()
        provider_data['user'] = {
            'full_name': user.full_name,
            'profile_picture': user.profile_picture
        }
        providers.append(provider_data)
    
    return jsonify({
        'success': True,
        'data': {
            'providers': providers,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@providers_bp.route('/<provider_id>', methods=['GET'])
def get_provider(provider_id):
    """Get provider by ID"""
    provider = Provider.query.get(provider_id)
    
    if not provider:
        return jsonify({
            'success': False,
            'error': 'Provider not found'
        }), 404
    
    user = provider.user
    
    if not user or not user.is_active:
        return jsonify({
            'success': False,
            'error': 'Provider not available'
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'provider': {
                **provider.to_dict(),
                'user': {
                    'full_name': user.full_name,
                    'profile_picture': user.profile_picture,
                    'address': user.address,
                    'city': user.city,
                    'state': user.state,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                },
                'recent_jobs': provider.total_jobs_completed,
                'verification_level': provider.verification_level
            }
        }
    }), 200


@providers_bp.route('/me/availability', methods=['PUT'])
@jwt_required()
@provider_required
def update_availability():
    """Update provider availability"""
    user = get_current_user()
    provider = user.provider
    data = request.get_json()
    
    if 'is_available' in data:
        provider.is_available = data['is_available']
    
    if 'availability' in data:
        provider.availability = data['availability']
    
    provider.updated_at = datetime.utcnow()
    db.session.commit()
    
    log_user_action(app, user.id, 'availability_updated')
    
    return jsonify({
        'success': True,
        'message': 'Availability updated successfully',
        'data': {
            'is_available': provider.is_available,
            'availability': provider.availability
        }
    }), 200


@providers_bp.route('/me/stats', methods=['GET'])
@jwt_required()
@provider_required
def get_provider_stats():
    """Get provider statistics"""
    user = get_current_user()
    provider = user.provider
    
    if not provider:
        return jsonify({
            'success': False,
            'error': 'Provider profile not found'
        }), 404
    
    # Job stats
    total_jobs = Job.query.filter_by(provider_id=user.id).count()
    completed_jobs = Job.query.filter_by(
        provider_id=user.id,
        status=JobStatus.COMPLETED
    ).count()
    cancelled_jobs = Job.query.filter_by(
        provider_id=user.id,
        status=JobStatus.CANCELLED
    ).count()
    pending_jobs = Job.query.filter_by(
        provider_id=user.id,
        status=JobStatus.ASSIGNED
    ).count()
    
    # Earnings
    from app.models.payment import Payment, PaymentStatus
    total_earnings = db.session.query(db.func.sum(Payment.provider_earnings)).filter(
        Payment.provider_id == user.id,
        Payment.status == PaymentStatus.RELEASED
    ).scalar() or 0
    
    return jsonify({
        'success': True,
        'data': {
            'total_jobs': total_jobs,
            'completed_jobs': completed_jobs,
            'cancelled_jobs': cancelled_jobs,
            'pending_jobs': pending_jobs,
            'total_earnings': total_earnings,
            'rating': provider.rating,
            'compliance_score': provider.compliance_score,
            'completion_rate': (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
        }
    }), 200