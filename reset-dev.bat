@echo off
echo 🧹 Nettoyage complet de l'environnement de développement
echo ========================================================

echo 🛑 Arrêt des conteneurs...
docker-compose -f docker-compose.development.yml down -v

echo 🗑️  Suppression des volumes...
docker volume prune -f

echo 🔄 Redémarrage de l'environnement...
call dev-start.bat

echo.
echo ✅ Nettoyage terminé !
echo.
echo 📱 Instructions pour nettoyer le navigateur :
echo    1. Ouvrez http://localhost:3000
echo    2. Appuyez sur F12 (Outils de développement)
echo    3. Allez dans Application ^> Local Storage ^> http://localhost:3000
echo    4. Supprimez toutes les clés (surtout 'access_token')
echo    5. Rafraîchissez la page (F5)
echo.
echo 🆕 Pour créer un compte de test :
echo    1. Allez sur http://localhost:3000
echo    2. Cliquez sur "Register"
echo    3. Créez un compte avec : test@example.com / motdepasse
echo.
pause