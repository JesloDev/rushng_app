import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://rushng:rushng@localhost:5432/rushng_dev')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_POOL_SIZE = 50
    SQLALCHEMY_MAX_OVERFLOW = 100
    SQLALCHEMY_POOL_TIMEOUT = 30
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    
    # Rate Limiting (Flask-Limiter uses RATELIMIT_STORAGE_URI)
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '1000 per minute')
    RATELIMIT_AUTH = os.getenv('RATELIMIT_AUTH', '100 per minute')
    RATELIMIT_JOB_POST = os.getenv('RATELIMIT_JOB_POST', '100 per hour')
    RATELIMIT_STORAGE_URI = os.getenv('REDIS_URL', 'memory://')
    RATELIMIT_STORAGE_URL = RATELIMIT_STORAGE_URI
    
    # Sentry
    SENTRY_DSN = os.getenv('SENTRY_DSN', '')
    
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
    
    # Security
    TALISMAN_ENABLED = os.getenv('TALISMAN_ENABLED', 'False').lower() == 'true'
    BCRYPT_LOG_ROUNDS = int(os.getenv('BCRYPT_LOG_ROUNDS', 12))
    
    # Account Deletion
    ACCOUNT_DELETION_COOLDOWN_DAYS = int(os.getenv('ACCOUNT_DELETION_COOLDOWN_DAYS', 7))
    VIOLATION_EXPIRY_DAYS = int(os.getenv('VIOLATION_EXPIRY_DAYS', 90))


class DevelopmentConfig(Config):
    DEBUG = True
    ENVIRONMENT = 'development'
    TALISMAN_ENABLED = False
    RATELIMIT_STORAGE_URI = 'memory://'
    RATELIMIT_STORAGE_URL = 'memory://'
    SENTRY_DSN = ''


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:rushtest@127.0.0.1:5432/rushng_test_db'
    RATELIMIT_STORAGE_URI = 'memory://'
    RATELIMIT_STORAGE_URL = 'memory://'


class ProductionConfig(Config):
    DEBUG = False
    ENVIRONMENT = 'production'
    TALISMAN_ENABLED = True
    RATELIMIT_STORAGE_URI = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    RATELIMIT_STORAGE_URL = RATELIMIT_STORAGE_URI


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}