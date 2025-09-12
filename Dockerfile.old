FROM python:3.11

# Assure que les logs s'affichent en temps réel
ENV PYTHONUNBUFFERED=1

# Installer dépendances système + Node.js 20
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates lsb-release && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x $(lsb_release -cs) main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Crée le dossier de l'application
WORKDIR /app

# Copie des fichiers pour installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY package*.json ./
RUN npm install

# Copie le reste du code source
COPY . .

# # Copie le script entrypoint dans l'image
# COPY entrypoint.sh /entrypoint.sh

# # Rends le script exécutable
# RUN chmod +x /entrypoint.sh

# Port exposé
EXPOSE 5000

# Démarrage en mode debug (hot reload)
# ENTRYPOINT ["/entrypoint.sh"]

CMD ["flask", "--app=app", "--debug", "run", "--host=0.0.0.0"]