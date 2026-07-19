from app.api.auth import auth_bp
from app.api.users import users_bp
from app.api.providers import providers_bp
from app.api.jobs import jobs_bp
from app.api.payments import payments_bp
from app.api.violations import violations_bp
from app.api.ratings import ratings_bp
from app.api.notifications import notifications_bp
from app.api.admin import admin_bp

__all__ = [
    'auth_bp',
    'users_bp',
    'providers_bp',
    'jobs_bp',
    'payments_bp',
    'violations_bp',
    'ratings_bp',
    'notifications_bp',
    'admin_bp'
]