"""
Gunicorn configuration for production deployment
"""

import os
import multiprocessing

# ==================== SERVER SETTINGS ====================

# Bind to UNIX socket or TCP port
bind = os.getenv('GUNICORN_BIND', '127.0.0.1:8000')

# Number of worker processes
workers = int(os.getenv('GUNICORN_WORKERS', multiprocessing.cpu_count() * 2 + 1))

# Worker type (sync, gevent, etc.)
worker_class = os.getenv('GUNICORN_WORKER_CLASS', 'sync')

# Worker connections (for gevent)
worker_connections = int(os.getenv('GUNICORN_WORKER_CONNECTIONS', 1000))

# Worker timeout in seconds
timeout = int(os.getenv('GUNICORN_TIMEOUT', 120))

# Maximum number of requests a worker will process before restarting
max_requests = int(os.getenv('GUNICORN_MAX_REQUESTS', 1000))

# Maximum jitter to add to max_requests (prevents all workers restarting at once)
max_requests_jitter = int(os.getenv('GUNICORN_MAX_REQUESTS_JITTER', 100))

# Preload application before forking workers (saves memory but may cause issues)
preload_app = os.getenv('GUNICORN_PRELOAD', 'false').lower() == 'true'

# ==================== LOGGING ====================

# Access log file
accesslog = os.getenv('GUNICORN_ACCESS_LOG', '/var/log/rushng/access.log')
errorlog = os.getenv('GUNICORN_ERROR_LOG', '/var/log/rushng/error.log')

# Log level
loglevel = os.getenv('GUNICORN_LOG_LEVEL', 'info')

# Access log format
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# ==================== PERFORMANCE ====================

# Enable thread support (if needed)
threads = int(os.getenv('GUNICORN_THREADS', 1))

# Enable graceful shutdown
graceful_timeout = int(os.getenv('GUNICORN_GRACEFUL_TIMEOUT', 30))

# ==================== SECURITY ====================

# Limit request line size (prevents DDOS)
limit_request_line = int(os.getenv('GUNICORN_LIMIT_REQUEST_LINE', 4096))

# Limit number of headers
limit_request_fields = int(os.getenv('GUNICORN_LIMIT_REQUEST_FIELDS', 100))

# Limit header size
limit_request_field_size = int(os.getenv('GUNICORN_LIMIT_REQUEST_FIELD_SIZE', 8190))

# ==================== PROXY ====================

# Enable proxy headers (X-Forwarded-For, X-Forwarded-Proto, etc.)
forwarded_allow_ips = os.getenv('GUNICORN_FORWARDED_ALLOW_IPS', '*')

# Proxy protocol (if using HAProxy)
proxy_protocol = os.getenv('GUNICORN_PROXY_PROTOCOL', 'false').lower() == 'true'

# ==================== PROCESS MANAGEMENT ====================

# Process name
proc_name = os.getenv('GUNICORN_PROC_NAME', 'rushng-api')

# PID file
pidfile = os.getenv('GUNICORN_PIDFILE', '/var/run/rushng-api.pid')

# Daemonize (run in background)
daemon = os.getenv('GUNICORN_DAEMON', 'false').lower() == 'true'

# User to run as
user = os.getenv('GUNICORN_USER', 'www-data')
group = os.getenv('GUNICORN_GROUP', 'www-data')

# ==================== SSL (optional) ====================

# SSL key file
keyfile = os.getenv('GUNICORN_KEYFILE', '')
# SSL cert file
certfile = os.getenv('GUNICORN_CERTFILE', '')

# ==================== POST-FORK ====================

def post_fork(server, worker):
    """Actions to run after forking a worker"""
    import os
    import random
    import time
    
    # Set random seed for worker to prevent collisions
    random.seed(os.getpid() + int(time.time()))

def worker_int(worker):
    """Actions to run when a worker receives a SIGINT"""
    import logging
    logging.info(f"Worker {worker.pid} received SIGINT, shutting down...")

def worker_abort(worker):
    """Actions to run when a worker receives a SIGABRT"""
    import logging
    logging.info(f"Worker {worker.pid} received SIGABRT, aborting...")