from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from datetime import datetime
import uuid

from app.core.database import db


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    # Action details
    action = Column(String(255), nullable=False)
    resource = Column(String(100), nullable=False)
    resource_id = Column(String(36))
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    method = Column(String(10))
    
    # Data
    changes = Column(JSONB, default={})
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<AuditLog {self.action} - {self.resource}>'
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'action': self.action,
            'resource': self.resource,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'changes': self.changes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }