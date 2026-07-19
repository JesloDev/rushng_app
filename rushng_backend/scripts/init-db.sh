#!/bin/bash
# ================================================================
# RUSHNG - Database Initialization Script
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

DB_USER="${DB_USER:-rushng}"
DB_PASSWORD="${DB_PASSWORD:-rushng123}"
DB_NAME="${DB_NAME:-rushng_prod}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# ================================================================
# Main
# ================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "🗄️  Initializing RUSHNG database..."

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    log_error "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create database if not exists
if ! psql -h $DB_HOST -p $DB_PORT -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    log_info "📁 Creating database: $DB_NAME"
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE DATABASE $DB_NAME;"
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
else
    log_info "ℹ️  Database $DB_NAME already exists"
fi

# Run initialization SQL
log_info "📝 Running schema initialization..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/init.sql

# Run seed data
log_info "🌱 Running seed data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/seed.sql

log_info "✅ Database initialization complete!"