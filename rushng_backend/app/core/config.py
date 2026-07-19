import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY')
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_POOL_SIZE = 50
    SQLALCHEMY_MAX_OVERFLOW = 100
    SQLALCHEMY_POOL_TIMEOUT = 30
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 2592000))
    )
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
    
    # Rate Limiting
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '100 per minute')
    RATELIMIT_AUTH = os.getenv('RATELIMIT_AUTH', '5 per minute')
    RATELIMIT_JOB_POST = os.getenv('RATELIMIT_JOB_POST', '20 per hour')
    
    # Payments
    OPAY_API_KEY = os.getenv('OPAY_API_KEY')
    OPAY_API_SECRET = os.getenv('OPAY_API_SECRET')
    OPAY_BASE_URL = os.getenv('OPAY_BASE_URL', 'https://api.opay.com/v1')
    
    PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')
    PAYSTACK_PUBLIC_KEY = os.getenv('PAYSTACK_PUBLIC_KEY')
    
    FLUTTERWAVE_SECRET_KEY = os.getenv('FLUTTERWAVE_SECRET_KEY')
    FLUTTERWAVE_PUBLIC_KEY = os.getenv('FLUTTERWAVE_PUBLIC_KEY')
    FLUTTERWAVE_BASE_URL = os.getenv('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com/v3')
    
    # Notifications
    BREVO_API_KEY = os.getenv('BREVO_API_KEY')
    BREVO_SMS_SENDER = os.getenv('BREVO_SMS_SENDER', 'RUSHNG')
    BREVO_EMAIL_FROM = os.getenv('BREVO_EMAIL_FROM', 'noreply@rushng.com')
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Sentry
    SENTRY_DSN = os.getenv('SENTRY_DSN')
    
    # Security
    TALISMAN_ENABLED = os.getenv('TALISMAN_ENABLED', 'True').lower() == 'true'
    BCRYPT_LOG_ROUNDS = int(os.getenv('BCRYPT_LOG_ROUNDS', 12))
    
    # Account Deletion
    ACCOUNT_DELETION_COOLDOWN_DAYS = int(os.getenv('ACCOUNT_DELETION_COOLDOWN_DAYS', 7))
    VIOLATION_EXPIRY_DAYS = int(os.getenv('VIOLATION_EXPIRY_DAYS', 90))


class DevelopmentConfig(Config):
    DEBUG = True
    ENVIRONMENT = 'development'
    TALISMAN_ENABLED = False


class ProductionConfig(Config):
    DEBUG = False
    ENVIRONMENT = 'production'
    TALISMAN_ENABLED = True


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    ENVIRONMENT = 'testing'
    TALISMAN_ENABLED = False
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'postgresql://rushng_user:rushng@localhost:5432/rushng_test')


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}