#!/bin/bash

# Development environment startup script

echo "🚀 Starting Flask API - Development Environment"
echo "==============================================="

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo "❌ .env.development file not found!"
    echo "Please copy .env.development.example to .env.development and configure it."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start development containers
echo "📦 Building development containers..."
docker-compose -f docker-compose.development.yml build

echo "🌟 Starting development services..."
docker-compose -f docker-compose.development.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.development.yml ps

# Display URLs
echo ""
echo "✅ Development environment started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
echo "📊 Redis: localhost:6379"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.development.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.development.yml down"
echo ""