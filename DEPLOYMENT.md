# Flask API - Multi-Environment Setup

This project provides a complete multi-environment setup for a Flask API with Next.js frontend, supporting both development and production deployments.

## 🏗️ Architecture

- **Backend**: Flask API with Celery for background tasks
- **Frontend**: Next.js React application
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Reverse Proxy**: Nginx (production only)
- **Containerization**: Docker & Docker Compose

## 🌍 Environments

### Development Environment
- **Purpose**: Local development with hot reload
- **Access**: 
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000
  - Database: localhost:5432
- **Features**:
  - Hot reload for both frontend and backend
  - Debug mode enabled
  - Direct port access
  - Development logging

### Production Environment
- **Purpose**: Production deployment with Nginx reverse proxy
- **Access**: 
  - Frontend: https://yourapp.com
  - Backend: https://api.yourapp.com
- **Features**:
  - SSL termination with Nginx
  - Production-optimized builds
  - Security headers
  - Rate limiting
  - Health checks
  - Automatic backups

## 🚀 Quick Start

### Development

1. **Copy environment file**:
   ```bash
   cp .env.development .env.development
   ```

2. **Edit configuration**:
   ```bash
   # Edit .env.development with your settings
   nano .env.development
   ```

3. **Start development environment**:
   ```bash
   make dev-start
   # or
   docker-compose -f docker-compose.development.yml up -d
   ```

4. **Access your application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production

1. **Copy environment file**:
   ```bash
   cp .env.production .env.production
   ```

2. **Configure production settings**:
   ```bash
   # Edit .env.production with your production settings
   nano .env.production
   ```
   
   **Important**: Update these values in `.env.production`:
   - `DOMAIN=yourapp.com` (your actual domain)
   - `POSTGRES_PASSWORD` (strong password)
   - `SECRET_KEY` (strong secret)
   - `JWT_SECRET_KEY` (strong JWT secret)

3. **Setup SSL certificates**:
   ```bash
   # Place your SSL certificates in nginx/ssl/
   cp your-domain.crt nginx/ssl/yourapp.com.crt
   cp your-domain.key nginx/ssl/yourapp.com.key
   ```

4. **Deploy to production**:
   ```bash
   make prod-deploy
   # or
   bash scripts/deploy-prod.sh
   ```

## 📋 Available Commands

### Using Makefile (Recommended)

```bash
# Development
make dev-start      # Start development environment
make dev-stop       # Stop development environment
make dev-logs       # View development logs

# Production
make prod-deploy    # Deploy to production
make prod-stop      # Stop production environment
make prod-logs      # View production logs
make backup-db      # Backup production database

# Maintenance
make clean          # Clean Docker resources
make health         # Check service health
```

### Using Docker Compose directly

```bash
# Development
docker-compose -f docker-compose.development.yml up -d
docker-compose -f docker-compose.development.yml down
docker-compose -f docker-compose.development.yml logs -f

# Production
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml logs -f
```

## 🔧 Configuration

### Environment Variables

#### Development (.env.development)
- `NODE_ENV=development`
- `FLASK_ENV=development`
- `DEBUG=true`
- Database and Redis settings for local development

#### Production (.env.production)
- `NODE_ENV=production`
- `FLASK_ENV=production`
- `DEBUG=false`
- Production domain and SSL settings
- Strong passwords and secrets

### Nginx Configuration

The production environment includes Nginx as a reverse proxy with:

- **SSL/TLS termination**
- **Rate limiting**
- **Security headers**
- **Gzip compression**
- **Static file caching**
- **CORS handling**

Configuration files:
- `nginx/nginx.conf` - Main Nginx configuration
- `nginx/sites-available/frontend.conf` - Frontend proxy rules
- `nginx/sites-available/backend.conf` - Backend API proxy rules

## 🔒 Security

### Production Security Features

1. **SSL/TLS encryption** for all communications
2. **Security headers** (HSTS, X-Frame-Options, etc.)
3. **Rate limiting** to prevent abuse
4. **Non-root user** in containers
5. **Secrets management** via environment variables
6. **CORS configuration** for API access

### SSL Certificate Setup

For production, you need SSL certificates. You can:

1. **Use Let's Encrypt** (recommended):
   ```bash
   # Example with certbot
   certbot certonly --standalone -d yourapp.com -d api.yourapp.com
   cp /etc/letsencrypt/live/yourapp.com/fullchain.pem nginx/ssl/yourapp.com.crt
   cp /etc/letsencrypt/live/yourapp.com/privkey.pem nginx/ssl/yourapp.com.key
   ```

2. **Use purchased certificates**:
   - Place your certificate files in `nginx/ssl/`
   - Update paths in `.env.production` if needed

## 🗄️ Database Management

### Migrations

```bash
# Development
docker-compose -f docker-compose.development.yml exec backend flask db migrate -m "Migration message"
docker-compose -f docker-compose.development.yml exec backend flask db upgrade

# Production
docker-compose -f docker-compose.production.yml exec backend flask db upgrade
```

### Backups

```bash
# Create backup
make backup-db

# Restore backup
docker-compose -f docker-compose.production.yml exec -T db psql -U postgres -d flask_api_prod < backups/backup_file.sql
```

## 📊 Monitoring

### Health Checks

Both environments include health checks:

```bash
# Check overall health
make health

# Manual health check
curl http://localhost:5000/health  # Development
curl https://api.yourapp.com/health  # Production
```

### Logs

```bash
# View all logs
make dev-logs    # Development
make prod-logs   # Production

# View specific service logs
docker-compose -f docker-compose.development.yml logs -f backend
docker-compose -f docker-compose.development.yml logs -f frontend
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   ```

2. **Permission issues**:
   ```bash
   # Fix permissions on scripts
   chmod +x scripts/*.sh
   ```

3. **Database connection issues**:
   ```bash
   # Check database status
   docker-compose -f docker-compose.development.yml ps db
   docker-compose -f docker-compose.development.yml logs db
   ```

4. **SSL issues in production**:
   - Verify certificate files exist in `nginx/ssl/`
   - Check certificate validity
   - Ensure domain DNS points to your server

### Useful Commands

```bash
# Clean everything and start fresh
make clean
docker-compose -f docker-compose.development.yml down -v
make dev-start

# Rebuild containers
docker-compose -f docker-compose.development.yml up -d --build

# Access container shell
docker-compose -f docker-compose.development.yml exec backend bash
docker-compose -f docker-compose.development.yml exec frontend sh
```

## 📁 Project Structure

```
flask_api/
├── backend/                 # Flask API
│   ├── Dockerfile.dev      # Development Dockerfile
│   ├── Dockerfile.prod     # Production Dockerfile
│   └── ...
├── frontend/               # Next.js app
│   ├── Dockerfile.dev      # Development Dockerfile
│   ├── Dockerfile.prod     # Production Dockerfile
│   └── ...
├── nginx/                  # Nginx configuration
│   ├── nginx.conf         # Main config
│   └── sites-available/   # Site configs
├── scripts/               # Deployment scripts
├── .env.development      # Development environment
├── .env.production       # Production environment
├── docker-compose.development.yml
├── docker-compose.production.yml
└── Makefile              # Command shortcuts
```

## 🔄 Deployment Workflow

### Development Workflow

1. Make changes to your code
2. Changes are automatically reflected (hot reload)
3. Test your changes
4. Commit to version control

### Production Workflow

1. Test changes in development
2. Commit and push to repository
3. Pull changes on production server
4. Run `make prod-deploy`
5. Verify deployment with `make health`

## 📞 Support

For issues or questions:

1. Check the logs: `make dev-logs` or `make prod-logs`
2. Verify configuration in `.env.development` or `.env.production`
3. Check Docker status: `docker ps`
4. Review this documentation

---

**Happy coding! 🚀**