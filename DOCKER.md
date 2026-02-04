# Guide Docker - HomeStock

## Prérequis

- Docker Desktop installé
- Docker Compose installé

## Architecture

Le projet utilise Docker Compose avec 4 services :

1. **backend** : API NestJS avec Prisma ORM
2. **backend_db** : PostgreSQL 16
3. **pgadmin** : Interface web pour gérer PostgreSQL
4. **frontend** : Application mobile Expo React Native

## Démarrage rapide

### 1. Première fois - Build et démarrage

```bash
docker-compose up --build
```

### 2. Démarrages suivants

```bash
docker-compose up
```

### 3. Arrêter les conteneurs

```bash
docker-compose down
```

### 4. Arrêter et supprimer les volumes (ATTENTION : efface la base de données)

```bash
docker-compose down -v
```

## Accès aux services

- **Backend API** : http://localhost:3000
- **Frontend Mobile** : http://localhost:8081
- **pgAdmin** : http://localhost:8080
  - Email : admin@homestock.com
  - Mot de passe : admin123

## Configuration pgAdmin

Pour se connecter à la base de données dans pgAdmin :

1. Ouvrir http://localhost:8080
2. Se connecter avec les identifiants ci-dessus
3. Ajouter un nouveau serveur :
   - **Name** : HomeStock
   - **Host** : backend_db
   - **Port** : 5432
   - **Database** : homestock_db
   - **Username** : homestock_user
   - **Password** : Q6G3qRau5Td9C2z2I3rr

## Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f backend_db
```

### Reconstruire un service spécifique

```bash
docker-compose up --build backend
```

### Exécuter des commandes dans un conteneur

```bash
# Backend - Générer le client Prisma
docker-compose exec backend npx prisma generate

# Backend - Créer une migration
docker-compose exec backend npx prisma migrate dev --name nom_migration

# Backend - Voir le statut des migrations
docker-compose exec backend npx prisma migrate status

# Backend - Shell
docker-compose exec backend sh
```

### Redémarrer un service

```bash
docker-compose restart backend
```

## Prisma

Les migrations Prisma s'exécutent automatiquement au démarrage du backend grâce à la commande :

```bash
npx prisma migrate deploy && npm run start:dev
```

### Créer une nouvelle migration (en développement local)

```bash
docker-compose exec backend npx prisma migrate dev --name ma_nouvelle_migration
```

## Problèmes courants

### Le backend ne démarre pas

1. Vérifier que PostgreSQL est prêt :
   ```bash
   docker-compose logs backend_db
   ```

2. Le backend attend automatiquement que la base soit "healthy" grâce à `depends_on` avec `condition: service_healthy`

### Erreur de connexion à la base de données

Vérifier que la `DATABASE_URL` est correcte dans `.env` :
```
DATABASE_URL="postgresql://homestock_user:Q6G3qRau5Td9C2z2I3rr@backend_db:5432/homestock_db?schema=public"
```

### Recréer complètement la base de données

```bash
docker-compose down -v
docker-compose up --build
```

## Variables d'environnement

Les variables sont définies dans le fichier `.env` à la racine :

```env
DB_BACKEND_USER=homestock_user
DB_BACKEND_PASSWORD=Q6G3qRau5Td9C2z2I3rr
DB_BACKEND_NAME=homestock_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PGADMIN_EMAIL=admin@homestock.com
PGADMIN_PASSWORD=admin123
FRONTEND_PORT=8081
FRONTEND_PORT_2=8082
FRONTEND_PORT_3=8083
```

## Structure des volumes

- `backend_db_data` : Données PostgreSQL persistantes
- `pgadmin_data` : Configuration pgAdmin persistante

## Mode développement

En mode développement, les volumes sont montés pour permettre le hot-reload :

- `./backend:/app` - Le code backend est synchronisé
- `./mobile:/app` - Le code mobile est synchronisé
