from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.database import db

class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(db.Model, TimestampMixin):
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='buyer')
    avatar = db.Column(db.String(500))
    address = db.Column(db.Text)
    state = db.Column(db.String(100))
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    reset_token = db.Column(db.String(255))
    reset_token_expires = db.Column(db.DateTime)
    
    # Relationships
    merchant = db.relationship('Merchant', backref='user', uselist=False)
    bookings = db.relationship('Booking', foreign_keys='Booking.user_id', backref='user')
    rider_bookings = db.relationship('Booking', foreign_keys='Booking.rider_id', backref='rider')
    refresh_tokens = db.relationship('RefreshToken', backref='user', lazy='dynamic')
    reviews = db.relationship('Review', backref='user')

class RefreshToken(db.Model, TimestampMixin):
    __tablename__ = 'refresh_tokens'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(500), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    revoked = db.Column(db.Boolean, default=False)

class Merchant(db.Model, TimestampMixin):
    __tablename__ = 'merchants'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text)
    logo = db.Column(db.String(500))
    cover_image = db.Column(db.String(500))
    category = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    website = db.Column(db.String(255))
    is_verified = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_orders = db.Column(db.Integer, default=0)
    total_revenue = db.Column(db.Float, default=0.0)
    plan = db.Column(db.String(50), default='free')
    store_theme = db.Column(db.String(50), default='orange')
    store_cover_color = db.Column(db.String(50), default='#f97316')
    store_views = db.Column(db.Integer, default=0)
    
    # Relationships
    products = db.relationship('Product', backref='merchant', lazy='dynamic')
    bookings = db.relationship('Booking', backref='merchant')
    reviews = db.relationship('Review', backref='merchant')
    analytics = db.relationship('MerchantAnalytics', backref='merchant', lazy='dynamic')

class Product(db.Model, TimestampMixin):
    __tablename__ = 'products'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('merchants.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500))
    category = db.Column(db.String(100), nullable=False)
    in_stock = db.Column(db.Boolean, default=True)
    featured = db.Column(db.Boolean, default=False)
    sales_count = db.Column(db.Integer, default=0)
    
    # Relationships
    booking_products = db.relationship('BookingProduct', backref='product')

class ServiceType(db.Model, TimestampMixin):
    __tablename__ = 'service_types'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    base_price = db.Column(db.Float, nullable=False)
    price_per_km = db.Column(db.Float)
    price_per_hour = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    
    # Relationships
    bookings = db.relationship('Booking', backref='service_type')

class Booking(db.Model, TimestampMixin):
    __tablename__ = 'bookings'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    merchant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('merchants.id'))
    rider_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    service_type_id = db.Column(UUID(as_uuid=True), db.ForeignKey('service_types.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')
    pickup_address = db.Column(db.Text, nullable=False)
    pickup_lat = db.Column(db.Float)
    pickup_lng = db.Column(db.Float)
    dropoff_address = db.Column(db.Text, nullable=False)
    dropoff_lat = db.Column(db.Float)
    dropoff_lng = db.Column(db.Float)
    scheduled_time = db.Column(db.DateTime)
    completed_time = db.Column(db.DateTime)
    total_price = db.Column(db.Float, nullable=False)
    service_fee = db.Column(db.Float, nullable=False)
    rider_earning = db.Column(db.Float)
    notes = db.Column(db.Text)
    duration = db.Column(db.Integer)
    weight = db.Column(db.Float)
    tracking_code = db.Column(db.String(50), unique=True)
    
    # Relationships
    booking_products = db.relationship('BookingProduct', backref='booking')
    review = db.relationship('Review', backref='booking', uselist=False)
    payments = db.relationship('Payment', backref='booking')

class BookingProduct(db.Model, TimestampMixin):
    __tablename__ = 'booking_products'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)

class Payment(db.Model, TimestampMixin):
    __tablename__ = 'payments'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='pending')
    reference = db.Column(db.String(255), unique=True)
    transaction_id = db.Column(db.String(255))
    payment_metadata = db.Column(db.JSON)

class MerchantAnalytics(db.Model, TimestampMixin):
    __tablename__ = 'merchant_analytics'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('merchants.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    views = db.Column(db.Integer, default=0)
    unique_visitors = db.Column(db.Integer, default=0)
    orders_placed = db.Column(db.Integer, default=0)
    revenue = db.Column(db.Float, default=0.0)

class Review(db.Model, TimestampMixin):
    __tablename__ = 'reviews'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), unique=True, nullable=False)
    merchant_id = db.Column(UUID(as_uuid=True), db.ForeignKey('merchants.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Review {self.id} - Rating: {self.rating}>'