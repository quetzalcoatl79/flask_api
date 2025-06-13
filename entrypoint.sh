#!/bin/bash
set -e

# # Extraire host et port depuis DATABASE_URL
# DB_HOST=$(echo $DATABASE_URL | sed -E 's/^.+:\/\/.+:.+@([^:]+):([0-9]+)\/.+$/\1/')
# DB_PORT=$(echo $DATABASE_URL | sed -E 's/^.+:\/\/.+:.+@([^:]+):([0-9]+)\/.+$/\2/')

# # Attendre que PostgreSQL soit prêt
# echo "⏳ Attente de la base de données à $DB_HOST:$DB_PORT..."
# while ! nc -z "$DB_HOST" "$DB_PORT"; do
#  echo "🔄 En attente de la base de données..."
#   sleep 0.2
# done
# echo "✅ Base de données disponible."

# # Appliquer les migrations
# echo "🛠️ Migration de la base de données..."
# flask db upgrade

# Lancer npm watch en arrière-plan, puis Flask en mode debug avec reload
echo "🚀 Démarrage du watcher frontend et de Flask..."
npm run watch &

exec flask run --host=0.0.0.0 --reload
