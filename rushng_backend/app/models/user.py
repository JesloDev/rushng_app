from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum, Index
from datetime import datetime, timezone
import uuid
import enum

from app.core.database import db


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    PROVIDER = "PROVIDER"
    ADMIN = "ADMIN"
    SUPPORT = "SUPPORT"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            value = value.lower()
            for member in cls:
                if member.value == value:
                    return member
        return None


class User(db.Model):
    __tablename__ = 'users'
    
    __table_args__ = (
        # Partial unique indexes: allow re-registering emails/phones if account was soft-deleted
        Index('uix_users_active_email', 'email', unique=True, postgresql_where=(Column('deleted_at').is_(None))),
        Index('uix_users_active_phone', 'phone', unique=True, postgresql_where=(Column('deleted_at').is_(None))),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    role = Column(
        Enum(
            UserRole,
            name='user_role',
            values_callable=lambda x: [e.value for e in x],
            native_enum=True
        ),
        nullable=False,
        default=UserRole.CUSTOMER
    )
    
    # Verification
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(255))
    verification_sent_at = Column(DateTime(timezone=True))
    
    # Personal Information
    nin = Column(String(11), unique=True)
    bvn = Column(String(11), unique=True)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default='Nigeria')
    profile_picture = Column(String(500))
    
    # Account Status
    is_active = Column(Boolean, default=True)
    is_verified_provider = Column(Boolean, default=False)
    verification_status = Column(String(50), default='pending')
    
    # Password Reset
    reset_token = Column(String(255))
    reset_token_expires = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )
    last_login = Column(DateTime(timezone=True))
    
    # Soft Delete
    deleted_at = Column(DateTime(timezone=True))
    deleted_by = Column(UUID(as_uuid=True))
    deletion_reason = Column(Text)
    
    # Relationships
    provider = db.relationship('Provider', back_populates='user', uselist=False, cascade='all, delete-orphan')
    jobs_as_customer = db.relationship('Job', foreign_keys='Job.customer_id', back_populates='customer')
    jobs_as_provider = db.relationship('Job', foreign_keys='Job.provider_id', back_populates='provider_assigned')
    ratings_given = db.relationship('Rating', foreign_keys='Rating.rater_id', back_populates='rater')
    ratings_received = db.relationship('Rating', foreign_keys='Rating.target_id', back_populates='target')
    violations_reported = db.relationship('Violation', foreign_keys='Violation.reported_by', back_populates='reporter')
    violations_received = db.relationship('Violation', foreign_keys='Violation.user_id', back_populates='user')
    notifications = db.relationship('Notification', back_populates='user')
    refresh_tokens = db.relationship('RefreshToken', back_populates='user', lazy='dynamic')
    
    def __init__(self, **kwargs):
        if 'role' in kwargs and isinstance(kwargs['role'], str):
            kwargs['role'] = UserRole(kwargs['role'])
        super(User, self).__init__(**kwargs)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def is_provider(self):
        return self.role == UserRole.PROVIDER or self.is_verified_provider
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': str(self.id),
            'email': self.email,
            'phone': self.phone,
            'full_name': self.full_name,
            'role': self.role.value if hasattr(self.role, 'value') else str(self.role),
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_sensitive:
            data.update({
                'nin': self.nin,
                'bvn': self.bvn,
                'address': self.address,
                'city': self.city,
                'state': self.state,
                'is_verified_provider': self.is_verified_provider,
                'verification_status': self.verification_status,
            })
        
        return data