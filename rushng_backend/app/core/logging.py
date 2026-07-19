import logging
import sys
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
import os

# Create logs directory if it doesn't exist
LOG_DIR = 'logs'
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

def setup_logging(app):
    """Configure logging for the application"""
    
    # Remove default handlers
    app.logger.handlers.clear()
    
    # Set log level based on environment
    log_level = logging.DEBUG if app.debug else logging.INFO
    
    # Create formatters
    json_formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s %(module)s %(funcName)s %(lineno)d',
        datefmt='%Y-%m-%dT%H:%M:%S%z'
    )
    
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler (for development)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)
    
    # File handler (JSON format for production)
    file_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, 'app.log'),
        maxBytes=10_485_760,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(json_formatter)
    
    # Error file handler
    error_file_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, 'error.log'),
        maxBytes=10_485_760,  # 10MB
        backupCount=10
    )
    error_file_handler.setLevel(logging.ERROR)
    error_file_handler.setFormatter(json_formatter)
    
    # Access log handler
    access_file_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, 'access.log'),
        maxBytes=10_485_760,  # 10MB
        backupCount=10
    )
    access_file_handler.setLevel(logging.INFO)
    access_file_handler.setFormatter(json_formatter)
    
    # Add handlers to app logger
    app.logger.addHandler(console_handler)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(error_file_handler)
    app.logger.addHandler(access_file_handler)
    app.logger.setLevel(log_level)
    
    # Add handlers to werkzeug logger
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.addHandler(console_handler)
    werkzeug_logger.addHandler(file_handler)
    werkzeug_logger.setLevel(log_level)
    
    # Add handlers to SQLAlchemy logger (if needed)
    if app.debug:
        sqlalchemy_logger = logging.getLogger('sqlalchemy.engine')
        sqlalchemy_logger.addHandler(console_handler)
        sqlalchemy_logger.setLevel(logging.INFO)
    
    app.logger.info(f"Logging configured at {log_level} level")
    app.logger.info(f"Environment: {app.config.get('ENVIRONMENT', 'unknown')}")

def log_access(app, request, response):
    """Log API access"""
    app.logger.info({
        'type': 'access',
        'method': request.method,
        'path': request.path,
        'status_code': response.status_code,
        'ip': request.remote_addr,
        'user_agent': request.headers.get('User-Agent'),
        'content_length': request.content_length,
        'referrer': request.headers.get('Referer')
    })

def log_error(app, error, request=None):
    """Log errors with context"""
    error_data = {
        'type': 'error',
        'error': str(error),
        'error_type': type(error).__name__,
    }
    
    if request:
        error_data.update({
            'method': request.method,
            'path': request.path,
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent')
        })
    
    app.logger.error(error_data)

def log_user_action(app, user_id, action, details=None):
    """Log user actions for audit"""
    app.logger.info({
        'type': 'user_action',
        'user_id': user_id,
        'action': action,
        'details': details or {},
        'timestamp': datetime.utcnow().isoformat()
    })

def log_security_event(app, event_type, details=None):
    """Log security events"""
    app.logger.warning({
        'type': 'security_event',
        'event_type': event_type,
        'details': details or {},
        'timestamp': datetime.utcnow().isoformat()
    })

def log_business_event(app, event_type, data=None):
    """Log business events (payments, jobs, etc.)"""
    app.logger.info({
        'type': 'business_event',
        'event_type': event_type,
        'data': data or {},
        'timestamp': datetime.utcnow().isoformat()
    })

# Add datetime import
from datetime import datetime