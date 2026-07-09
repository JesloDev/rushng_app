from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from app.database import db
from app.models import Booking, ServiceType, Merchant, User, Product, BookingProduct
from app.utils import merchant_required, generate_tracking_code

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new booking"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validate required fields
    required_fields = ['service_type_id', 'pickup_address', 'dropoff_address']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Check if service type exists
    service = ServiceType.query.get(data['service_type_id'])
    if not service:
        return jsonify({
            'success': False,
            'message': 'Service type not found'
        }), 404
    
    # Calculate price
    total_price = service.base_price
    
    # Add distance-based pricing if available
    if service.price_per_km and data.get('distance_km'):
        total_price += service.price_per_km * data['distance_km']
    
    # Add time-based pricing if available
    if service.price_per_hour and data.get('duration_hours'):
        total_price += service.price_per_hour * data['duration_hours']
    
    # Add weight-based pricing for laundry
    if data.get('weight_kg') and service.slug == 'laundry':
        total_price += 300 * data['weight_kg']
    
    service_fee = total_price * 0.10  # 10% service fee
    tracking_code = generate_tracking_code()
    
    # Create booking
    booking = Booking(
        id=str(uuid.uuid4()),
        user_id=user_id,
        service_type_id=data['service_type_id'],
        merchant_id=data.get('merchant_id'),
        pickup_address=data['pickup_address'],
        pickup_lat=data.get('pickup_lat'),
        pickup_lng=data.get('pickup_lng'),
        dropoff_address=data['dropoff_address'],
        dropoff_lat=data.get('dropoff_lat'),
        dropoff_lng=data.get('dropoff_lng'),
        scheduled_time=data.get('scheduled_time'),
        notes=data.get('notes'),
        duration=data.get('duration'),
        weight=data.get('weight'),
        total_price=total_price,
        service_fee=service_fee,
        tracking_code=tracking_code,
        status='pending'
    )
    
    db.session.add(booking)
    db.session.flush()
    
    # Add products if provided
    if data.get('items'):
        for item in data['items']:
            product = Product.query.get(item.get('product_id'))
            if product:
                booking_product = BookingProduct(
                    id=str(uuid.uuid4()),
                    booking_id=booking.id,
                    product_id=product.id,
                    quantity=item.get('quantity', 1),
                    unit_price=product.price
                )
                db.session.add(booking_product)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Booking created successfully',
        'data': {
            'booking_id': booking.id,
            'tracking_code': tracking_code,
            'total_price': total_price,
            'service_fee': service_fee,
            'status': booking.status
        }
    }), 201


@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_bookings():
    """Get user's bookings with filters"""
    user_id = get_jwt_identity()
    
    # Get query parameters
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Build query
    query = Booking.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    # Paginate
    paginated = query.order_by(Booking.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    bookings = []
    for booking in paginated.items:
        service = ServiceType.query.get(booking.service_type_id)
        merchant = Merchant.query.get(booking.merchant_id) if booking.merchant_id else None
        
        bookings.append({
            'id': booking.id,
            'service_type': service.name if service else None,
            'service_type_id': booking.service_type_id,
            'merchant_name': merchant.name if merchant else None,
            'status': booking.status,
            'pickup_address': booking.pickup_address,
            'dropoff_address': booking.dropoff_address,
            'total_price': booking.total_price,
            'service_fee': booking.service_fee,
            'tracking_code': booking.tracking_code,
            'scheduled_time': booking.scheduled_time.isoformat() if booking.scheduled_time else None,
            'created_at': booking.created_at.isoformat(),
            'updated_at': booking.updated_at.isoformat() if booking.updated_at else None
        })
    
    return jsonify({
        'success': True,
        'message': 'Bookings retrieved successfully',
        'data': {
            'bookings': bookings,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Get a specific booking by ID"""
    user_id = get_jwt_identity()
    
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    service = ServiceType.query.get(booking.service_type_id)
    merchant = Merchant.query.get(booking.merchant_id) if booking.merchant_id else None
    
    # Get booking products
    booking_products = BookingProduct.query.filter_by(booking_id=booking.id).all()
    products = []
    for bp in booking_products:
        product = Product.query.get(bp.product_id)
        if product:
            products.append({
                'id': product.id,
                'name': product.name,
                'quantity': bp.quantity,
                'unit_price': bp.unit_price,
                'total_price': bp.quantity * bp.unit_price
            })
    
    return jsonify({
        'success': True,
        'message': 'Booking retrieved successfully',
        'data': {
            'id': booking.id,
            'service_type': service.name if service else None,
            'service_type_id': booking.service_type_id,
            'merchant_name': merchant.name if merchant else None,
            'merchant_id': booking.merchant_id,
            'status': booking.status,
            'pickup_address': booking.pickup_address,
            'pickup_lat': booking.pickup_lat,
            'pickup_lng': booking.pickup_lng,
            'dropoff_address': booking.dropoff_address,
            'dropoff_lat': booking.dropoff_lat,
            'dropoff_lng': booking.dropoff_lng,
            'total_price': booking.total_price,
            'service_fee': booking.service_fee,
            'rider_earning': booking.rider_earning,
            'notes': booking.notes,
            'duration': booking.duration,
            'weight': booking.weight,
            'tracking_code': booking.tracking_code,
            'scheduled_time': booking.scheduled_time.isoformat() if booking.scheduled_time else None,
            'completed_time': booking.completed_time.isoformat() if booking.completed_time else None,
            'products': products,
            'created_at': booking.created_at.isoformat(),
            'updated_at': booking.updated_at.isoformat() if booking.updated_at else None
        }
    }), 200


@bookings_bp.route('/<booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a pending or accepted booking"""
    user_id = get_jwt_identity()
    
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    if booking.status not in ['pending', 'accepted']:
        return jsonify({
            'success': False,
            'message': f'Booking cannot be cancelled (current status: {booking.status})'
        }), 400
    
    booking.status = 'cancelled'
    booking.completed_time = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Booking cancelled successfully',
        'data': {
            'id': booking.id,
            'status': booking.status
        }
    }), 200


@bookings_bp.route('/<booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    """Update booking status (Merchant/Rider only)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_status = data.get('status')
    if not new_status:
        return jsonify({
            'success': False,
            'message': 'Status is required'
        }), 400
    
    allowed_statuses = ['accepted', 'in_progress', 'completed', 'cancelled']
    if new_status not in allowed_statuses:
        return jsonify({
            'success': False,
            'message': f'Invalid status. Allowed: {", ".join(allowed_statuses)}'
        }), 400
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    # Check if user is merchant or rider associated with this booking
    user = User.query.get(user_id)
    if not user or user.role not in ['merchant', 'rider', 'admin']:
        return jsonify({
            'success': False,
            'message': 'You do not have permission to update this booking'
        }), 403
    
    # Verify merchant owns the booking
    if user.role == 'merchant':
        merchant = Merchant.query.filter_by(user_id=user_id).first()
        if not merchant or booking.merchant_id != merchant.id:
            return jsonify({
                'success': False,
                'message': 'You do not own this booking'
            }), 403
    
    # Update status
    booking.status = new_status
    
    if new_status == 'completed':
        booking.completed_time = datetime.utcnow()
        
        # Update merchant stats
        if booking.merchant_id:
            merchant = Merchant.query.get(booking.merchant_id)
            if merchant:
                merchant.total_orders += 1
                merchant.total_revenue += booking.total_price
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Booking status updated to {new_status}',
        'data': {
            'id': booking.id,
            'status': booking.status
        }
    }), 200


@bookings_bp.route('/<booking_id>/rate', methods=['POST'])
@jwt_required()
def rate_booking(booking_id):
    """Rate a completed booking"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    rating = data.get('rating')
    comment = data.get('comment')
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({
            'success': False,
            'message': 'Rating must be an integer between 1 and 5'
        }), 400
    
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    if booking.status != 'completed':
        return jsonify({
            'success': False,
            'message': 'Booking must be completed to rate'
        }), 400
    
    # Check if already rated
    from app.models import Review
    existing_review = Review.query.filter_by(booking_id=booking.id).first()
    if existing_review:
        return jsonify({
            'success': False,
            'message': 'This booking has already been rated'
        }), 400
    
    # Create review
    from app.models import Review
    review = Review(
        id=str(uuid.uuid4()),
        user_id=user_id,
        booking_id=booking.id,
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
        'message': 'Booking rated successfully',
        'data': {
            'booking_id': booking.id,
            'rating': rating,
            'comment': comment
        }
    }), 201


@bookings_bp.route('/<booking_id>/assign-rider', methods=['PUT'])
@jwt_required()
def assign_rider(booking_id):
    """Assign a rider to a booking (Merchant only)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    rider_id = data.get('rider_id')
    if not rider_id:
        return jsonify({
            'success': False,
            'message': 'Rider ID is required'
        }), 400
    
    # Check if user is a merchant
    user = User.query.get(user_id)
    if user.role not in ['merchant', 'admin']:
        return jsonify({
            'success': False,
            'message': 'Only merchants can assign riders'
        }), 403
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    # Verify merchant owns the booking
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    if not merchant or booking.merchant_id != merchant.id:
        return jsonify({
            'success': False,
            'message': 'You do not own this booking'
        }), 403
    
    # Check if rider exists and is a rider
    rider = User.query.get(rider_id)
    if not rider or rider.role != 'rider':
        return jsonify({
            'success': False,
            'message': 'Rider not found or user is not a rider'
        }), 404
    
    # Update booking
    booking.rider_id = rider_id
    booking.status = 'accepted'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Rider assigned successfully',
        'data': {
            'booking_id': booking.id,
            'rider_id': rider_id,
            'status': booking.status
        }
    }), 200


@bookings_bp.route('/<booking_id>/track', methods=['GET'])
def track_booking(booking_id):
    """Public tracking endpoint - no auth required"""
    booking = Booking.query.filter_by(tracking_code=booking_id).first()
    
    if not booking:
        # Try by UUID
        booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    service = ServiceType.query.get(booking.service_type_id)
    
    return jsonify({
        'success': True,
        'message': 'Booking tracking information',
        'data': {
            'tracking_code': booking.tracking_code,
            'status': booking.status,
            'pickup_address': booking.pickup_address,
            'dropoff_address': booking.dropoff_address,
            'scheduled_time': booking.scheduled_time.isoformat() if booking.scheduled_time else None,
            'estimated_delivery': booking.completed_time.isoformat() if booking.completed_time else None,
            'service_type': service.name if service else None,
            'created_at': booking.created_at.isoformat()
        }
    }), 200


@bookings_bp.route('/merchant', methods=['GET'])
@jwt_required()
def get_merchant_bookings():
    """Get bookings for merchant's store"""
    user_id = get_jwt_identity()
    
    # Check if user is a merchant
    user = User.query.get(user_id)
    if user.role not in ['merchant', 'admin']:
        return jsonify({
            'success': False,
            'message': 'Only merchants can access this endpoint'
        }), 403
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant profile not found'
        }), 404
    
    # Get query parameters
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Build query
    query = Booking.query.filter_by(merchant_id=merchant.id)
    
    if status:
        query = query.filter_by(status=status)
    
    # Paginate
    paginated = query.order_by(Booking.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    bookings = []
    for booking in paginated.items:
        service = ServiceType.query.get(booking.service_type_id)
        user = User.query.get(booking.user_id)
        
        bookings.append({
            'id': booking.id,
            'customer_name': user.name if user else None,
            'service_type': service.name if service else None,
            'status': booking.status,
            'total_price': booking.total_price,
            'tracking_code': booking.tracking_code,
            'created_at': booking.created_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'message': 'Merchant bookings retrieved successfully',
        'data': {
            'bookings': bookings,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200