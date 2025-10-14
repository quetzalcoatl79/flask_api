# Flask API - Multi-Environment Setup
# ====================================

.PHONY: help dev-start dev-stop prod-deploy prod-stop backup-db clean test

# Default target
help:
	@echo "Flask API - Available Commands:"
	@echo "================================"
	@echo ""
	@echo "Development:"
	@echo "  dev-start    - Start development environment"
	@echo "  dev-stop     - Stop development environment"
	@echo "  dev-logs     - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  prod-deploy  - Deploy to production"
	@echo "  prod-stop    - Stop production environment"
	@echo "  prod-logs    - Show production logs"
	@echo "  backup-db    - Backup production database"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        - Clean up Docker resources"
	@echo "  health       - Check service health"
	@echo "  test         - Test environment setup"
	@echo ""

# Development environment
dev-start:
	@echo "🚀 Starting development environment..."
	@if [ ! -f .env.development ]; then \
		echo "❌ .env.development not found. Please create it from .env.development"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.development.yml up -d --build
	@echo "✅ Development environment started!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend: http://localhost:5000"

dev-stop:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.development.yml down
	@echo "✅ Development environment stopped!"

dev-logs:
	docker-compose -f docker-compose.development.yml logs -f

# Production environment
prod-deploy:
	@echo "🚀 Deploying to production..."
	@if [ ! -f .env.production ]; then \
		echo "❌ .env.production not found. Please create it from .env.production"; \
		exit 1; \
	fi
	@bash scripts/deploy-prod.sh

prod-stop:
	@echo "🛑 Stopping production environment..."
	docker-compose -f docker-compose.production.yml down
	@echo "✅ Production environment stopped!"

prod-logs:
	docker-compose -f docker-compose.production.yml logs -f

backup-db:
	@bash scripts/backup-db.sh

# Maintenance
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker system prune -f
	docker volume prune -f
	@echo "✅ Cleanup completed!"

health:
	@echo "🔍 Checking service health..."
	@if docker-compose -f docker-compose.development.yml ps | grep -q "Up"; then \
		echo "📊 Development environment status:"; \
		docker-compose -f docker-compose.development.yml ps; \
	fi
	@if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then \
		echo "📊 Production environment status:"; \
		docker-compose -f docker-compose.production.yml ps; \
	fi

test:
	@bash scripts/test-setup.sh

# Quick development setup
dev-setup:
	@echo "⚙️  Setting up development environment..."
	@if [ ! -f .env.development ]; then \
		cp .env.development .env.development; \
		echo "📝 Please edit .env.development with your settings"; \
	fi
	$(MAKE) dev-start

# Quick production setup
prod-setup:
	@echo "⚙️  Setting up production environment..."
	@if [ ! -f .env.production ]; then \
		cp .env.production .env.production; \
		echo "📝 Please edit .env.production with your settings"; \
		echo "🔑 Don't forget to place SSL certificates in nginx/ssl/"; \
	fi