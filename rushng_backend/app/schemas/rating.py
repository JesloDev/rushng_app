from marshmallow import Schema, fields, validate, validates, ValidationError

class RatingCreateSchema(Schema):
    """Schema for creating a rating"""
    job_id = fields.String(required=True)
    target_id = fields.String(required=True)
    rating = fields.Integer(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.String(allow_none=True)
    categories = fields.Dict(keys=fields.String(), values=fields.Integer())

    @validates('categories')
    def validate_categories(self, value):
        if value:
            for val in value.values():
                if not isinstance(val, int) or val < 1 or val > 5:
                    raise ValidationError('Category ratings must be integers between 1 and 5.')
        return value