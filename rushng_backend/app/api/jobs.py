from datetime import datetime
from math import radians, sin, cos, sqrt, atan2

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from geoalchemy2 import WKTElement, Geography
from geoalchemy2.functions import ST_DWithin, ST_SetSRID, ST_Point
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import joinedload

from app.core.database import db
from app.core.dependencies import get_current_user, customer_required, provider_required
from app.core.logging import log_business_event
from app.core.security import verify_otp
from app.models.provider import Provider
from app.models.job import Job, JobStatus, JobCategory
from app.models.user import User
from app.services.notification_service import NotificationService
from app.services.payment_service import PaymentService
from app.utils.validators import validate_location

jobs_bp = Blueprint('jobs', __name__)


# --- Helper Functions ---

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate Haversine distance between two points in km."""
    R = 6371.0  # Earth radius in km
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def get_location_coords(location):
    """Extract lat/lng from GeoAlchemy location safely using Shapely."""
    if not location:
        return None, None
    try:
        shape = to_shape(location)
        return shape.y, shape.x  # lat, lng
    except Exception:
        return None, None


def get_nearby_providers(lat, lng, radius_km):
    """Get available providers within radius (in km)."""
    point = ST_SetSRID(ST_Point(lng, lat), 4326)
    providers = Provider.query.filter(
        ST_DWithin(Provider.location.cast(Geography), point.cast(Geography), radius_km * 1000),
        Provider.is_available == True
    ).limit(20).all()
    return providers


def validate_proximity(provider_lat, provider_lng, job_location, max_distance_km=0.1):
    """Ensures provider is within allowed distance (default 100m) of job location."""
    job_lat, job_lng = get_location_coords(job_location)
    if job_lat is None or job_lng is None:
        return False, "Invalid job location stored on server."
    
    distance = calculate_distance(provider_lat, provider_lng, job_lat, job_lng)
    if distance > max_distance_km:
        return False, f"You are {distance * 1000:.0f}m away from job location. Must be within {int(max_distance_km * 1000)}m."
    return True, None


# --- Blueprint Routes ---

@jobs_bp.route('/', methods=['POST'])
@jwt_required()
@customer_required
def post_job():
    """Post a new job."""
    data = request.get_json() or {}
    user = get_current_user()

    required_fields = ['category', 'title', 'description', 'address', 'lat', 'lng']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400

    try:
        category = JobCategory(data['category'])
    except ValueError:
        return jsonify({
            'success': False,
            'error': f'Invalid category. Valid options: {[c.value for c in JobCategory]}'
        }), 400

    if not validate_location(data['lat'], data['lng']):
        return jsonify({'success': False, 'error': 'Invalid location coordinates'}), 400

    # Format Point cleanly for GeoAlchemy
    point_wkt = WKTElement(f'POINT({data["lng"]} {data["lat"]})', srid=4326)

    job = Job(
        customer_id=user.id,
        category=category,
        subcategory=data.get('subcategory'),
        title=data['title'],
        description=data['description'],
        address=data['address'],
        city=data.get('city'),
        state=data.get('state'),
        location=point_wkt,
        estimated_price=data.get('estimated_price'),
        start_time=data.get('start_time'),
        end_time=data.get('end_time'),
        status=JobStatus.POSTED
    )

    db.session.add(job)
    db.session.commit()

    log_business_event(current_app, 'job_posted', {
        'job_id': str(job.id),
        'customer_id': str(user.id),
        'category': job.category.value
    })

    # Async / Soft notify providers
    try:
        nearby_providers = get_nearby_providers(data['lat'], data['lng'], radius_km=10)
        for provider in nearby_providers:
            if provider.user and provider.user.is_active:
                NotificationService.send_job_notification(
                    provider.user.phone,
                    job.title,
                    job.estimated_price or 0
                )
    except Exception as e:
        current_app.logger.error(f"Failed to notify providers: {e}")

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
    """Get jobs with filters and eager loading."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    status = request.args.get('status')
    city = request.args.get('city')
    state = request.args.get('state')
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    max_distance = request.args.get('max_distance', type=float, default=10)

    # Use joinedload to avoid N+1 queries when fetching customer details
    query = Job.query.options(joinedload(Job.customer))

    if category:
        query = query.filter_by(category=category)
    if status:
        query = query.filter_by(status=status)
    if city:
        query = query.filter_by(city=city)
    if state:
        query = query.filter_by(state=state)

    if lat is not None and lng is not None:
        point = ST_SetSRID(ST_Point(lng, lat), 4326)
        query = query.filter(
            ST_DWithin(Job.location.cast(Geography), point.cast(Geography), max_distance * 1000)
        )

    paginated = query.order_by(Job.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    jobs = [{
        'id': str(job.id),
        'title': job.title,
        'description': (job.description[:200] + '...') if len(job.description or '') > 200 else job.description,
        'category': job.category.value if job.category else None,
        'address': job.address,
        'estimated_price': job.estimated_price,
        'status': job.status.value if job.status else None,
        'customer_name': job.customer.full_name if job.customer else None,
        'created_at': job.created_at.isoformat() if job.created_at else None
    } for job in paginated.items]

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
    """Get job by ID."""
    job = Job.query.get(job_id)

    if not job:
        return jsonify({'success': False, 'error': 'Job not found'}), 404

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
                    'rating': (sum(r.rating for r in customer.ratings_received) / len(customer.ratings_received))
                              if customer and customer.ratings_received else 0
                } if customer else None,
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
    """Apply to a job."""
    user = get_current_user()
    provider = user.provider

    if not provider:
        return jsonify({'success': False, 'error': 'Provider profile not found'}), 404

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found'}), 404

    can_apply, message = job.can_apply(user)
    if not can_apply:
        return jsonify({'success': False, 'error': message}), 400

    provider_skills = provider.skills or []
    if job.category and job.category.value not in provider_skills:
        return jsonify({
            'success': False,
            'error': f'You do not have required skills for this job. Required: {job.category.value}'
        }), 400

    job.provider_id = user.id
    job.status = JobStatus.ASSIGNED

    db.session.commit()

    log_business_event(current_app, 'job_applied', {
        'job_id': str(job.id),
        'provider_id': str(user.id)
    })

    try:
        NotificationService.send_provider_assigned_sms(
            job.customer.phone,
            user.full_name,
            job.title
        )
    except Exception as e:
        current_app.logger.error(f"Failed to send notification: {e}")

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
    """Check in to a job."""
    user = get_current_user()
    data = request.get_json() or {}

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found'}), 404

    can_check_in, message = job.can_check_in(user.id)
    if not can_check_in:
        return jsonify({'success': False, 'error': message}), 400

    if not data.get('lat') or not data.get('lng'):
        return jsonify({'success': False, 'error': 'Location coordinates required for check-in'}), 400

    # Geofence validation (100 meters)
    is_valid, geo_error = validate_proximity(data['lat'], data['lng'], job.location, max_distance_km=0.1)
    if not is_valid:
        return jsonify({'success': False, 'error': geo_error}), 400

    if not data.get('photo'):
        return jsonify({'success': False, 'error': 'Before photo required for check-in'}), 400

    if not data.get('otp') or not verify_otp(data['otp'], job.check_in_otp_hash):
        return jsonify({'success': False, 'error': 'Invalid or missing OTP'}), 400

    job.status = JobStatus.IN_PROGRESS
    job.check_in_time = datetime.utcnow()
    job.check_in_location = WKTElement(f'POINT({data["lng"]} {data["lat"]})', srid=4326)
    job.check_in_photo = data['photo']
    job.check_in_otp_hash = None  # Invalidate consumed OTP

    db.session.commit()

    log_business_event(current_app, 'job_checked_in', {
        'job_id': str(job.id),
        'provider_id': str(user.id),
        'location': f'{data["lat"]}, {data["lng"]}'
    })

    try:
        NotificationService.send_job_started_sms(
            job.customer.phone,
            job.title,
            user.full_name
        )
    except Exception as e:
        current_app.logger.error(f"Failed to send notification: {e}")

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
    """Check out of a job."""
    user = get_current_user()
    data = request.get_json() or {}

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found'}), 404

    can_check_out, message = job.can_check_out(user.id)
    if not can_check_out:
        return jsonify({'success': False, 'error': message}), 400

    if not data.get('lat') or not data.get('lng'):
        return jsonify({'success': False, 'error': 'Location coordinates required for check-out'}), 400

    # Geofence validation (100 meters)
    is_valid, geo_error = validate_proximity(data['lat'], data['lng'], job.location, max_distance_km=0.1)
    if not is_valid:
        return jsonify({'success': False, 'error': geo_error}), 400

    if not data.get('photo'):
        return jsonify({'success': False, 'error': 'After photo required for check-out'}), 400

    if not data.get('otp') or not verify_otp(data['otp'], job.check_out_otp_hash):
        return jsonify({'success': False, 'error': 'Invalid or missing OTP'}), 400

    job.status = JobStatus.COMPLETED
    job.check_out_time = datetime.utcnow()
    job.completed_at = datetime.utcnow()
    job.check_out_location = WKTElement(f'POINT({data["lng"]} {data["lat"]})', srid=4326)
    job.check_out_photo = data['photo']
    job.check_out_otp_hash = None  # Invalidate consumed OTP

    db.session.commit()

    log_business_event(current_app, 'job_checked_out', {
        'job_id': str(job.id),
        'provider_id': str(user.id),
        'location': f'{data["lat"]}, {data["lng"]}'
    })

    try:
        NotificationService.send_job_completed_sms(
            job.customer.phone,
            job.title,
            user.full_name
        )
    except Exception as e:
        current_app.logger.error(f"Failed to send notification: {e}")

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
    """Customer confirms job completion and releases funds."""
    user = get_current_user()
    data = request.get_json() or {}

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found'}), 404

    if str(job.customer_id) != str(user.id):
        return jsonify({'success': False, 'error': 'You are not authorized to confirm this job'}), 403

    if job.status != JobStatus.COMPLETED:
        return jsonify({'success': False, 'error': 'Job must be completed before confirmation'}), 400

    if data.get('final_price'):
        job.final_price = data['final_price']

    # Trigger payment release inside transaction boundary
    try:
        PaymentService.release_payment(job.id)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to release payment: {e}")
        return jsonify({'success': False, 'error': f'Payment release failed: {str(e)}'}), 500

    log_business_event(current_app, 'job_confirmed', {
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