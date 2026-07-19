from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.job import JobCategory

class JobCreateSchema(Schema):
    """Schema for creating a job"""
    category = fields.String(required=True)
    subcategory = fields.String()
    title = fields.String(required=True, validate=validate.Length(min=5, max=255))
    description = fields.String(required=True, validate=validate.Length(min=20))
    address = fields.String(required=True)
    lat = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    lng = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    city = fields.String()
    state = fields.String()
    estimated_price = fields.Float(validate=validate.Range(min=0))
    start_time = fields.DateTime()
    end_time = fields.DateTime()

    @validates('category')
    def validate_category(self, value):
        """Validate job category"""
        valid_categories = [c.value for c in JobCategory]
        if value not in valid_categories:
            raise ValidationError(f'Invalid category. Valid: {", ".join(valid_categories)}')
        return value

    @validates('estimated_price')
    def validate_price(self, value):
        if value is not None and value < 0:
            raise ValidationError('Price cannot be negative.')
        return value


class JobUpdateSchema(Schema):
    """Schema for updating a job"""
    title = fields.String(validate=validate.Length(min=5, max=255))
    description = fields.String(validate=validate.Length(min=20))
    address = fields.String()
    lat = fields.Float(validate=validate.Range(min=-90, max=90))
    lng = fields.Float(validate=validate.Range(min=-180, max=180))
    estimated_price = fields.Float(validate=validate.Range(min=0))
    start_time = fields.DateTime()
    end_time = fields.DateTime()


class JobApplySchema(Schema):
    """Schema for applying to a job"""
    quote = fields.Float(validate=validate.Range(min=0))
    availability = fields.String()


class CheckInSchema(Schema):
    """Schema for job check-in"""
    lat = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    lng = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    photo = fields.String(required=True)  # Base64 image
    otp = fields.String(required=True, validate=validate.Length(min=6, max=6))

    @validates('photo')
    def validate_photo(self, value):
        """Validate photo data"""
        if not value or len(value) < 100:
            raise ValidationError('Invalid photo data. Please provide a valid image.')
        return value


class CheckOutSchema(Schema):
    """Schema for job check-out"""
    lat = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    lng = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    photo = fields.String(required=True)  # Base64 image
    otp = fields.String(required=True, validate=validate.Length(min=6, max=6))

    @validates('photo')
    def validate_photo(self, value):
        if not value or len(value) < 100:
            raise ValidationError('Invalid photo data. Please provide a valid image.')
        return value


class JobConfirmSchema(Schema):
    """Schema for job completion confirmation"""
    final_price = fields.Float(validate=validate.Range(min=0))
    satisfaction_rating = fields.Integer(validate=validate.Range(min=1, max=5))