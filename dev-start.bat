@echo off
echo 🚀 Starting Flask API - Development Environment
echo ===============================================

REM Check if .env.development exists
if not exist ".env.development" (
    echo ❌ .env.development file not found!
    echo Please copy .env.development.example to .env.development and configure it.
    pause
    exit /b 1
)

REM Start development containers
echo 📦 Building and starting development containers...
docker-compose -f docker-compose.development.yml up -d --build

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak > nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose -f docker-compose.development.yml ps

REM Display URLs
echo.
echo ✅ Development environment started successfully!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 🗄️  Database: localhost:5432
echo 📊 Redis: localhost:6379
echo.
echo 📝 To view logs: docker-compose -f docker-compose.development.yml logs -f
echo 🛑 To stop: docker-compose -f docker-compose.development.yml down
echo.
pause