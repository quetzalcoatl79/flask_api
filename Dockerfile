FROM python:3.11

# Assure que les logs s'affichent en temps réel
ENV PYTHONUNBUFFERED=1

# Crée le dossier de l'application
WORKDIR /app

# Copie des fichiers pour installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie le reste du code source
COPY . .

# Port exposé pour l'API Flask
EXPOSE 5000

# Démarrage en mode debug (hot reload)
CMD ["flask", "--app=app", "--debug", "run", "--host=0.0.0.0"]