from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
import uuid

from app.core.database import db


class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    rater_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Rating
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    categories = Column(JSONB, default={})
    
    # Target type
    target_type = Column(String(50), nullable=False)  # 'customer' or 'provider'
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = db.relationship('Job', back_populates='ratings')
    rater = db.relationship('User', foreign_keys=[rater_id], back_populates='ratings_given')
    target = db.relationship('User', foreign_keys=[target_id], back_populates='ratings_received')
    
    def __repr__(self):
        return f'<Rating {self.rating} - {self.target_type}>'
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'job_id': str(self.job_id),
            'rater_id': str(self.rater_id),
            'target_id': str(self.target_id),
            'rating': self.rating,
            'comment': self.comment,
            'categories': self.categories,
            'target_type': self.target_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }