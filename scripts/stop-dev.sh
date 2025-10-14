#!/bin/bash

# Stop development environment

echo "🛑 Stopping Flask API - Development Environment"
echo "=============================================="

docker-compose -f docker-compose.development.yml down

echo "✅ Development environment stopped!"