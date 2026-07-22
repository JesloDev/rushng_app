import logging
import sys
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime

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
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)
    
    # File handler
    try:
        file_handler = RotatingFileHandler(
            os.path.join(LOG_DIR, 'app.log'),
            maxBytes=10_485_760,  # 10MB
            backupCount=10
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(console_formatter)
        app.logger.addHandler(file_handler)
    except Exception as e:
        app.logger.warning(f"Could not create file handler: {e}")
    
    # Error file handler
    try:
        error_file_handler = RotatingFileHandler(
            os.path.join(LOG_DIR, 'error.log'),
            maxBytes=10_485_760,  # 10MB
            backupCount=10
        )
        error_file_handler.setLevel(logging.ERROR)
        error_file_handler.setFormatter(console_formatter)
        app.logger.addHandler(error_file_handler)
    except Exception as e:
        app.logger.warning(f"Could not create error file handler: {e}")
    
    # Add console handler
    app.logger.addHandler(console_handler)
    app.logger.setLevel(log_level)
    
    # Set werkzeug logger level
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(log_level)
    
    app.logger.info(f"Logging configured at {log_level} level")
    app.logger.info(f"Environment: {app.config.get('ENVIRONMENT', 'unknown')}")

def log_access(app, request, response):
    """Log API access"""
    app.logger.info(
        f"ACCESS: {request.method} {request.path} - {response.status_code} - {request.remote_addr}"
    )

def log_error(app, error, request=None):
    """Log errors with context"""
    error_msg = f"ERROR: {error}"
    if request:
        error_msg += f" - {request.method} {request.path} - {request.remote_addr}"
    app.logger.error(error_msg)

def log_user_action(app, user_id, action, details=None):
    """Log user actions for audit"""
    app.logger.info(f"USER ACTION: {user_id} - {action} - {details or {}}")

def log_security_event(app, event_type, details=None):
    """Log security events"""
    app.logger.warning(f"SECURITY: {event_type} - {details or {}}")

def log_business_event(app, event_type, data=None):
    """Log business events (payments, jobs, etc.)"""
    app.logger.info(f"BUSINESS: {event_type} - {data or {}}")