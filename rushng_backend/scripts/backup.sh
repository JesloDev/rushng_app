#!/bin/bash
# ================================================================
# RUSHNG - Database Backup Script
# ================================================================

set -e

# ================================================================
# Configuration
# ================================================================

DB_NAME="rushng_prod"
DB_USER="rushng"
DB_HOST="localhost"
BACKUP_DIR="/var/backups/rushng"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rushng_$TIMESTAMP.sql.gz"

# ================================================================
# Main
# ================================================================

log_info() {
    echo "[INFO] $1"
}

log_info "💾 Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
log_info "📁 Backing up $DB_NAME..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME --clean --if-exists | gzip > $BACKUP_FILE

# Check if backup was successful
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    log_info "✅ Backup created: $BACKUP_FILE"
    log_info "📊 Size: $(du -h $BACKUP_FILE | cut -f1)"
else
    log_info "❌ Backup failed!"
    exit 1
fi

# Remove old backups
log_info "🧹 Removing backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

log_info "✅ Backup complete!"

# Optional: Upload to cloud storage (uncomment to enable)
# log_info "☁️  Uploading to S3..."
# aws s3 cp $BACKUP_FILE s3://rushng-backups/