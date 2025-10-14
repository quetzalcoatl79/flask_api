@echo off
echo 🚀 Deploying Flask API - Production Environment
echo ==============================================

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ .env.production file not found!
    echo Please copy .env.production.example to .env.production and configure it.
    pause
    exit /b 1
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.production.yml down

REM Build production containers
echo 📦 Building production containers...
docker-compose -f docker-compose.production.yml build --no-cache

REM Start production services
echo 🌟 Starting production services...
docker-compose -f docker-compose.production.yml up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak > nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose -f docker-compose.production.yml ps

echo.
echo ✅ Production environment deployed successfully!
echo.
echo 📝 To view logs: docker-compose -f docker-compose.production.yml logs -f
echo 🛑 To stop: docker-compose -f docker-compose.production.yml down
echo.
pause