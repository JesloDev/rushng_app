from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum
from datetime import datetime
import uuid
import enum

from app.core.database import db


class ViolationType(str, enum.Enum):
    NO_SHOW = "no_show"
    POOR_QUALITY = "poor_quality"
    THEFT = "theft"
    DAMAGE = "damage"
    HARASSMENT = "harassment"
    FRAUD = "fraud"
    LATE_ARRIVAL = "late_arrival"
    INCOMPLETE_WORK = "incomplete_work"
    BAD_COMMUNICATION = "bad_communication"
    CANCELLATION = "cancellation"
    OTHER = "other"


class ViolationSeverity(str, enum.Enum):
    MINOR = "minor"
    MAJOR = "major"
    CRITICAL = "critical"


class ViolationStatus(str, enum.Enum):
    PENDING_REVIEW = "pending_review"
    CONFIRMED = "confirmed"
    DISMISSED = "dismissed"
    APPEALED = "appealed"
    RESOLVED = "resolved"


class PenaltyType(str, enum.Enum):
    WARNING = "warning"
    SUSPENSION = "suspension"
    BAN = "ban"
    FINE = "fine"


class Violation(db.Model):
    __tablename__ = 'violations'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=True)
    reported_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    # Type & Severity
    type = Column(Enum(ViolationType), nullable=False)
    severity = Column(Enum(ViolationSeverity), default=ViolationSeverity.MINOR)
    
    # Details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSONB, default=[])
    
    # Status
    status = Column(Enum(ViolationStatus), default=ViolationStatus.PENDING_REVIEW)
    
    # Review
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    reviewed_at = Column(DateTime)
    resolution = Column(Text)
    
    # Penalty
    penalty_type = Column(Enum(PenaltyType))
    penalty_details = Column(JSONB, default={})
    points_deducted = Column(Integer, default=0)
    
    # Appeal
    appeal_status = Column(String(50))
    appeal_reason = Column(Text)
    appeal_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], back_populates='violations_received')
    reporter = db.relationship('User', foreign_keys=[reported_by], back_populates='violations_reported')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])
    job = db.relationship('Job')
    
    def __repr__(self):
        return f'<Violation {self.type} - {self.status}>'
    
    def confirm(self, reviewer_id, points=0):
        self.status = ViolationStatus.CONFIRMED
        self.reviewed_by = reviewer_id
        self.reviewed_at = datetime.utcnow()
        self.points_deducted = points
        
        if self.severity == ViolationSeverity.MINOR:
            self.penalty_type = PenaltyType.WARNING
            self.penalty_details = {'duration_days': 7}
        elif self.severity == ViolationSeverity.MAJOR:
            self.penalty_type = PenaltyType.SUSPENSION
            self.penalty_details = {'duration_days': 30}
        elif self.severity == ViolationSeverity.CRITICAL:
            self.penalty_type = PenaltyType.BAN
            self.penalty_details = {'permanent': True}
    
    def dismiss(self, reviewer_id, reason):
        self.status = ViolationStatus.DISMISSED
        self.reviewed_by = reviewer_id
        self.reviewed_at = datetime.utcnow()
        self.resolution = reason
    
    def appeal(self, reason):
        self.status = ViolationStatus.APPEALED
        self.appeal_reason = reason
        self.appeal_at = datetime.utcnow()
    
    def resolve(self, resolution):
        self.status = ViolationStatus.RESOLVED
        self.resolution = resolution
    
    def get_points(self):
        if self.severity == ViolationSeverity.MINOR:
            return 3
        elif self.severity == ViolationSeverity.MAJOR:
            return 7
        elif self.severity == ViolationSeverity.CRITICAL:
            return 15
        return 0
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'job_id': str(self.job_id) if self.job_id else None,
            'type': self.type.value if self.type else None,
            'severity': self.severity.value if self.severity else None,
            'title': self.title,
            'description': self.description,
            'status': self.status.value if self.status else None,
            'penalty_type': self.penalty_type.value if self.penalty_type else None,
            'points_deducted': self.points_deducted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }