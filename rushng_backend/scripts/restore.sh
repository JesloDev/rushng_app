#!/bin/bash
# ================================================================
# RUSHNG - Database Restore Script
# ================================================================

set -e

# ================================================================
# Configuration
# ================================================================

DB_NAME="rushng_prod"
DB_USER="rushng"
DB_HOST="localhost"
BACKUP_DIR="/var/backups/rushng"

# ================================================================
# Colors
# ================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ================================================================
# Main
# ================================================================

# List available backups
log_info "📋 Available backups:"
ls -la $BACKUP_DIR/*.sql.gz 2>/dev/null || {
    log_error "No backups found in $BACKUP_DIR"
    exit 1
}

# Ask for backup file
echo ""
read -p "Enter the backup filename to restore (e.g., rushng_20240101_120000.sql.gz): " BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Confirm
echo ""
log_info "⚠️  This will OVERWRITE the entire $DB_NAME database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "❌ Restore cancelled"
    exit 0
fi

# Drop and recreate database
log_info "🗑️  Dropping and recreating database..."
psql -h $DB_HOST -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h $DB_HOST -U postgres -c "CREATE DATABASE $DB_NAME;"

# Restore backup
log_info "📁 Restoring $BACKUP_FILE..."
gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | psql -h $DB_HOST -U $DB_USER -d $DB_NAME

log_info "✅ Database restore complete!"