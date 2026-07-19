from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from geoalchemy2.functions import ST_Distance, ST_SetSRID, ST_Point
import json

from app.core.database import db
from app.core.dependencies import get_current_user, customer_required, provider_required
from app.core.security import generate_otp, hash_otp, verify_otp
from app.models.user import User
from app.models.provider import Provider
from app.models.job import Job, JobStatus, JobCategory
from app.models.payment import Payment, PaymentStatus
from app.services.notification_service import NotificationService
from app.services.verification_service import VerificationService
from app.services.geo_service import GeoService
from app.utils.validators import validate_location
from app.core.logging import log_user_action, log_business_event

jobs_bp = Blueprint('jobs', __name__)


@jobs_bp.route('/', methods=['POST'])
@jwt_required()
@customer_required
def post_job():
    """Post a new job"""
    data = request.get_json()
    user = get_current_user()
    
    # Validate required fields
    required_fields = ['category', 'title', 'description', 'address', 'lat', 'lng']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'error': f'Missing required field: {field}'
            }), 400
    
    # Validate category
    try:
        category = JobCategory(data['category'])
    except ValueError:
        return jsonify({
            'success': False,
            'error': f'Invalid category. Valid: {[c.value for c in JobCategory]}'
        }), 400
    
    # Validate location
    if not validate_location(data['lat'], data['lng']):
        return jsonify({
            'success': False,
            'error': 'Invalid location coordinates'
        }), 400
    
    # Create job
    job = Job(
        customer_id=user.id,
        category=category,
        subcategory=data.get('subcategory'),
        title=data['title'],
        description=data['description'],
        address=data['address'],
        city=data.get('city'),
        state=data.get('state'),
        location=f'POINT({data["lng"]} {data["lat"]})',  # GeoAlchemy uses POINT(lng lat)
        estimated_price=data.get('estimated_price'),
        start_time=data.get('start_time'),
        end_time=data.get('end_time'),
        status=JobStatus.POSTED
    )
    
    db.session.add(job)
    db.session.commit()
    
    log_business_event(app, 'job_posted', {
        'job_id': str(job.id),
        'customer_id': str(user.id),
        'category': job.category.value
    })
    
    # Notify nearby providers (if any)
    try:
        # Get providers within 10km
        nearby_providers = get_nearby_providers(data['lat'], data['lng'], 10)
        for provider in nearby_providers:
            if provider.user and provider.user.is_active:
                NotificationService.send_job_notification(
                    provider.user.phone,
                    job.title,
                    job.estimated_price or 0
                )
    except Exception as e:
        app.logger.error(f"Failed to notify providers: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Job posted successfully',
        'data': {
            'job_id': str(job.id),
            'status': job.status.value,
            'title': job.title,
            'created_at': job.created_at.isoformat() if job.created_at else None
        }
    }), 201


@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    """Get jobs with filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    status = request.args.get('status')
    city = request.args.get('city')
    state = request.args.get('state')
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    max_distance = request.args.get('max_distance', type=float, default=10)
    
    # Build query
    query = Job.query
    
    # Filters
    if category:
        query = query.filter_by(category=category)
    
    if status:
        query = query.filter_by(status=status)
    
    if city:
        query = query.filter_by(city=city)
    
    if state:
        query = query.filter_by(state=state)
    
    # Filter by distance
    if lat and lng:
        point = ST_SetSRID(ST_Point(lng, lat), 4326)
        query = query.filter(
            ST_Distance(Job.location, point) <= (max_distance * 1000)
        )
    
    # Order by created_at desc
    query = query.order_by(Job.created_at.desc())
    
    # Paginate
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    jobs = []
    for job in paginated.items:
        customer = User.query.get(job.customer_id)
        jobs.append({
            'id': str(job.id),
            'title': job.title,
            'description': job.description[:200] + '...' if len(job.description) > 200 else job.description,
            'category': job.category.value if job.category else None,
            'address': job.address,
            'estimated_price': job.estimated_price,
            'status': job.status.value if job.status else None,
            'customer_name': customer.full_name if customer else None,
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


@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    """Get job by ID"""
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    customer = User.query.get(job.customer_id)
    provider = User.query.get(job.provider_id) if job.provider_id else None
    
    return jsonify({
        'success': True,
        'data': {
            'job': {
                'id': str(job.id),
                'title': job.title,
                'description': job.description,
                'category': job.category.value if job.category else None,
                'subcategory': job.subcategory,
                'address': job.address,
                'city': job.city,
                'state': job.state,
                'estimated_price': job.estimated_price,
                'final_price': job.final_price,
                'status': job.status.value if job.status else None,
                'customer': {
                    'id': str(customer.id),
                    'full_name': customer.full_name,
                    'rating': customer.ratings_received and 
                        sum(r.rating for r in customer.ratings_received) / len(customer.ratings_received) 
                        if customer.ratings_received else 0
                },
                'provider': {
                    'id': str(provider.id),
                    'full_name': provider.full_name,
                    'rating': provider.provider.rating if provider and provider.provider else 0
                } if provider else None,
                'created_at': job.created_at.isoformat() if job.created_at else None,
                'check_in_time': job.check_in_time.isoformat() if job.check_in_time else None,
                'check_out_time': job.check_out_time.isoformat() if job.check_out_time else None,
            }
        }
    }), 200


@jobs_bp.route('/<job_id>/apply', methods=['POST'])
@jwt_required()
@provider_required
def apply_to_job(job_id):
    """Apply to a job"""
    user = get_current_user()
    provider = user.provider
    
    if not provider:
        return jsonify({
            'success': False,
            'error': 'Provider profile not found'
        }), 404
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check if can apply
    can_apply, message = job.can_apply(user)
    
    if not can_apply:
        return jsonify({
            'success': False,
            'error': message
        }), 400
    
    # Check if provider has required skills
    if job.category and job.category.value not in provider.skills:
        return jsonify({
            'success': False,
            'error': f'You do not have the required skills for this job. Required: {job.category.value}'
        }), 400
    
    # Assign provider to job (for now, auto-assign)
    job.provider_id = user.id
    job.status = JobStatus.ASSIGNED
    
    db.session.commit()
    
    log_business_event(app, 'job_applied', {
        'job_id': str(job.id),
        'provider_id': str(user.id)
    })
    
    # Notify customer
    try:
        NotificationService.send_provider_assigned_sms(
            job.customer.phone,
            user.full_name,
            job.title
        )
    except Exception as e:
        app.logger.error(f"Failed to send notification: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Applied to job successfully',
        'data': {
            'job_id': str(job.id),
            'status': job.status.value
        }
    }), 200


@jobs_bp.route('/<job_id>/check-in', methods=['POST'])
@jwt_required()
@provider_required
def check_in(job_id):
    """Check in to a job (start work)"""
    user = get_current_user()
    data = request.get_json()
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check if can check in
    can_check_in, message = job.can_check_in(user.id)
    
    if not can_check_in:
        return jsonify({
            'success': False,
            'error': message
        }), 400
    
    # Validate location
    if not data.get('lat') or not data.get('lng'):
        return jsonify({
            'success': False,
            'error': 'Location coordinates required for check-in'
        }), 400
    
    # Check if provider is within 100m of job location
    job_lat, job_lng = get_location_coords(job.location)
    distance = calculate_distance(
        data['lat'], data['lng'],
        job_lat, job_lng
    )
    
    if distance > 0.1:  # 100 meters
        return jsonify({
            'success': False,
            'error': f'You are {distance*1000:.0f}m away from the job location. Must be within 100m.'
        }), 400
    
    # Verify photo
    if not data.get('photo'):
        return jsonify({
            'success': False,
            'error': 'Before photo required for check-in'
        }), 400
    
    # Verify OTP
    if not data.get('otp'):
        return jsonify({
            'success': False,
            'error': 'OTP required for check-in'
        }), 400
    
    # Validate OTP
    if not verify_otp(data['otp'], job.check_in_otp_hash):
        return jsonify({
            'success': False,
            'error': 'Invalid OTP'
        }), 400
    
    # Process check-in
    job.status = JobStatus.IN_PROGRESS
    job.check_in_time = datetime.utcnow()
    job.check_in_location = f'POINT({data["lng"]} {data["lat"]})'
    job.check_in_photo = data['photo']
    job.check_in_otp_hash = None  # Invalidate OTP
    
    db.session.commit()
    
    log_business_event(app, 'job_checked_in', {
        'job_id': str(job.id),
        'provider_id': str(user.id),
        'location': f'{data["lat"]}, {data["lng"]}'
    })
    
    # Notify customer
    try:
        NotificationService.send_job_started_sms(
            job.customer.phone,
            job.title,
            user.full_name
        )
    except Exception as e:
        app.logger.error(f"Failed to send notification: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Checked in successfully',
        'data': {
            'job_id': str(job.id),
            'status': job.status.value,
            'check_in_time': job.check_in_time.isoformat() if job.check_in_time else None
        }
    }), 200


@jobs_bp.route('/<job_id>/check-out', methods=['POST'])
@jwt_required()
@provider_required
def check_out(job_id):
    """Check out of a job (complete work)"""
    user = get_current_user()
    data = request.get_json()
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check if can check out
    can_check_out, message = job.can_check_out(user.id)
    
    if not can_check_out:
        return jsonify({
            'success': False,
            'error': message
        }), 400
    
    # Validate location
    if not data.get('lat') or not data.get('lng'):
        return jsonify({
            'success': False,
            'error': 'Location coordinates required for check-out'
        }), 400
    
    # Check if provider is within 100m of job location
    job_lat, job_lng = get_location_coords(job.location)
    distance = calculate_distance(
        data['lat'], data['lng'],
        job_lat, job_lng
    )
    
    if distance > 0.1:  # 100 meters
        return jsonify({
            'success': False,
            'error': f'You are {distance*1000:.0f}m away from the job location. Must be within 100m.'
        }), 400
    
    # Verify photo
    if not data.get('photo'):
        return jsonify({
            'success': False,
            'error': 'After photo required for check-out'
        }), 400
    
    # Verify OTP
    if not data.get('otp'):
        return jsonify({
            'success': False,
            'error': 'OTP required for check-out'
        }), 400
    
    # Validate OTP
    if not verify_otp(data['otp'], job.check_out_otp_hash):
        return jsonify({
            'success': False,
            'error': 'Invalid OTP'
        }), 400
    
    # Process check-out
    job.status = JobStatus.COMPLETED
    job.check_out_time = datetime.utcnow()
    job.check_out_location = f'POINT({data["lng"]} {data["lat"]})'
    job.check_out_photo = data['photo']
    job.check_out_otp_hash = None  # Invalidate OTP
    job.completed_at = datetime.utcnow()
    
    # Release payment (will be done in payment module)
    # Payment will be released after customer confirmation
    
    db.session.commit()
    
    log_business_event(app, 'job_checked_out', {
        'job_id': str(job.id),
        'provider_id': str(user.id),
        'location': f'{data["lat"]}, {data["lng"]}'
    })
    
    # Notify customer
    try:
        NotificationService.send_job_completed_sms(
            job.customer.phone,
            job.title,
            user.full_name
        )
    except Exception as e:
        app.logger.error(f"Failed to send notification: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Checked out successfully. Awaiting customer confirmation.',
        'data': {
            'job_id': str(job.id),
            'status': job.status.value,
            'check_out_time': job.check_out_time.isoformat() if job.check_out_time else None
        }
    }), 200


@jobs_bp.route('/<job_id>/confirm', methods=['POST'])
@jwt_required()
@customer_required
def confirm_completion(job_id):
    """Customer confirms job completion"""
    user = get_current_user()
    data = request.get_json()
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check ownership
    if str(job.customer_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'You are not authorized to confirm this job'
        }), 403
    
    if job.status != JobStatus.COMPLETED:
        return jsonify({
            'success': False,
            'error': 'Job must be completed before confirmation'
        }), 400
    
    # Set final price
    if data.get('final_price'):
        job.final_price = data['final_price']
    
    db.session.commit()
    
    # Trigger payment release
    from app.services.payment_service import PaymentService
    try:
        PaymentService.release_payment(job.id)
    except Exception as e:
        app.logger.error(f"Failed to release payment: {e}")
        return jsonify({
            'success': False,
            'error': f'Payment release failed: {str(e)}'
        }), 500
    
    log_business_event(app, 'job_confirmed', {
        'job_id': str(job.id),
        'customer_id': str(user.id)
    })
    
    return jsonify({
        'success': True,
        'message': 'Job confirmed successfully. Payment has been released.',
        'data': {
            'job_id': str(job.id),
            'status': job.status.value,
            'final_price': job.final_price
        }
    }), 200


def get_nearby_providers(lat, lng, radius_km):
    """Get providers within radius"""
    point = ST_SetSRID(ST_Point(lng, lat), 4326)
    providers = Provider.query.filter(
        ST_Distance(Provider.location, point) <= (radius_km * 1000),
        Provider.is_available == True
    ).limit(20).all()
    return providers


def get_location_coords(location):
    """Extract lat/lng from GeoAlchemy location"""
    if not location:
        return None, None
    # Parse from WKT format
    wkt = str(location)
    if wkt.startswith('POINT('):
        coords = wkt.replace('POINT(', '').replace(')', '').split(' ')
        return float(coords[1]), float(coords[0])  # lat, lng
    return None, None


def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in km"""
    from math import radians, sin, cos, sqrt, atan2
    R = 6371  # Earth's radius in km
    
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c