from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from datetime import datetime
import uuid

from app.core.database import db


class AdvertisingPlan(db.Model):
    __tablename__ = 'advertising_plans'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    price = Column(Float, nullable=False)
    duration = Column(Integer, nullable=False)  # Days
    features = Column(JSONB, nullable=False)
    is_popular = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<AdvertisingPlan {self.name} - ₦{self.price}>'