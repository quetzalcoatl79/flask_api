#!/bin/bash

# Production environment deployment script

echo "🚀 Deploying Flask API - Production Environment"
echo "=============================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Load environment variables
source .env.production

# Validate required environment variables
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "yourapp.com" ]; then
    echo "❌ Please configure your DOMAIN in .env.production"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "CHANGE_ME_STRONG_PROD_PASSWORD" ]; then
    echo "❌ Please configure a strong POSTGRES_PASSWORD in .env.production"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Update Nginx configuration with actual domain
echo "🔧 Updating Nginx configuration..."
sed -i "s/yourapp.com/$DOMAIN/g" nginx/sites-available/frontend.conf
sed -i "s/yourapp.com/$DOMAIN/g" nginx/sites-available/backend.conf

# Check SSL certificates
if [ ! -f "nginx/ssl/$DOMAIN.crt" ] || [ ! -f "nginx/ssl/$DOMAIN.key" ]; then
    echo "⚠️  SSL certificates not found for $DOMAIN"
    echo "Please place your SSL certificates in nginx/ssl/"
    echo "Expected files:"
    echo "  - nginx/ssl/$DOMAIN.crt"
    echo "  - nginx/ssl/$DOMAIN.key"
    echo ""
    read -p "Continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create backup directory
mkdir -p backups

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Build production containers
echo "📦 Building production containers..."
docker-compose -f docker-compose.production.yml build --no-cache

# Start production services
echo "🌟 Starting production services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.production.yml exec backend flask db upgrade

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Display URLs
echo ""
echo "✅ Production environment deployed successfully!"
echo ""
echo "🌐 Frontend: https://$DOMAIN"
echo "🔧 Backend API: https://api.$DOMAIN"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.production.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.production.yml down"
echo "📊 To backup database: ./scripts/backup-db.sh"
echo ""