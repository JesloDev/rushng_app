from marshmallow import Schema, fields, validate, validates, ValidationError

class PaymentInitSchema(Schema):
    """Schema for payment initialization"""
    job_id = fields.String(required=True)
    provider = fields.String(validate=validate.OneOf(['opay', 'paystack', 'flutterwave']), missing='opay')


class PaymentVerifySchema(Schema):
    """Schema for payment verification"""
    reference = fields.String(required=True)
    transaction_ref = fields.String()


class PaymentWebhookSchema(Schema):
    """Schema for payment webhook"""
    event = fields.String(required=True)
    data = fields.Dict(required=True)
    reference = fields.String()