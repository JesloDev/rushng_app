from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class RegisterSchema(Schema):
    """Schema for user registration"""
    email = fields.Email(required=True, error_messages={'required': 'Email is required'})
    phone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    password = fields.String(required=True, validate=validate.Length(min=8))
    full_name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    role = fields.String(validate=validate.OneOf(['customer', 'provider']), missing='customer')
    skills = fields.List(fields.String(), missing=[])
    years_experience = fields.Integer(missing=0, validate=validate.Range(min=0))
    hourly_rate = fields.Float(missing=None, validate=validate.Range(min=0))

    @validates('phone')
    def validate_phone(self, value):
        """Validate Nigerian phone number"""
        # Remove any spaces or special characters
        phone = re.sub(r'[\s\-\(\)]', '', value)
        
        # Check if it's a valid Nigerian number
        if not re.match(r'^(\+234|0)[789][01]\d{8}$', phone):
            raise ValidationError('Invalid phone number. Must be a valid Nigerian number.')
        return phone

    @validates('password')
    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise ValidationError('Password must be at least 8 characters long.')
        if not re.search(r'[A-Za-z]', value):
            raise ValidationError('Password must contain at least one letter.')
        if not re.search(r'\d', value):
            raise ValidationError('Password must contain at least one number.')
        return value


class LoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True)
    password = fields.String(required=True)


class VerifySchema(Schema):
    """Schema for account verification"""
    email = fields.Email(required=True)
    code = fields.String(required=True, validate=validate.Length(min=6, max=6))


class ForgotPasswordSchema(Schema):
    """Schema for forgot password"""
    email = fields.Email(required=True)


class ResetPasswordSchema(Schema):
    """Schema for password reset"""
    token = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate.Length(min=8))

    @validates('new_password')
    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise ValidationError('Password must be at least 8 characters long.')
        if not re.search(r'[A-Za-z]', value):
            raise ValidationError('Password must contain at least one letter.')
        if not re.search(r'\d', value):
            raise ValidationError('Password must contain at least one number.')
        return value


class RefreshTokenSchema(Schema):
    """Schema for token refresh"""
    refresh_token = fields.String(required=True)