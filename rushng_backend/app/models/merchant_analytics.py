from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from datetime import datetime
import uuid

from app.core.database import db


class MerchantAnalytics(db.Model):
    __tablename__ = 'merchant_analytics'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey('providers.id'), nullable=False)
    date = Column(Date, nullable=False)
    views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    orders_placed = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    provider = db.relationship('Provider', back_populates='analytics')
    
    def __repr__(self):
        return f'<MerchantAnalytics {self.provider_id} - {self.date}>'
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'provider_id': str(self.provider_id),
            'date': self.date.isoformat() if self.date else None,
            'views': self.views,
            'unique_visitors': self.unique_visitors,
            'orders_placed': self.orders_placed,
            'revenue': self.revenue,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }