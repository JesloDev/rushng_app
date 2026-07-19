#!/bin/bash
# ================================================================
# RUSHNG - Production Deployment Script
# ================================================================

set -e

# ================================================================
# Colors
# ================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ================================================================
# Configuration
# ================================================================

APP_DIR="/var/www/rushng-api"
VENV_DIR="$APP_DIR/venv"
LOG_DIR="/var/log/rushng-api"
BACKUP_DIR="/var/backups/rushng"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ================================================================
# Functions
# ================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ================================================================
# Main Deployment
# ================================================================

log_info "🚀 Starting RUSHNG deployment..."

# 1. Create directories
log_info "📁 Creating directories..."
mkdir -p $APP_DIR $LOG_DIR $BACKUP_DIR

# 2. Backup current version
if [ -d "$APP_DIR/app" ]; then
    log_info "💾 Backing up current version..."
    cd $APP_DIR
    tar -czf "$BACKUP_DIR/rushng_backup_$TIMESTAMP.tar.gz" app/ migrations/ .env
fi

# 3. Pull latest code
log_info "📦 Pulling latest code..."
cd $APP_DIR
git pull origin main

# 4. Install dependencies
log_info "📥 Installing dependencies..."
source $VENV_DIR/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 5. Run migrations
log_info "🔄 Running database migrations..."
flask db upgrade

# 6. Seed data if needed
# log_info "🌱 Seeding data..."
# python scripts/seed.py

# 7. Build frontend (if applicable)
# log_info "🏗️ Building frontend..."
# cd ../rushng-frontend
# npm install
# npm run build

# 8. Restart services
log_info "🔄 Restarting services..."
sudo supervisorctl restart rushng-api
sudo supervisorctl restart rushng-celery

# 9. Reload nginx
log_info "🔄 Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 10. Clean up old backups (keep last 7 days)
log_info "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

log_info "✅ Deployment complete!"
log_info "📍 API: https://api.rushng.com"
log_info "📊 Status: Check with: sudo supervisorctl status rushng-api"