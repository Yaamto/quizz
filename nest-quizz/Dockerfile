# Dockerfile-nestjs
FROM node:21

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier les autres fichiers du projet
COPY . .

# Exposer le port sur lequel l'application va s'exécuter
EXPOSE 3000

# Commande pour exécuter l'application en mode développement
CMD ["npm", "run", "start:dev"]
