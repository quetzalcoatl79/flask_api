@echo off
echo 🔍 Checking Service Health
echo ========================

echo Development Environment:
docker-compose -f docker-compose.development.yml ps

echo.
echo Production Environment:
docker-compose -f docker-compose.production.yml ps

pause