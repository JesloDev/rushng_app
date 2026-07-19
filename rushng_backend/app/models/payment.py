from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from datetime import datetime
import uuid
import enum

from app.core.database import db


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    HELD = "held"
    RELEASED = "released"
    REFUNDED = "refunded"
    FAILED = "failed"
    DISPUTED = "disputed"


class PaymentProvider(str, enum.Enum):
    OPAY = "opay"
    PAYSTACK = "paystack"
    FLUTTERWAVE = "flutterwave"


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Amounts
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)  # RUSHNG commission
    provider_earnings = Column(Float, nullable=False)
    
    # Provider
    provider = Column(Enum(PaymentProvider), nullable=False)
    reference = Column(String(255), unique=True, nullable=False)
    
    # Status
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Metadata
    metadata = Column(JSONB, default={})
    
    # Timestamps
    held_at = Column(DateTime)
    released_at = Column(DateTime)
    refunded_at = Column(DateTime)
    failed_at = Column(DateTime)
    failure_reason = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = db.relationship('Job', back_populates='payment')
    customer = db.relationship('User', foreign_keys=[customer_id])
    provider_user = db.relationship('User', foreign_keys=[provider_id])
    
    def __repr__(self):
        return f'<Payment {self.reference} - {self.status}>'
    
    def hold(self):
        """Hold payment in escrow"""
        if self.status != PaymentStatus.PENDING:
            raise ValueError(f"Cannot hold payment in {self.status} status")
        self.status = PaymentStatus.HELD
        self.held_at = datetime.utcnow()
    
    def release(self):
        """Release payment to provider"""
        if self.status not in [PaymentStatus.HELD, PaymentStatus.PENDING]:
            raise ValueError(f"Cannot release payment in {self.status} status")
        self.status = PaymentStatus.RELEASED
        self.released_at = datetime.utcnow()
    
    def refund(self):
        """Refund payment to customer"""
        if self.status not in [PaymentStatus.HELD, PaymentStatus.PENDING]:
            raise ValueError(f"Cannot refund payment in {self.status} status")
        self.status = PaymentStatus.REFUNDED
        self.refunded_at = datetime.utcnow()
    
    def fail(self, reason):
        """Mark payment as failed"""
        self.status = PaymentStatus.FAILED
        self.failed_at = datetime.utcnow()
        self.failure_reason = reason
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'job_id': str(self.job_id),
            'amount': self.amount,
            'platform_fee': self.platform_fee,
            'provider_earnings': self.provider_earnings,
            'provider': self.provider.value if self.provider else None,
            'reference': self.reference,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }