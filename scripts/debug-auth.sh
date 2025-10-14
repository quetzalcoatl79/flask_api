#!/bin/bash

# Script pour diagnostiquer et corriger le problème de connexion automatique

echo "🔍 Diagnostic du problème de connexion automatique"
echo "================================================"

echo ""
echo "1. Vérification de l'état de la base de données..."

# Vérifier les utilisateurs dans la base de données
echo "📊 Utilisateurs existants dans la base de données :"
docker-compose -f docker-compose.development.yml exec -T db psql -U postgres -d flask_api_dev -c "SELECT id, username, email, created_at FROM users;" 2>/dev/null || echo "❌ Impossible de se connecter à la base ou table 'users' n'existe pas"

echo ""
echo "2. Vérification des endpoints API..."

# Test de l'endpoint /me sans token
echo "🔐 Test endpoint /me sans authentification :"
curl -s http://localhost:5000/me | head -1

# Test de l'endpoint /users (s'il existe)
echo ""
echo "👥 Test endpoint /users :"
curl -s http://localhost:5000/api/users | head -1 || echo "Endpoint /api/users non disponible"

echo ""
echo "3. Recommandations pour corriger le problème :"
echo "============================================="
echo ""
echo "🧹 Pour nettoyer le localStorage (côté navigateur) :"
echo "   - Ouvrez les Outils de développement (F12)"
echo "   - Allez dans Application > Local Storage > http://localhost:3000"
echo "   - Supprimez la clé 'access_token' si elle existe"
echo "   - Rafraîchissez la page"
echo ""
echo "🗄️  Pour réinitialiser la base de données :"
echo "   docker-compose -f docker-compose.development.yml exec backend python create_tables.py"
echo ""
echo "🔄 Pour redémarrer complètement l'environnement :"
echo "   docker-compose -f docker-compose.development.yml down -v"
echo "   ./dev-start.bat"
echo ""
echo "📱 Pour créer un nouvel utilisateur de test :"
echo "   curl -X POST http://localhost:5000/api/auth/register \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"test123\"}'"
echo ""