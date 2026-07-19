from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.violation import ViolationType

class ViolationReportSchema(Schema):
    """Schema for reporting a violation"""
    user_id = fields.String(required=True)
    job_id = fields.String()
    type = fields.String(required=True)
    title = fields.String(required=True, validate=validate.Length(min=3, max=255))
    description = fields.String(required=True, validate=validate.Length(min=10))
    evidence = fields.List(fields.URL(), missing=[])

    @validates('type')
    def validate_type(self, value):
        valid_types = [t.value for t in ViolationType]
        if value not in valid_types:
            raise ValidationError(f'Invalid violation type. Valid: {", ".join(valid_types)}')
        return value


class ViolationReviewSchema(Schema):
    """Schema for admin review of violation"""
    action = fields.String(required=True, validate=validate.OneOf(['confirm', 'dismiss']))
    points = fields.Integer(validate=validate.Range(min=0))
    reason = fields.String()


class ViolationAppealSchema(Schema):
    """Schema for appealing a violation"""
    reason = fields.String(required=True, validate=validate.Length(min=10))