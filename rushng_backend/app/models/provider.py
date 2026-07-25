from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime, timezone
import uuid
from geoalchemy2 import Geography

from app.core.database import db


class Provider(db.Model):
    __tablename__ = 'providers'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    slug = Column(String(255), unique=True)
    
    # Skills & Experience
    skills = Column(ARRAY(String), default=list)
    years_experience = Column(Integer, default=0)
    certifications = Column(JSONB, default=list)
    
    # Pricing
    hourly_rate = Column(Float)
    service_radius_km = Column(Integer, default=10)
    
    # Location
    location = Column(Geography('POINT', srid=4326))
    
    # Availability
    availability = Column(JSONB, default=dict)
    
    # Verification
    verification_level = Column(String(50), default='basic')
    verification_documents = Column(JSONB, default=list)
    
    # Portfolio
    portfolio_urls = Column(ARRAY(String), default=list)
    
    # Store Branding
    store_theme = Column(String(50), default='orange')
    store_cover_color = Column(String(50), default='#f97316')
    store_views = Column(Integer, default=0)
    
    # Status
    is_available = Column(Boolean, default=True)
    is_on_duty = Column(Boolean, default=False)
    
    # Ratings & Stats
    rating = Column(Float, default=0.0)
    total_jobs_completed = Column(Integer, default=0)
    total_jobs_cancelled = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    total_revenue = Column(Float, default=0.0)
    
    # Compliance
    compliance_score = Column(Integer, default=100)
    
    # Plan
    plan = Column(String(50), default='free')
    
    # Timestamps (Aligned timezone aware)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )
    
    # Relationships
    user = db.relationship('User', back_populates='provider')
    analytics = db.relationship('MerchantAnalytics', back_populates='provider', cascade='all, delete-orphan', lazy='dynamic')
    
    def __repr__(self):
        return f'<Provider {self.user.full_name if self.user else "Unknown"}>'
    
    def add_skill(self, skill):
        if self.skills is None:
            self.skills = []
        if skill not in self.skills:
            self.skills.append(skill)
            flag_modified(self, "skills")
    
    def remove_skill(self, skill):
        if self.skills and skill in self.skills:
            self.skills.remove(skill)
            flag_modified(self, "skills")
    
    def has_skill(self, skill):
        return skill in (self.skills or [])
    
    def has_any_skill(self, required_skills):
        return any(skill in (self.skills or []) for skill in required_skills)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'slug': self.slug,
            'skills': self.skills or [],
            'years_experience': self.years_experience,
            'hourly_rate': self.hourly_rate,
            'service_radius_km': self.service_radius_km,
            'verification_level': self.verification_level,
            'is_available': self.is_available,
            'rating': self.rating,
            'total_jobs_completed': self.total_jobs_completed,
            'total_jobs_cancelled': self.total_jobs_cancelled,
            'compliance_score': self.compliance_score,
            'portfolio_urls': self.portfolio_urls or [],
            'store_theme': self.store_theme,
            'store_cover_color': self.store_cover_color,
            'store_views': self.store_views,
            'plan': self.plan,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }