from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from app.database import db
from app.models import Merchant, User, Product, Booking, Review, MerchantAnalytics
from app.utils import merchant_required, generate_slug, admin_required

merchants_bp = Blueprint('merchants', __name__)

@merchants_bp.route('/register', methods=['POST'])
@jwt_required()
def register_merchant():
    """Register a new merchant store"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validate required fields
    required_fields = ['name', 'category', 'address', 'phone', 'email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Check if user already has a merchant
    existing = Merchant.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({
            'success': False,
            'message': 'User already has a merchant account'
        }), 409
    
    # Check if merchant name is taken
    slug = generate_slug(data['name'])
    existing_slug = Merchant.query.filter_by(slug=slug).first()
    if existing_slug:
        slug = f"{slug}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Create merchant
    merchant = Merchant(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=data['name'],
        slug=slug,
        description=data.get('description'),
        category=data['category'],
        address=data['address'],
        phone=data['phone'],
        email=data['email'],
        website=data.get('website'),
        plan='free',
        is_verified=False
    )
    
    db.session.add(merchant)
    
    # Update user role
    user = User.query.get(user_id)
    if user:
        user.role = 'merchant'
    
    # Create initial analytics entry
    analytics = MerchantAnalytics(
        id=str(uuid.uuid4()),
        merchant_id=merchant.id,
        date=datetime.utcnow().date()
    )
    db.session.add(analytics)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Merchant registered successfully',
        'data': {
            'id': merchant.id,
            'name': merchant.name,
            'slug': merchant.slug,
            'category': merchant.category,
            'plan': merchant.plan,
            'is_verified': merchant.is_verified
        }
    }), 201


@merchants_bp.route('/', methods=['GET'])
def get_merchants():
    """Get all merchants with filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = Merchant.query.filter_by(is_verified=True)
    
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(
            (Merchant.name.ilike(f'%{search}%')) |
            (Merchant.description.ilike(f'%{search}%'))
        )
    
    paginated = query.order_by(Merchant.is_featured.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    merchants = []
    for merchant in paginated.items:
        user = User.query.get(merchant.user_id)
        merchants.append({
            'id': merchant.id,
            'name': merchant.name,
            'slug': merchant.slug,
            'description': merchant.description,
            'logo': merchant.logo,
            'cover_image': merchant.cover_image,
            'category': merchant.category,
            'address': merchant.address,
            'phone': merchant.phone,
            'email': merchant.email,
            'website': merchant.website,
            'is_verified': merchant.is_verified,
            'is_featured': merchant.is_featured,
            'rating': merchant.rating,
            'total_orders': merchant.total_orders,
            'plan': merchant.plan,
            'owner_name': user.name if user else None,
            'created_at': merchant.created_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'message': 'Merchants retrieved successfully',
        'data': {
            'merchants': merchants,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@merchants_bp.route('/<slug>', methods=['GET'])
def get_merchant_by_slug(slug):
    """Get merchant by slug with products"""
    merchant = Merchant.query.filter_by(slug=slug, is_verified=True).first()
    
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    # Get products
    products = Product.query.filter_by(
        merchant_id=merchant.id,
        in_stock=True
    ).order_by(Product.featured.desc()).all()
    
    # Get reviews
    reviews = Review.query.filter_by(
        merchant_id=merchant.id
    ).order_by(Review.created_at.desc()).limit(10).all()
    
    # Update store views
    merchant.store_views += 1
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Merchant retrieved successfully',
        'data': {
            'merchant': {
                'id': merchant.id,
                'name': merchant.name,
                'slug': merchant.slug,
                'description': merchant.description,
                'logo': merchant.logo,
                'cover_image': merchant.cover_image,
                'category': merchant.category,
                'address': merchant.address,
                'phone': merchant.phone,
                'email': merchant.email,
                'website': merchant.website,
                'rating': merchant.rating,
                'total_orders': merchant.total_orders,
                'plan': merchant.plan,
                'store_theme': merchant.store_theme,
                'store_cover_color': merchant.store_cover_color,
                'store_views': merchant.store_views
            },
            'products': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'price': p.price,
                'image_url': p.image_url,
                'category': p.category,
                'in_stock': p.in_stock,
                'featured': p.featured
            } for p in products],
            'reviews': [{
                'id': r.id,
                'user_name': User.query.get(r.user_id).name if User.query.get(r.user_id) else None,
                'rating': r.rating,
                'comment': r.comment,
                'created_at': r.created_at.isoformat()
            } for r in reviews],
            'stats': {
                'total_orders': merchant.total_orders,
                'rating': merchant.rating,
                'total_reviews': Review.query.filter_by(merchant_id=merchant.id).count()
            }
        }
    }), 200


@merchants_bp.route('/profile', methods=['PUT'])
@jwt_required()
@merchant_required
def update_merchant_profile():
    """Update merchant profile"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    # Update fields
    updatable_fields = ['name', 'description', 'category', 'address', 'phone', 'email', 'website', 'logo', 'cover_image']
    
    for field in updatable_fields:
        if field in data:
            setattr(merchant, field, data[field])
    
    # Update slug if name changed
    if 'name' in data and data['name'] != merchant.name:
        new_slug = generate_slug(data['name'])
        existing = Merchant.query.filter_by(slug=new_slug).first()
        if existing and existing.id != merchant.id:
            new_slug = f"{new_slug}-{datetime.utcnow().strftime('%Y%m%d')}"
        merchant.slug = new_slug
    
    merchant.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'data': {
            'id': merchant.id,
            'name': merchant.name,
            'slug': merchant.slug,
            'category': merchant.category,
            'phone': merchant.phone,
            'email': merchant.email
        }
    }), 200


@merchants_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@merchant_required
def get_dashboard():
    """Get merchant dashboard stats"""
    user_id = get_jwt_identity()
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    # Get stats
    total_orders = Booking.query.filter_by(merchant_id=merchant.id).count()
    completed_orders = Booking.query.filter_by(
        merchant_id=merchant.id,
        status='completed'
    ).count()
    pending_orders = Booking.query.filter_by(
        merchant_id=merchant.id,
        status='pending'
    ).count()
    
    total_revenue = db.session.query(db.func.sum(Booking.total_price)).filter(
        Booking.merchant_id == merchant.id,
        Booking.status == 'completed'
    ).scalar() or 0
    
    # Get recent orders
    recent_orders = Booking.query.filter_by(
        merchant_id=merchant.id
    ).order_by(Booking.created_at.desc()).limit(10).all()
    
    # Get top products by sales
    top_products = db.session.query(
        Product,
        db.func.sum(BookingProduct.quantity).label('total_sold')
    ).join(
        BookingProduct, BookingProduct.product_id == Product.id
    ).join(
        Booking, Booking.id == BookingProduct.booking_id
    ).filter(
        Product.merchant_id == merchant.id,
        Booking.status == 'completed'
    ).group_by(Product.id).order_by(
        db.desc('total_sold')
    ).limit(5).all()
    
    # Get analytics
    analytics = MerchantAnalytics.query.filter_by(
        merchant_id=merchant.id
    ).order_by(MerchantAnalytics.date.desc()).limit(30).all()
    
    total_views = sum(a.views for a in analytics) if analytics else 0
    total_visitors = sum(a.unique_visitors for a in analytics) if analytics else 0
    
    return jsonify({
        'success': True,
        'message': 'Dashboard data retrieved',
        'data': {
            'merchant': {
                'id': merchant.id,
                'name': merchant.name,
                'slug': merchant.slug,
                'rating': merchant.rating,
                'plan': merchant.plan
            },
            'stats': {
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'pending_orders': pending_orders,
                'total_revenue': float(total_revenue),
                'total_views': total_views,
                'total_visitors': total_visitors
            },
            'recent_orders': [{
                'id': order.id,
                'tracking_code': order.tracking_code,
                'customer': User.query.get(order.user_id).name if User.query.get(order.user_id) else None,
                'total_price': order.total_price,
                'status': order.status,
                'created_at': order.created_at.isoformat()
            } for order in recent_orders],
            'top_products': [{
                'name': product.name,
                'price': product.price,
                'total_sold': total_sold
            } for product, total_sold in top_products]
        }
    }), 200


@merchants_bp.route('/products', methods=['POST'])
@jwt_required()
@merchant_required
def add_product():
    """Add a product to merchant's store"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    # Validate required fields
    if not data.get('name') or data.get('price') is None:
        return jsonify({
            'success': False,
            'message': 'Name and price are required'
        }), 400
    
    # Check product limit based on plan
    product_count = Product.query.filter_by(merchant_id=merchant.id).count()
    limits = {
        'free': 5,
        'basic': 50,
        'premium': None  # Unlimited
    }
    limit = limits.get(merchant.plan, 5)
    
    if limit and product_count >= limit:
        return jsonify({
            'success': False,
            'message': f'Product limit reached. Your {merchant.plan} plan allows {limit} products. Upgrade to add more.'
        }), 403
    
    # Create product
    product = Product(
        id=str(uuid.uuid4()),
        merchant_id=merchant.id,
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        image_url=data.get('image_url'),
        category=data.get('category', 'General'),
        in_stock=data.get('in_stock', True),
        featured=data.get('featured', False)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Product added successfully',
        'data': {
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'category': product.category
        }
    }), 201


@merchants_bp.route('/products/<product_id>', methods=['PUT'])
@jwt_required()
@merchant_required
def update_product(product_id):
    """Update a product"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Verify ownership
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    product = Product.query.filter_by(
        id=product_id,
        merchant_id=merchant.id
    ).first()
    
    if not product:
        return jsonify({
            'success': False,
            'message': 'Product not found or unauthorized'
        }), 404
    
    # Update fields
    updatable_fields = ['name', 'description', 'price', 'image_url', 'category', 'in_stock', 'featured']
    
    for field in updatable_fields:
        if field in data:
            setattr(product, field, data[field])
    
    product.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Product updated successfully',
        'data': {
            'id': product.id,
            'name': product.name,
            'price': product.price
        }
    }), 200


@merchants_bp.route('/products/<product_id>', methods=['DELETE'])
@jwt_required()
@merchant_required
def delete_product(product_id):
    """Delete a product"""
    user_id = get_jwt_identity()
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    product = Product.query.filter_by(
        id=product_id,
        merchant_id=merchant.id
    ).first()
    
    if not product:
        return jsonify({
            'success': False,
            'message': 'Product not found or unauthorized'
        }), 404
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Product deleted successfully'
    }), 200


@merchants_bp.route('/products', methods=['GET'])
@jwt_required()
@merchant_required
def get_merchant_products():
    """Get all products for a merchant"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    category = request.args.get('category')
    in_stock = request.args.get('in_stock')
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    query = Product.query.filter_by(merchant_id=merchant.id)
    
    if category:
        query = query.filter_by(category=category)
    
    if in_stock is not None:
        in_stock_bool = in_stock.lower() == 'true'
        query = query.filter_by(in_stock=in_stock_bool)
    
    paginated = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'message': 'Products retrieved successfully',
        'data': {
            'products': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'price': p.price,
                'image_url': p.image_url,
                'category': p.category,
                'in_stock': p.in_stock,
                'featured': p.featured,
                'sales_count': p.sales_count,
                'created_at': p.created_at.isoformat()
            } for p in paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200


@merchants_bp.route('/analytics', methods=['GET'])
@jwt_required()
@merchant_required
def get_merchant_analytics():
    """Get merchant analytics data"""
    user_id = get_jwt_identity()
    days = request.args.get('days', 30, type=int)
    
    merchant = Merchant.query.filter_by(user_id=user_id).first()
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    # Get daily analytics
    analytics = MerchantAnalytics.query.filter(
        MerchantAnalytics.merchant_id == merchant.id,
        MerchantAnalytics.date >= datetime.utcnow().date() - timedelta(days=days)
    ).order_by(MerchantAnalytics.date.asc()).all()
    
    # Get daily revenue
    daily_revenue = db.session.query(
        db.func.date(Booking.created_at).label('date'),
        db.func.sum(Booking.total_price).label('revenue')
    ).filter(
        Booking.merchant_id == merchant.id,
        Booking.status == 'completed',
        Booking.created_at >= datetime.utcnow() - timedelta(days=days)
    ).group_by(
        db.func.date(Booking.created_at)
    ).order_by(
        db.func.date(Booking.created_at).asc()
    ).all()
    
    return jsonify({
        'success': True,
        'message': 'Analytics data retrieved',
        'data': {
            'daily_views': [{
                'date': a.date.isoformat(),
                'views': a.views,
                'visitors': a.unique_visitors
            } for a in analytics],
            'daily_revenue': [{
                'date': d.date.isoformat(),
                'revenue': float(d.revenue) if d.revenue else 0
            } for d in daily_revenue],
            'summary': {
                'total_views': sum(a.views for a in analytics),
                'total_visitors': sum(a.unique_visitors for a in analytics),
                'total_revenue': sum(float(d.revenue) or 0 for d in daily_revenue)
            }
        }
    }), 200


@merchants_bp.route('/verify/<merchant_id>', methods=['PUT'])
@jwt_required()
@admin_required
def verify_merchant(merchant_id):
    """Verify a merchant (Admin only)"""
    data = request.get_json()
    
    merchant = Merchant.query.get(merchant_id)
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    merchant.is_verified = data.get('is_verified', True)
    merchant.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Merchant verified status updated to {merchant.is_verified}'
    }), 200


@merchants_bp.route('/<merchant_id>/analytics/record-view', methods=['POST'])
def record_store_view(merchant_id):
    """Record a store view (public endpoint)"""
    data = request.get_json()
    visitor_id = data.get('visitor_id')
    
    merchant = Merchant.query.get(merchant_id)
    if not merchant:
        return jsonify({
            'success': False,
            'message': 'Merchant not found'
        }), 404
    
    # Update merchant views
    merchant.store_views += 1
    
    # Update analytics
    today = datetime.utcnow().date()
    analytics = MerchantAnalytics.query.filter_by(
        merchant_id=merchant_id,
        date=today
    ).first()
    
    if analytics:
        analytics.views += 1
        if visitor_id:
            # In production, track unique visitors properly
            analytics.unique_visitors += 1
    else:
        analytics = MerchantAnalytics(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            date=today,
            views=1,
            unique_visitors=1 if visitor_id else 0
        )
        db.session.add(analytics)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'View recorded'
    }), 200