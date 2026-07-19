from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_compress import Compress
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk
import logging
from datetime import datetime

from app.core.config import config
from app.core.database import db
from app.core.logging import setup_logging
from app.extensions import (
    jwt, migrate, limiter, talisman, compress, cors, bcrypt
)


def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = 'production'
    app.config.from_object(config[config_name])
    
    # Setup logging
    setup_logging(app)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    limiter.init_app(app)
    talisman.init_app(app)
    compress.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    
    # Sentry
    if app.config['SENTRY_DSN']:
        sentry_sdk.init(
            dsn=app.config['SENTRY_DSN'],
            integrations=[FlaskIntegration()],
            environment=app.config['ENVIRONMENT']
        )
    
    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.users import users_bp
    from app.api.providers import providers_bp
    from app.api.jobs import jobs_bp
    from app.api.payments import payments_bp
    from app.api.violations import violations_bp
    from app.api.ratings import ratings_bp
    from app.api.notifications import notifications_bp
    from app.api.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(providers_bp, url_prefix='/api/providers')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(violations_bp, url_prefix='/api/violations')
    app.register_blueprint(ratings_bp, url_prefix='/api/ratings')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Health check
    @app.route('/health')
    def health_check():
        try:
            db.session.execute('SELECT 1')
            db_status = 'healthy'
        except:
            db_status = 'unhealthy'
        
        return jsonify({
            'status': 'healthy' if db_status == 'healthy' else 'degraded',
            'database': db_status,
            'environment': app.config['ENVIRONMENT'],
            'timestamp': datetime.utcnow().isoformat()
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Resource not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {error}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
    
    # Request logging
    @app.before_request
    def log_request():
        app.logger.info(
            f"{request.method} {request.path} - "
            f"IP: {request.remote_addr}"
        )
    
    return app