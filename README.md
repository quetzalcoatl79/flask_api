# Flask API avec Frontend Next.js - Multi-Environment

Une application complète avec backend Flask et frontend Next.js, configurée pour le développement et la production.

## 🏗️ Architecture

- **Backend**: Flask API avec Celery pour les tâches asynchrones
- **Frontend**: Application Next.js React
- **Base de données**: PostgreSQL
- **Cache/Queue**: Redis  
- **Proxy inverse**: Nginx (production seulement)
- **Conteneurisation**: Docker & Docker Compose

## 🌍 Environnements Disponibles

### 🔧 Environnement de Développement
- **Accès**: http://localhost:3000 (frontend) et http://localhost:5000 (backend)
- **Fonctionnalités**: Hot reload, mode debug, accès direct aux ports

### 🚀 Environnement de Production  
- **Accès**: https://yourapp.com (frontend) et https://api.yourapp.com (backend)
- **Fonctionnalités**: SSL/TLS, optimisations production, Nginx, sécurité

## ⚡ Démarrage Rapide

### Développement

```bash
# 1. Copier le fichier d'environnement
cp .env.development .env.development

# 2. Modifier la configuration (si nécessaire)
nano .env.development

# 3. Démarrer l'environnement de développement
make dev-start
```

Votre application sera accessible sur:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production

```bash
# 1. Copier le fichier d'environnement
cp .env.production .env.production

# 2. Configurer votre domaine et secrets
nano .env.production

# 3. Placer vos certificats SSL
cp votre-certificat.crt nginx/ssl/yourapp.com.crt
cp votre-cle.key nginx/ssl/yourapp.com.key

# 4. Déployer en production
make prod-deploy
```

## 📋 Commandes Disponibles

### Développement
```bash
make dev-start      # Démarrer l'environnement de développement
make dev-stop       # Arrêter l'environnement de développement  
make dev-logs       # Voir les logs de développement
```

### Production
```bash
make prod-deploy    # Déployer en production
make prod-stop      # Arrêter l'environnement de production
make prod-logs      # Voir les logs de production
make backup-db      # Sauvegarder la base de données
```

### Maintenance
```bash
make clean          # Nettoyer les ressources Docker
make health         # Vérifier l'état des services
```

## 🔧 Configuration

### Variables d'Environnement

#### Développement (.env.development)
- Ports exposés directement (3000, 5000, 5432, 6379)
- Mode debug activé
- Hot reload enabled
- Mots de passe simples pour le développement

#### Production (.env.production)  
- **IMPORTANT**: Modifiez ces valeurs avant le déploiement:
  - `DOMAIN=yourapp.com` → votre domaine réel
  - `POSTGRES_PASSWORD` → mot de passe fort
  - `SECRET_KEY` → clé secrète forte
  - `JWT_SECRET_KEY` → clé JWT forte

### SSL/TLS pour la Production

Placez vos certificats SSL dans `nginx/ssl/`:
```bash
nginx/ssl/yourapp.com.crt
nginx/ssl/yourapp.com.key
```

Ou utilisez Let's Encrypt:
```bash
certbot certonly --standalone -d yourapp.com -d api.yourapp.com
cp /etc/letsencrypt/live/yourapp.com/fullchain.pem nginx/ssl/yourapp.com.crt
cp /etc/letsencrypt/live/yourapp.com/privkey.pem nginx/ssl/yourapp.com.key
```

## 📁 Structure du Projet

```
flask_api/
├── backend/                    # API Flask
│   ├── Dockerfile.dev         # Dockerfile développement
│   ├── Dockerfile.prod        # Dockerfile production
│   └── ...
├── frontend/                   # App Next.js
│   ├── Dockerfile.dev         # Dockerfile développement  
│   ├── Dockerfile.prod        # Dockerfile production
│   └── ...
├── nginx/                      # Configuration Nginx
│   ├── nginx.conf             # Config principale
│   ├── sites-available/       # Config des sites
│   └── ssl/                   # Certificats SSL
├── scripts/                    # Scripts de déploiement
├── .env.development           # Config développement
├── .env.production            # Config production
├── docker-compose.development.yml
├── docker-compose.production.yml
├── Makefile                   # Raccourcis de commandes
└── DEPLOYMENT.md              # Documentation détaillée
```

## 🔒 Sécurité en Production

- **Chiffrement SSL/TLS** pour toutes les communications
- **En-têtes de sécurité** (HSTS, X-Frame-Options, etc.)
- **Limitation du taux de requêtes** pour prévenir les abus
- **Utilisateurs non-root** dans les conteneurs
- **Gestion des secrets** via variables d'environnement
- **Configuration CORS** pour l'accès API

## 📊 Surveillance

```bash
# Vérifier l'état des services
make health

# Voir les logs
make dev-logs    # Développement
make prod-logs   # Production

# Vérification manuelle de santé
curl http://localhost:5000/health              # Développement
curl https://api.yourapp.com/health           # Production
```

## 🗄️ Gestion de la Base de Données

### Migrations
```bash
# Développement
docker-compose -f docker-compose.development.yml exec backend flask db migrate -m "Description"
docker-compose -f docker-compose.development.yml exec backend flask db upgrade

# Production  
docker-compose -f docker-compose.production.yml exec backend flask db upgrade
```

### Sauvegardes
```bash
# Créer une sauvegarde
make backup-db

# Restaurer une sauvegarde
docker-compose -f docker-compose.production.yml exec -T db psql -U postgres -d flask_api_prod < backups/fichier_sauvegarde.sql
```

## 🚨 Dépannage

### Problèmes Courants

1. **Conflits de ports**:
   ```bash
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   ```

2. **Problèmes de base de données**:
   ```bash
   docker-compose -f docker-compose.development.yml logs db
   ```

3. **Redémarrage complet**:
   ```bash
   make clean
   make dev-start
   ```

## 📖 Documentation Complète

Voir `DEPLOYMENT.md` pour la documentation détaillée incluant:
- Configuration avancée de Nginx
- Procédures de déploiement complètes
- Gestion des certificats SSL
- Surveillance et maintenance
- Workflow de déploiement

---

**Bon développement ! 🚀**