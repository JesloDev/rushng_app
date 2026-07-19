from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.core.database import db
from app.core.dependencies import get_current_user
from app.models.rating import Rating
from app.models.job import Job, JobStatus
from app.models.user import User
from app.models.provider import Provider
from app.services.notification_service import NotificationService
from app.core.logging import log_user_action

ratings_bp = Blueprint('ratings', __name__)


@ratings_bp.route('/', methods=['POST'])
@jwt_required()
def create_rating():
    """Create a rating for a job"""
    user = get_current_user()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('job_id'):
        return jsonify({
            'success': False,
            'error': 'Job ID required'
        }), 400
    
    if not data.get('rating') or not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
        return jsonify({
            'success': False,
            'error': 'Rating must be an integer between 1 and 5'
        }), 400
    
    if not data.get('target_id'):
        return jsonify({
            'success': False,
            'error': 'Target user ID required'
        }), 400
    
    job = Job.query.get(data['job_id'])
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check job is completed
    if job.status != JobStatus.COMPLETED:
        return jsonify({
            'success': False,
            'error': 'Job must be completed before rating'
        }), 400
    
    # Check user is part of the job
    if str(job.customer_id) != str(user.id) and str(job.provider_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'You are not authorized to rate this job'
        }), 403
    
    # Determine target type
    if str(data['target_id']) == str(job.customer_id):
        target_type = 'customer'
    elif str(data['target_id']) == str(job.provider_id):
        target_type = 'provider'
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid target user'
        }), 400
    
    # Check if already rated
    existing_rating = Rating.query.filter_by(
        job_id=job.id,
        rater_id=user.id,
        target_id=data['target_id']
    ).first()
    
    if existing_rating:
        return jsonify({
            'success': False,
            'error': 'You have already rated this user for this job'
        }), 409
    
    # Create rating
    rating = Rating(
        job_id=job.id,
        rater_id=user.id,
        target_id=data['target_id'],
        rating=data['rating'],
        comment=data.get('comment'),
        categories=data.get('categories', {}),
        target_type=target_type
    )
    
    db.session.add(rating)
    db.session.commit()
    
    # Update user's rating
    target_user = User.query.get(data['target_id'])
    
    if target_user:
        # Calculate average rating
        ratings = Rating.query.filter_by(target_id=target_user.id).all()
        avg_rating = sum(r.rating for r in ratings) / len(ratings) if ratings else 0
        
        # If target is a provider, update provider rating
        if target_user.is_provider() and target_user.provider:
            target_user.provider.rating = avg_rating
            db.session.commit()
    
    log_user_action(current_app, user.id, 'rating_created', {
        'job_id': str(job.id),
        'target_id': str(data['target_id']),
        'rating': data['rating']
    })
    
    # Notify target user
    try:
        NotificationService.send_rating_received_sms(
            target_user.phone,
            user.full_name,
            data['rating'],
            job.title
        )
    except Exception as e:
        current_app.logger.error(f"Failed to send notification: {e}")
    
    return jsonify({
        'success': True,
        'message': 'Rating submitted successfully',
        'data': rating.to_dict()
    }), 201


@ratings_bp.route('/user/<user_id>', methods=['GET'])
def get_user_ratings(user_id):
    """Get ratings for a user"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    paginated = Rating.query.filter_by(target_id=user_id).order_by(
        Rating.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    ratings = []
    for rating in paginated.items:
        rater = User.query.get(rating.rater_id)
        job = Job.query.get(rating.job_id)
        
        ratings.append({
            **rating.to_dict(),
            'rater_name': rater.full_name if rater else None,
            'job_title': job.title if job else None
        })
    
    # Calculate summary
    all_ratings = Rating.query.filter_by(target_id=user_id).all()
    avg_rating = sum(r.rating for r in all_ratings) / len(all_ratings) if all_ratings else 0
    
    return jsonify({
        'success': True,
        'data': {
            'ratings': ratings,
            'summary': {
                'average': round(avg_rating, 2),
                'total': len(all_ratings),
                'distribution': {
                    '5': sum(1 for r in all_ratings if r.rating == 5),
                    '4': sum(1 for r in all_ratings if r.rating == 4),
                    '3': sum(1 for r in all_ratings if r.rating == 3),
                    '2': sum(1 for r in all_ratings if r.rating == 2),
                    '1': sum(1 for r in all_ratings if r.rating == 1)
                }
            },
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@ratings_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_ratings():
    """Get current user's ratings"""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    paginated = Rating.query.filter_by(target_id=user.id).order_by(
        Rating.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    ratings = []
    for rating in paginated.items:
        rater = User.query.get(rating.rater_id)
        job = Job.query.get(rating.job_id)
        
        ratings.append({
            **rating.to_dict(),
            'rater_name': rater.full_name if rater else None,
            'job_title': job.title if job else None
        })
    
    return jsonify({
        'success': True,
        'data': {
            'ratings': ratings,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200