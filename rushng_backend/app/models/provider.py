from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
from geoalchemy2 import Geography

from app.core.database import db


class Provider(db.Model):
    __tablename__ = 'providers'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Skills & Experience
    skills = Column(ARRAY(String), default=[])  # e.g., ['plumbing', 'electrical']
    years_experience = Column(Integer, default=0)
    certifications = Column(JSONB, default=[])
    
    # Pricing
    hourly_rate = Column(Float)
    service_radius_km = Column(Integer, default=10)
    
    # Location
    location = Column(Geography('POINT', srid=4326))
    
    # Availability
    availability = Column(JSONB, default={'days': [], 'hours': []})
    
    # Verification
    verification_level = Column(String(50), default='basic')  # basic, verified, certified
    verification_documents = Column(JSONB, default=[])
    
    # Portfolio
    portfolio_urls = Column(ARRAY(String), default=[])
    
    # Status
    is_available = Column(Boolean, default=True)
    is_on_duty = Column(Boolean, default=False)  # Currently working on a job
    
    # Ratings & Stats
    rating = Column(Float, default=0.0)
    total_jobs_completed = Column(Integer, default=0)
    total_jobs_cancelled = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    
    # Compliance
    compliance_score = Column(Integer, default=100)  # 0-100
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='provider')
    
    def __repr__(self):
        return f'<Provider {self.user.full_name if self.user else "Unknown"}>'
    
    def add_skill(self, skill):
        if skill not in self.skills:
            self.skills.append(skill)
    
    def remove_skill(self, skill):
        if skill in self.skills:
            self.skills.remove(skill)
    
    def has_skill(self, skill):
        return skill in self.skills
    
    def has_any_skill(self, required_skills):
        return any(skill in self.skills for skill in required_skills)
    
    def update_rating(self):
        from app.models.rating import Rating
        ratings = Rating.query.filter_by(target_id=self.user_id, target_type='provider').all()
        if ratings:
            self.rating = sum(r.rating for r in ratings) / len(ratings)
        else:
            self.rating = 0.0
    
    def update_compliance_score(self):
        from app.models.violation import Violation
        # Start with 100 points
        score = 100
        
        # Deduct points based on violations
        violations = Violation.query.filter_by(user_id=self.user_id, status='confirmed').all()
        for violation in violations:
            if violation.severity == 'minor':
                score -= 5
            elif violation.severity == 'major':
                score -= 15
            elif violation.severity == 'critical':
                score -= 30
        
        # Ensure score doesn't go below 0
        self.compliance_score = max(0, score)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'skills': self.skills,
            'years_experience': self.years_experience,
            'hourly_rate': self.hourly_rate,
            'service_radius_km': self.service_radius_km,
            'verification_level': self.verification_level,
            'is_available': self.is_available,
            'rating': self.rating,
            'total_jobs_completed': self.total_jobs_completed,
            'total_jobs_cancelled': self.total_jobs_cancelled,
            'compliance_score': self.compliance_score,
            'portfolio_urls': self.portfolio_urls,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }