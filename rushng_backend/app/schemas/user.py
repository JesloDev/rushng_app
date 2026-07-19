from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class UserUpdateSchema(Schema):
    """Schema for updating user profile"""
    full_name = fields.String(validate=validate.Length(min=2, max=100))
    email = fields.Email()
    phone = fields.String()
    address = fields.String()
    city = fields.String()
    state = fields.String()
    country = fields.String()
    profile_picture = fields.URL()

    @validates('phone')
    def validate_phone(self, value):
        """Validate Nigerian phone number"""
        phone = re.sub(r'[\s\-\(\)]', '', value)
        if not re.match(r'^(\+234|0)[789][01]\d{8}$', phone):
            raise ValidationError('Invalid phone number. Must be a valid Nigerian number.')
        return phone


class UserDeleteSchema(Schema):
    """Schema for account deletion"""
    confirm = fields.Boolean(required=True)
    reason = fields.String()


class UserResponseSchema(Schema):
    """Schema for user response"""
    id = fields.String()
    email = fields.Email()
    phone = fields.String()
    full_name = fields.String()
    role = fields.String()
    is_verified = fields.Boolean()
    is_active = fields.Boolean()
    profile_picture = fields.String()
    created_at = fields.DateTime()
    
    # Optional sensitive fields
    nin = fields.String(allow_none=True)
    bvn = fields.String(allow_none=True)
    address = fields.String(allow_none=True)
    city = fields.String(allow_none=True)
    state = fields.String(allow_none=True)
    is_verified_provider = fields.Boolean()
    verification_status = fields.String()