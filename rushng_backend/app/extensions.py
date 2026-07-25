from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_compress import Compress
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# Initialize extension instances
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
limiter = Limiter(key_func=get_remote_address)
talisman = Talisman()
compress = Compress()
cors = CORS()
bcrypt = Bcrypt()


def init_extensions(app: Flask) -> None:
    """Initialize Flask extensions with application instance."""
    
    # 1. Database & Migrations
    db.init_app(app)
    migrate.init_app(app, db)
    
    # 2. Authentication & Security Hashing
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # 3. Rate Limiter (Explicitly bind storage_uri to suppress memory warning)
    limiter.init_app(
        app,
        storage_uri=app.config.get("RATELIMIT_STORAGE_URL", "memory://")
    )
    
    # 4. CORS
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True
    )
    
    # 5. Compression
    compress.init_app(app)
    
    # 6. Talisman Security Headers (Conditional base on environment)
    if app.config.get("TALISMAN_ENABLED", False):
        talisman.init_app(
            app,
            content_security_policy=None,  # Adjust CSP based on frontend requirements
            force_https=True
        )