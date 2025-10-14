#!/bin/bash

# Stop production environment

echo "🛑 Stopping Flask API - Production Environment"
echo "==========================================="

docker-compose -f docker-compose.production.yml down

echo "✅ Production environment stopped!"