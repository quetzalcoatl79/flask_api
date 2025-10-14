#!/bin/bash

# Database backup script for production

echo "📦 Creating database backup..."

# Load environment variables
source .env.production

# Create backup filename with timestamp
BACKUP_FILE="backups/flask_api_backup_$(date +%Y%m%d_%H%M%S).sql"

# Create backup
docker-compose -f docker-compose.production.yml exec -T db pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "📦 Backup compressed: ${BACKUP_FILE}.gz"
    
    # Keep only last 7 backups
    ls -t backups/flask_api_backup_*.sql.gz | tail -n +8 | xargs -r rm
    echo "🧹 Old backups cleaned up (keeping last 7)"
else
    echo "❌ Database backup failed!"
    exit 1
fi