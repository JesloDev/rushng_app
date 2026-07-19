from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class ProviderRegisterSchema(Schema):
    """Schema for provider registration"""
    skills = fields.List(fields.String(), required=True)
    years_experience = fields.Integer(validate=validate.Range(min=0))
    hourly_rate = fields.Float(validate=validate.Range(min=0))
    service_radius_km = fields.Integer(validate=validate.Range(min=1, max=100), missing=10)
    nin = fields.String(allow_none=True)
    bvn = fields.String(allow_none=True)
    portfolio_urls = fields.List(fields.URL(), missing=[])

    @validates('nin')
    def validate_nin(self, value):
        """Validate NIN format"""
        if value and not re.match(r'^[0-9]{11}$', value):
            raise ValidationError('NIN must be 11 digits.')
        return value

    @validates('bvn')
    def validate_bvn(self, value):
        """Validate BVN format"""
        if value and not re.match(r'^[0-9]{11}$', value):
            raise ValidationError('BVN must be 11 digits.')
        return value


class ProviderUpdateSchema(Schema):
    """Schema for updating provider profile"""
    skills = fields.List(fields.String())
    years_experience = fields.Integer(validate=validate.Range(min=0))
    hourly_rate = fields.Float(validate=validate.Range(min=0))
    service_radius_km = fields.Integer(validate=validate.Range(min=1, max=100))
    is_available = fields.Boolean()
    portfolio_urls = fields.List(fields.URL())


class ProviderVerificationSchema(Schema):
    """Schema for provider verification"""
    nin = fields.String(required=True)
    bvn = fields.String(required=True)
    documents = fields.List(fields.Dict(), required=True)

    @validates('nin')
    def validate_nin(self, value):
        if not re.match(r'^[0-9]{11}$', value):
            raise ValidationError('NIN must be 11 digits.')
        return value

    @validates('bvn')
    def validate_bvn(self, value):
        if not re.match(r'^[0-9]{11}$', value):
            raise ValidationError('BVN must be 11 digits.')
        return value


class ProviderAvailabilitySchema(Schema):
    """Schema for provider availability"""
    is_available = fields.Boolean()
    availability = fields.Dict(keys=fields.String(), values=fields.List(fields.String()))