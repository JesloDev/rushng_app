from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from datetime import datetime
import uuid

from app.core.database import db


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Details
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)
    notification_metadata = Column(JSONB, default={})  # RENAMED from 'metadata'
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    
    # Delivery
    delivered_via = Column(ARRAY(String), default=[])
    delivered_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='notifications')
    
    def __repr__(self):
        return f'<Notification {self.title} - {self.type}>'
    
    def mark_as_read(self):
        self.is_read = True
        self.read_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'notification_metadata': self.notification_metadata,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }