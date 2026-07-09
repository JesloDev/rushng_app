from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from app.database import db
from app.models import Review, Booking, Merchant, User
from app.utils import merchant_required

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    """Create a review for a completed booking"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    booking_id = data.get('booking_id')
    rating = data.get('rating')
    comment = data.get('comment')
    
    # Validate required fields
    if not booking_id:
        return jsonify({
            'success': False,
            'message': 'Booking ID is required'
        }), 400
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({
            'success': False,
            'message': 'Rating must be an integer between 1 and 5'
        }), 400
    
    # Check if booking exists and belongs to user
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found or unauthorized'
        }), 404
    
    # Check if booking is completed
    if booking.status != 'completed':
        return jsonify({
            'success': False,
            'message': 'Booking must be completed to review'
        }), 400
    
    # Check if review already exists
    existing_review = Review.query.filter_by(booking_id=booking_id).first()
    if existing_review:
        return jsonify({
            'success': False,
            'message': 'This booking has already been reviewed'
        }), 409
    
    # Create review
    review = Review(
        id=str(uuid.uuid4()),
        user_id=user_id,
        booking_id=booking_id,
        merchant_id=booking.merchant_id,
        rating=rating,
        comment=comment
    )
    
    db.session.add(review)
    
    # Update merchant rating
    if booking.merchant_id:
        merchant = Merchant.query.get(booking.merchant_id)
        if merchant:
            reviews = Review.query.filter_by(merchant_id=merchant.id).all()
            avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
            merchant.rating = round(avg_rating, 2)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Review created successfully',
        'data': {
            'id': review.id,
            'booking_id': review.booking_id,
            'merchant_id': review.merchant_id,
            'rating': review.rating,
            'comment': review.comment,
            'created_at': review.created_at.isoformat()
        }
    }), 201


@reviews_bp.route('/<review_id>', methods=['GET'])
def get_review(review_id):
    """Get a specific review by ID"""
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({
            'success': False,
            'message': 'Review not found'
        }), 404
    
    user = User.query.get(review.user_id)
    merchant = Merchant.query.get(review.merchant_id)
    
    return jsonify({
        'success': True,
        'message': 'Review retrieved successfully',
        'data': {
            'id': review.id,
            'user_name': user.name if user else None,
            'booking_id': review.booking_id,
            'merchant_name': merchant.name if merchant else None,
            'merchant_id': review.merchant_id,
            'rating': review.rating,
            'comment': review.comment,
            'created_at': review.created_at.isoformat(),
            'updated_at': review.updated_at.isoformat() if review.updated_at else None
        }
    }), 200


@reviews_bp.route('/merchant/<merchant_id>', methods=['GET'])
def get_merchant_reviews(merchant_id):
    """Get all reviews for a merchant"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    min_rating = request.args.get('min_rating', type=int)
    
    merchant = Merchant.query.get(merchant_id)
    
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    query = Review.query.filter_by(merchant_id=merchant_id)
    
    if min_rating:
        query = query.filter(Review.rating >= min_rating)
    
    paginated = query.order_by(Review.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    reviews = []
    for review in paginated.items:
        user = User.query.get(review.user_id)
        reviews.append({
            'id': review.id,
            'user_name': user.name if user else None,
            'user_id': review.user_id,
            'rating': review.rating,
            'comment': review.comment,
            'booking_id': review.booking_id,
            'created_at': review.created_at.isoformat()
        })
    
    # Get rating summary
    all_reviews = Review.query.filter_by(merchant_id=merchant_id).all()
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in all_reviews:
        rating_distribution[r.rating] = rating_distribution.get(r.rating, 0) + 1
    
    total_reviews = len(all_reviews)
    avg_rating = sum(r.rating for r in all_reviews) / total_reviews if total_reviews > 0 else 0
    
    return jsonify({
        'success': True,
        'message': 'Merchant reviews retrieved',
        'data': {
            'merchant': {
                'id': merchant.id,
                'name': merchant.name,
                'rating': merchant.rating,
                'total_reviews': total_reviews
            },
            'reviews': reviews,
            'rating_distribution': rating_distribution,
            'average_rating': round(avg_rating, 2),
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@reviews_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_reviews():
    """Get reviews written by the current user"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    paginated = Review.query.filter_by(user_id=user_id).order_by(
        Review.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    reviews = []
    for review in paginated.items:
        merchant = Merchant.query.get(review.merchant_id)
        booking = Booking.query.get(review.booking_id)
        reviews.append({
            'id': review.id,
            'merchant_name': merchant.name if merchant else None,
            'merchant_id': review.merchant_id,
            'booking_id': review.booking_id,
            'rating': review.rating,
            'comment': review.comment,
            'service_type': booking.service_type_id if booking else None,
            'created_at': review.created_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'message': 'User reviews retrieved',
        'data': {
            'reviews': reviews,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@reviews_bp.route('/<review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """Update a review (user can only update their own)"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({
            'success': False,
            'message': 'Review not found'
        }), 404
    
    # Check ownership
    if review.user_id != user_id:
        return jsonify({
            'success': False,
            'message': 'You can only update your own reviews'
        }), 403
    
    # Check if booking is still completed
    booking = Booking.query.get(review.booking_id)
    if booking and booking.status != 'completed':
        return jsonify({
            'success': False,
            'message': 'Cannot update review for non-completed booking'
        }), 400
    
    # Update fields
    if 'rating' in data:
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({
                'success': False,
                'message': 'Rating must be an integer between 1 and 5'
            }), 400
        review.rating = rating
    
    if 'comment' in data:
        review.comment = data['comment']
    
    review.updated_at = datetime.utcnow()
    db.session.commit()
    
    # Update merchant rating
    if review.merchant_id:
        merchant = Merchant.query.get(review.merchant_id)
        if merchant:
            reviews = Review.query.filter_by(merchant_id=merchant.id).all()
            avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
            merchant.rating = round(avg_rating, 2)
            db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Review updated successfully',
        'data': {
            'id': review.id,
            'rating': review.rating,
            'comment': review.comment,
            'updated_at': review.updated_at.isoformat()
        }
    }), 200


@reviews_bp.route('/<review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Delete a review (user or admin only)"""
    user_id = get_jwt_identity()
    
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({
            'success': False,
            'message': 'Review not found'
        }), 404
    
    # Check ownership or admin
    user = User.query.get(user_id)
    if review.user_id != user_id and user.role != 'admin':
        return jsonify({
            'success': False,
            'message': 'You can only delete your own reviews'
        }), 403
    
    db.session.delete(review)
    db.session.commit()
    
    # Update merchant rating
    if review.merchant_id:
        merchant = Merchant.query.get(review.merchant_id)
        if merchant:
            reviews = Review.query.filter_by(merchant_id=merchant.id).all()
            avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
            merchant.rating = round(avg_rating, 2)
            db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Review deleted successfully'
    }), 200


@reviews_bp.route('/stats/<merchant_id>', methods=['GET'])
def get_review_stats(merchant_id):
    """Get review statistics for a merchant"""
    merchant = Merchant.query.get(merchant_id)
    
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    reviews = Review.query.filter_by(merchant_id=merchant_id).all()
    
    total_reviews = len(reviews)
    if total_reviews == 0:
        return jsonify({
            'success': True,
            'message': 'No reviews yet',
            'data': {
                'merchant_id': merchant_id,
                'merchant_name': merchant.name,
                'total_reviews': 0,
                'average_rating': 0,
                'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            }
        }), 200
    
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        rating_distribution[r.rating] = rating_distribution.get(r.rating, 0) + 1
    
    avg_rating = sum(r.rating for r in reviews) / total_reviews
    
    return jsonify({
        'success': True,
        'message': 'Review statistics retrieved',
        'data': {
            'merchant_id': merchant_id,
            'merchant_name': merchant.name,
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 2),
            'rating_distribution': rating_distribution,
            'percentage_breakdown': {
                str(rating): round((count / total_reviews) * 100, 1)
                for rating, count in rating_distribution.items()
            }
        }
    }), 200