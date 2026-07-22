from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum
from datetime import datetime, timezone
import uuid
import enum

from app.core.database import db


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"
    SUPPORT = "support"

    @classmethod
    def _missing_(cls, value):
        # Handles case-insensitive lookups (e.g., UserRole("CUSTOMER") -> UserRole.CUSTOMER)
        if isinstance(value, str):
            value = value.lower()
            for member in cls:
                if member.value == value:
                    return member
        return None


class User(db.Model):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Instruct SQLAlchemy to send lowercase enum values ("customer") to PostgreSQL
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
        # Gracefully handle string-to-Enum conversion upon initialization
        if 'role' in kwargs and isinstance(kwargs['role'], str):
            kwargs['role'] = UserRole(kwargs['role'])
        super(User, self).__init__(**kwargs)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def get_full_name(self):
        return self.full_name
    
    def is_provider(self):
        return self.role == UserRole.PROVIDER or self.is_verified_provider
    
    def can_delete_account(self):
        from app.models.job import Job, JobStatus
        from app.models.violation import Violation
        from datetime import timedelta
        
        # Check for active jobs
        active_jobs = Job.query.filter(
            (Job.customer_id == self.id) | (Job.provider_id == self.id),
            Job.status.in_([JobStatus.ASSIGNED, JobStatus.IN_PROGRESS])
        ).count()
        
        if active_jobs > 0:
            return False, "You have active jobs. Complete them first."
        
        # Check for recent violations (last 90 days)
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=90)
        recent_violations = Violation.query.filter(
            Violation.user_id == self.id,
            Violation.status == 'confirmed',
            Violation.created_at > cutoff_date
        ).count()
        
        if recent_violations > 0:
            return False, f"You have {recent_violations} recent violations."
        
        return True, "Account eligible for deletion"
    
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