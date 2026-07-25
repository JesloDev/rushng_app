"""
RUSHNG Backend - Flask Application Factory
"""

import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_bcrypt import Bcrypt
from flask_talisman import Talisman
from flask_compress import Compress
from sqlalchemy import text

from app.core.config import config
from app.core.database import db
from app.core.logging import setup_logging

# Initialize extensions
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
limiter = Limiter(key_func=get_remote_address)
talisman = Talisman()
compress = Compress()
cors = CORS()


def create_app(config_name=None):
    """Application factory"""
    application = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    # Fallback if config_name isn't in dictionary
    if config_name not in config:
        config_name = 'default'
        
    application.config.from_object(config[config_name])
    
    # Ensure Flask-Limiter finds the expected URI config key
    if "RATELIMIT_STORAGE_URI" not in application.config:
        application.config["RATELIMIT_STORAGE_URI"] = application.config.get(
            "RATELIMIT_STORAGE_URL", "memory://"
        )
    
    # Setup logging
    setup_logging(application)
    
    # 1. Initialize DB & Migrations
    db.init_app(application)
    migrate.init_app(application, db)
    
    # 2. Auth & Security
    bcrypt.init_app(application)
    jwt.init_app(application)
    
    # 3. Rate Limiting (Flask-Limiter reads RATELIMIT_STORAGE_URI from application.config)
    limiter.init_app(application)
    
    # 4. Security Headers (Only enforce when TALISMAN_ENABLED is True)
    if application.config.get('TALISMAN_ENABLED', False):
        talisman.init_app(
            application,
            content_security_policy=None,  # Allow REST API responses without strict HTML CSP
            force_https=True
        )
        
    # 5. Compression & CORS
    compress.init_app(application)
    cors.init_app(
        application, 
        origins=application.config.get('CORS_ORIGINS', ['*']),
        supports_credentials=True
    )
    
    # Register models so Alembic/Flask-Migrate detects metadata changes
    try:
        import app.models
    except ImportError as e:
        application.logger.error(f"Failed to load database models: {e}")
        raise

    # Sentry (only if configured)
    sentry_dsn = application.config.get('SENTRY_DSN')
    if sentry_dsn:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.flask import FlaskIntegration
            sentry_sdk.init(
                dsn=sentry_dsn,
                integrations=[FlaskIntegration()],
                environment=application.config.get('ENVIRONMENT', 'development')
            )
            application.logger.info("Sentry initialized")
        except ImportError:
            application.logger.warning("Sentry SDK not installed, skipping")
        except Exception as e:
            application.logger.warning(f"Failed to initialize Sentry: {e}")
    
    # Register blueprints
    try:
        from app.api.auth import auth_bp
        from app.api.users import users_bp
        from app.api.providers import providers_bp
        from app.api.jobs import jobs_bp
        from app.api.payments import payments_bp
        from app.api.violations import violations_bp
        from app.api.ratings import ratings_bp
        from app.api.notifications import notifications_bp
        from app.api.admin import admin_bp
        
        application.register_blueprint(auth_bp, url_prefix='/api/auth')
        application.register_blueprint(users_bp, url_prefix='/api/users')
        application.register_blueprint(providers_bp, url_prefix='/api/providers')
        application.register_blueprint(jobs_bp, url_prefix='/api/jobs')
        application.register_blueprint(payments_bp, url_prefix='/api/payments')
        application.register_blueprint(violations_bp, url_prefix='/api/violations')
        application.register_blueprint(ratings_bp, url_prefix='/api/ratings')
        application.register_blueprint(notifications_bp, url_prefix='/api/notifications')
        application.register_blueprint(admin_bp, url_prefix='/api/admin')
    except ImportError as e:
        application.logger.error(f"Failed to register blueprints: {e}")
        raise
    
    # Health check
    @application.route('/api/health')
    def health_check():
        try:
            db.session.execute(text('SELECT 1'))
            db_status = 'healthy'
        except Exception as e:
            db_status = f'unhealthy: {str(e)}'
        
        return jsonify({
            'status': 'healthy' if db_status == 'healthy' else 'degraded',
            'database': db_status,
            'environment': application.config.get('ENVIRONMENT', 'unknown')
        })
    
    # Root endpoint
    @application.route('/')
    def root():
        return jsonify({
            'name': 'RUSHNG API',
            'version': '1.0.0',
            'status': 'running',
            'environment': application.config.get('ENVIRONMENT', 'unknown')
        })
    
    # Error handlers
    @application.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @application.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({'error': 'Rate limit exceeded', 'details': str(e.description)}), 429
    
    @application.errorhandler(500)
    def internal_error(error):
        application.logger.error(f"Internal server error: {error}")
        return jsonify({'error': 'Internal server error'}), 500
    
    # Request logging
    @application.before_request
    def log_request():
        application.logger.info(f"{request.method} {request.path}")
    
    return application