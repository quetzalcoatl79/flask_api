FROM python:3.11

# Installer dépendances système + Node.js 20
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates lsb-release && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x $(lsb_release -cs) main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier les fichiers de l'app
COPY . .

# Installer les dépendances NPM et compiler Tailwind
RUN npm install && npm run build

# Exposer le port de Flask
EXPOSE 5000

# Démarrer l'application Flask
CMD ["flask", "run", "--host=0.0.0.0", "--reload"]
