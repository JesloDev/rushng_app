from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from datetime import datetime
import uuid
import enum
from geoalchemy2 import Geography

from app.core.database import db


class JobStatus(str, enum.Enum):
    POSTED = "posted"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class JobCategory(str, enum.Enum):
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    CARPENTRY = "carpentry"
    PAINTING = "painting"
    TILING = "tiling"
    MASONRY = "masonry"
    WELDING = "welding"
    CLEANING = "cleaning"
    LAUNDRY = "laundry"
    SHOPPING = "shopping"
    ERRANDS = "errands"
    REPAIR = "repair"
    MAINTENANCE = "maintenance"
    INSTALLATION = "installation"
    OTHER = "other"


class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    # Job Details
    category = Column(Enum(JobCategory), nullable=False)
    subcategory = Column(String(100))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Location
    location = Column(Geography('POINT', srid=4326), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100))
    state = Column(String(100))
    
    # Status
    status = Column(Enum(JobStatus), default=JobStatus.POSTED)
    
    # Pricing
    estimated_price = Column(Float)
    final_price = Column(Float)
    service_fee = Column(Float)
    
    # Schedule
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    
    # Check-in/out
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime)
    check_in_photo = Column(String(500))
    check_out_photo = Column(String(500))
    check_in_otp_hash = Column(String(255))
    check_out_otp_hash = Column(String(255))
    check_in_location = Column(Geography('POINT', srid=4326))
    check_out_location = Column(Geography('POINT', srid=4326))
    
    # Tracking
    tracking_code = Column(String(50), unique=True)
    
    # Metadata
    cancelled_at = Column(DateTime)
    cancellation_reason = Column(Text)
    completed_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = db.relationship('User', foreign_keys=[customer_id], back_populates='jobs_as_customer')
    provider_assigned = db.relationship('User', foreign_keys=[provider_id], back_populates='jobs_as_provider')
    
    # Payment relationship - fixed
    payments = db.relationship('Payment', back_populates='job', cascade='all, delete-orphan', lazy='dynamic')
    
    # Ratings relationship
    ratings = db.relationship('Rating', back_populates='job', cascade='all, delete-orphan', lazy='dynamic')
    
    # Violations relationship
    violations = db.relationship('Violation', back_populates='job', lazy='dynamic')
    
    def __repr__(self):
        return f'<Job {self.title} - {self.status}>'
    
    def can_apply(self, provider):
        """Check if a provider can apply to this job"""
        if self.status != JobStatus.POSTED:
            return False, "This job is no longer accepting applications"
        if self.provider_id:
            return False, "This job already has a provider assigned"
        if provider.id == self.customer_id:
            return False, "You cannot apply to your own job"
        if not provider.is_verified_provider:
            return False, "You must be a verified provider to apply"
        return True, "You can apply to this job"
    
    def can_assign(self, provider):
        """Check if a provider can be assigned to this job"""
        if self.status != JobStatus.POSTED:
            return False, "This job is no longer accepting applications"
        if self.provider_id:
            return False, "This job already has a provider assigned"
        return True, "Provider can be assigned"
    
    def can_check_in(self, user_id):
        """Check if user can check in to this job"""
        if self.status != JobStatus.ASSIGNED:
            return False, "Job must be assigned before check-in"
        if str(self.provider_id) != str(user_id):
            return False, "Only the assigned provider can check in"
        if self.check_in_time:
            return False, "Already checked in"
        return True, "Provider can check in"
    
    def can_check_out(self, user_id):
        """Check if user can check out of this job"""
        if self.status != JobStatus.IN_PROGRESS:
            return False, "Job must be in progress before check-out"
        if str(self.provider_id) != str(user_id):
            return False, "Only the assigned provider can check out"
        if not self.check_in_time:
            return False, "Must check in first"
        if self.check_out_time:
            return False, "Already checked out"
        return True, "Provider can check out"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'customer_id': str(self.customer_id),
            'provider_id': str(self.provider_id) if self.provider_id else None,
            'category': self.category.value if self.category else None,
            'title': self.title,
            'description': self.description,
            'address': self.address,
            'status': self.status.value if self.status else None,
            'estimated_price': self.estimated_price,
            'final_price': self.final_price,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }