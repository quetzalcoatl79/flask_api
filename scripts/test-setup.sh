#!/bin/bash

# Test script to verify both environments work correctly

echo "🧪 Testing Flask API Multi-Environment Setup"
echo "==========================================="

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local description=$2
    echo -n "Testing $description... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo "✅ SUCCESS"
        return 0
    else
        echo "❌ FAILED"
        return 1
    fi
}

# Function to test if port is open
test_port() {
    local host=$1
    local port=$2
    local description=$3
    echo -n "Testing $description ($host:$port)... "
    
    if nc -z "$host" "$port" 2>/dev/null; then
        echo "✅ OPEN"
        return 0
    else
        echo "❌ CLOSED"
        return 1
    fi
}

# Test development environment
echo ""
echo "🔧 Testing Development Environment"
echo "--------------------------------"

if docker-compose -f docker-compose.development.yml ps | grep -q "Up"; then
    echo "Development containers are running ✅"
    
    # Test ports
    test_port "localhost" "3000" "Frontend port"
    test_port "localhost" "5000" "Backend port"
    test_port "localhost" "5432" "Database port"
    test_port "localhost" "6379" "Redis port"
    
    # Test endpoints (with delay for startup)
    sleep 5
    test_endpoint "http://localhost:3000" "Frontend homepage"
    test_endpoint "http://localhost:5000/health" "Backend health check"
    
else
    echo "Development containers are not running ❌"
    echo "Run 'make dev-start' to start the development environment"
fi

# Test production environment
echo ""
echo "🚀 Testing Production Environment"
echo "-------------------------------"

if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    echo "Production containers are running ✅"
    
    # Test ports
    test_port "localhost" "80" "HTTP port"
    test_port "localhost" "443" "HTTPS port"
    
    # Test endpoints (if running locally)
    if [ -f ".env.production" ]; then
        source .env.production
        if [ "$DOMAIN" != "yourapp.com" ]; then
            test_endpoint "http://localhost" "Frontend via Nginx"
            test_endpoint "https://localhost" "Frontend via Nginx (HTTPS)"
        fi
    fi
    
else
    echo "Production containers are not running ❌"
    echo "Run 'make prod-deploy' to start the production environment"
fi

# Test Docker setup
echo ""
echo "🐳 Testing Docker Setup"
echo "---------------------"

if docker --version >/dev/null 2>&1; then
    echo "Docker is installed ✅"
else
    echo "Docker is not installed ❌"
fi

if docker-compose --version >/dev/null 2>&1; then
    echo "Docker Compose is installed ✅"
else
    echo "Docker Compose is not installed ❌"
fi

# Test configuration files
echo ""
echo "⚙️ Testing Configuration Files"
echo "-----------------------------"

if [ -f ".env.development" ]; then
    echo "Development environment file exists ✅"
else
    echo "Development environment file missing ❌"
    echo "Copy .env.development.example to .env.development"
fi

if [ -f ".env.production" ]; then
    echo "Production environment file exists ✅"
else
    echo "Production environment file missing ❌"
    echo "Copy .env.production.example to .env.production"
fi

# Test SSL certificates (for production)
if [ -f ".env.production" ]; then
    source .env.production
    if [ -f "nginx/ssl/$DOMAIN.crt" ] && [ -f "nginx/ssl/$DOMAIN.key" ]; then
        echo "SSL certificates found ✅"
    else
        echo "SSL certificates missing ⚠️"
        echo "Place your SSL certificates in nginx/ssl/"
    fi
fi

echo ""
echo "🎉 Test completed!"
echo ""
echo "Next steps:"
echo "- For development: make dev-start"
echo "- For production: make prod-deploy"
echo ""