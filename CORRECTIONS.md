# HomeStock - Corrections Docker et Prisma

## ✅ Problèmes corrigés

### 1. **MySQL → PostgreSQL**
- Le docker-compose.yml utilisait MySQL mais Prisma était configuré pour PostgreSQL
- **Solution** : Remplacement complet de MySQL par PostgreSQL 16
- pgAdmin remplace phpMyAdmin

### 2. **Versions Prisma incompatibles**
- `@prisma/client` était en v7.3.0 mais `prisma` en v6.19.2
- **Solution** : Synchronisation des deux packages à la version 6.19.2

### 3. **Fichier prisma.config.ts problématique**
- Ce fichier interférait avec la génération du client Prisma
- **Solution** : Suppression du fichier, utilisation de la configuration standard

### 4. **PrismaService manquant**
- Aucun service Prisma n'était configuré dans NestJS
- **Solution** : Création de `prisma.service.ts` et intégration dans les modules

### 5. **Schema Prisma complet**
- Le schema était vide
- **Solution** : Génération complète du schema basé sur `db.sql` avec tous les modèles :
  - Users, Homes, Permissions
  - Categories, Subcategories, Products
  - ProductBatches (stock réel)
  - Carts, CartProducts
  - Recipes, RecipeProducts, RecipeSteps, RecipeTags

## 🚀 Pour démarrer

```bash
# Démarrer tous les services
docker compose up --build

# Ou en arrière-plan
docker compose up -d
```

## 📋 Services disponibles

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:3000 | API NestJS |
| Frontend Mobile | http://localhost:8081 | App Expo React Native |
| pgAdmin | http://localhost:8080 | Interface PostgreSQL |
| PostgreSQL | localhost:5432 | Base de données |

## 🔑 Identifiants pgAdmin

- **Email** : admin@homestock.com
- **Mot de passe** : admin123

### Configuration serveur PostgreSQL dans pgAdmin

- **Host** : backend_db
- **Port** : 5432
- **Database** : homestock_db
- **Username** : homestock_user
- **Password** : Q6G3qRau5Td9C2z2I3rr

## 📁 Fichiers modifiés

- [docker-compose.yml](docker-compose.yml) - Migration PostgreSQL
- [backend/Dockerfile](backend/Dockerfile) - Génération Prisma
- [backend/package.json](backend/package.json) - Versions synchronisées
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) - Schema complet
- [backend/src/prisma.service.ts](backend/src/prisma.service.ts) - Service créé
- [backend/src/app.module.ts](backend/src/app.module.ts) - PrismaService ajouté
- [.env](.env) - Variables PostgreSQL
- [backend/.env](backend/.env) - DATABASE_URL

## 📚 Documentation supplémentaire

Consultez [DOCKER.md](DOCKER.md) pour les commandes Docker détaillées et le troubleshooting.
