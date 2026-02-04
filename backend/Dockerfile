FROM node:24-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

EXPOSE 3000

# Lancer les migrations puis démarrer l'application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]