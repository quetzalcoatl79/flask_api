# Starter Fullstack Flask + Next.js + Postgres + Redis + Celery

Architecture de développement complète prête pour extension (auth JWT, tâches asynchrones, healthcheck, UI moderne). Ce README couvre l'installation, l'exploitation en local via Docker, les migrations, et les commandes utiles sur macOS, Linux et Windows.

## 1. Cloner le projet

```bash
# SSH
git clone git@github.com:VOTRE_ORG/VOTRE_REPO.git flask_fullstack_starter
# HTTPS
git clone https://github.com/VOTRE_ORG/VOTRE_REPO.git flask_fullstack_starter
cd flask_fullstack_starter
```

Si vous utilisiez un autre répertoire, adaptez les chemins dans les commandes ci-dessous.

## 2. Structure résumée

```
backend/
  app.py
  routes.py
  models.py
  extensions.py
  celery_worker.py
  create_tables.py
frontend/
  app/
compose.yml
```

## 3. Prérequis

- Docker & Docker Compose (v2+)
- Git
- (Optionnel) Python 3.11+ local si vous voulez lancer le backend hors Docker
- (Optionnel) Node.js 20+ local si vous voulez lancer le frontend hors Docker

## 4. Variables d'environnement backend
Copier `.env.example` en `.env` à la racine puis ajuster :
```bash
cp .env.example .env  # Windows PowerShell: copy .env.example .env
```
Copier ensuite `backend/.env.example` si vous lancez le backend isolé :
```bash
cp backend/.env.example backend/.env
```
Variables clefs (voir `.env.example`) :
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `SQLALCHEMY_DATABASE_URI` (côté backend) 
- `SECRET_KEY`, `JWT_SECRET_KEY`, `APP_VERSION`
- `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`
Pour un lancement hors Docker backend local : ajuster l'URI Postgres en pointant sur `localhost` si vous exposez le port (5432:5432) et installez les dépendances Python.

## 5. Lancer l'environnement (Docker)

docker compose up -d --build
```bash
docker compose up -d --build
```

Services exposés :
- API Flask: http://localhost:5000
- Frontend Next.js: http://localhost:3000
- Redis: 6379 (interne, exposé pour debug)
- Postgres: interne (volume `postgres_data`)

Logs temps réel :
```bash
docker compose logs -f backend
# ou tout
docker compose logs -f
```

Arrêt :
```bash
docker compose down
```

Arrêt + purge volumes (PERTE DE DONNÉES) :
```bash
docker compose down -v
```

## 6. Première initialisation base de données
Deux approches :

### 6.1 Création rapide (dev) `create_tables.py`
```bash
docker compose exec backend flask shell -c "from create_tables import *"
# ou plus explicitement
docker compose exec backend python create_tables.py
```

### 6.2 Migrations (Alembic / Flask-Migrate)
Créer une révision initiale :
```bash
docker compose exec backend flask db init  # seulement la première fois
docker compose exec backend flask db migrate -m "init"
docker compose exec backend flask db upgrade
```

Si le dossier `migrations/` existe déjà, ne pas ré-exécuter `flask db init`.

## 7. Cycle Auth de test

1. Register
```bash
curl -X POST http://localhost:5000/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","email":"demo@example.com","password":"pass123"}'
```
2. Login
```bash
curl -X POST http://localhost:5000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"pass123"}'
```
Réponse exemple :
```json
{"access_token":"...","refresh_token":"..."}
```
3. Requête protégée `/me`
```bash
curl http://localhost:5000/me -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

## 8. Endpoint Health
```bash
curl http://localhost:5000/health | jq
```
Champs : `api`, `db`, `celery`, `status` (ok/degraded/down), `version`, `uptime_seconds`, `startup_grace`.

## 9. Tâches Celery
La tâche de test `ping` :
```bash
docker compose exec backend python -c "from celery_worker import ping; print(ping.delay().get(timeout=5))"
```

## 10. Développement sans Docker (optionnel)

### Backend local
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
export FLASK_APP=app:app  # Windows CMD: set FLASK_APP=app:app
flask run --port 5000
```
Assurez-vous de lancer redis & postgres autrement (Docker isolé ou services locaux).

### Frontend local
```bash
cd frontend
npm install
npm run dev
```

## 11. Commandes Docker utiles

| Objectif | Commande |
|----------|----------|
| Rebuild sans cache | `docker compose build --no-cache` |
| Redémarrer un service | `docker compose restart backend` |
| Shell dans le backend | `docker compose exec backend bash` |
| Inspecter la DB | `docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB` |
| Lister containers | `docker compose ps` |
| Nettoyer images dangling | `docker image prune -f` |

## 12. Reset Postgres propre (changement d'ENV ou schema irrécupérable)
1. Sauvegarder si besoin :
```bash
docker compose exec db pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > dump.sql
```
2. Stop + purge volume :
```bash
docker compose down
docker volume rm $(docker volume ls -q | grep postgres_data)
# Si grep non dispo sous PowerShell : docker volume rm flask_api_postgres_data (nom exact via docker volume ls)
```
3. Relancer :
```bash
docker compose up -d --build
```
4. Recréer tables (`create_tables.py` ou migrations).

## 13. Sécurité (évolutions à prévoir)
- Rotation et durée de vie courte access token
- Refresh token en cookie HttpOnly + rotation anti-rejeu
- Blacklist / table de révocation (logout réel)
- Rate limiting (Flask-Limiter + Redis)
- CSP / Headers sécurité (Flask-Talisman ou manuel)

## 14. Tests
Lancer les tests (si `pytest` installé dans container) :
```bash
docker compose exec backend pytest -q
```

## 15. Variables clés à adapter pour PROD
| Variable | Rôle | Remarques |
|----------|------|-----------|
| `SECRET_KEY` | Sessions Flask | Générer valeur aléatoire forte |
| `JWT_SECRET_KEY` | Signature JWT | Différente de SECRET_KEY |
| `SQLALCHEMY_DATABASE_URI` | Connexion DB | Utiliser utilisateur dédié applicatif |
| `CELERY_BROKER_URL` | Broker | Redis ou RabbitMQ prod dédié |
| `CELERY_RESULT_BACKEND` | Résultats | Optionnel si fire-and-forget |
| `APP_VERSION` | Version affichée | Synchroniser CI/CD |

## 16. Troubleshooting Rapide
| Problème | Cause probable | Solution |
|----------|----------------|----------|
| `relation "user" does not exist` | Tables non créées | Exécuter migrations ou script create_tables |
| 401 sur /me | JWT manquant/expiré | Relogin, vérifier header Authorization |
| Celery KO dans /health | Worker pas prêt | Vérifier logs `docker compose logs -f celery` |
| Postgres role errors | Volume ancien + nouvelles variables | Reset volume (section 12) |
| Front ne voit pas auth | Token pas dans localStorage / pas d'événement | Vérifier login + event `auth-changed` |

## 17. Roadmap potentielle
- Rate limiting + quotas
- Observabilité (Prometheus exporter, OpenTelemetry)
- Blacklist tokens & rotation
- UI monitoring tâches Celery
- Multi-env (docker-compose.override.yml prod/staging)

---
Bon build !
