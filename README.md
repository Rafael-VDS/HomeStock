# HomeStock

Application mobile de gestion de stock alimentaire pour la maison. Plusieurs personnes peuvent partager le même foyer, gérer un inventaire commun, tenir une liste de courses et suivre des recettes.

## Ce que fait l'application

Le stock est suivi à l'unité physique : si vous avez trois paquets de pâtes avec des dates d'expiration différentes, l'application les enregistre comme trois entrées distinctes. Quand vous utilisez un ingrédient (via une recette ou manuellement), c'est toujours l'unité qui expire le plus tôt qui est consommée en premier — c'est le principe FEFO (First Expired, First Out).

Les produits sont organisés en catégories et sous-catégories (ex. Féculents > Pâtes > Tagliatelles Barilla 500g). Chaque foyer a ses propres catégories, produits, panier et recettes.

## Stack technique

| Côté    | Technologie                       |
|---------|-----------------------------------|
| Backend | NestJS 11, TypeScript, PostgreSQL |
| ORM     | Prisma                            |
| Auth    | JWT                               |
| Mobile  | React Native 0.81, Expo Router    |
| Infra   | Docker, Docker Compose            |

## Lancer le projet

### Avec Docker

Copiez `.env.example` en `.env` à la racine, adaptez les valeurs si besoin, puis :

```bash
docker-compose up --build   # Première fois
docker-compose up           # Les fois suivantes
docker-compose up -d        # En arrière-plan
```

Services disponibles une fois lancé :

| Service     | URL                              |
|-------------|----------------------------------|
| API         | http://localhost:3000            |
| Swagger     | http://localhost:3000/api/docs   |
| pgAdmin     | http://localhost:8080            |
| PostgreSQL  | localhost:5432                   |

### Sans Docker

**Backend :**
```bash
cd backend
npm install
npm run start:dev
```

**Mobile :**
```bash
cd mobile
npm install
npm start
```

Scannez le QR code avec Expo Go, ou appuyez sur `a` pour Android / `i` pour iOS.

Avant de lancer le mobile, vérifiez que l'URL dans `mobile/config/config.ts` correspond bien à l'adresse IP de la machine qui fait tourner le backend.

## Variables d'environnement

```env
DB_BACKEND_USER=homestock_user
DB_BACKEND_PASSWORD=votre-mot-de-passe
DB_BACKEND_NAME=homestock_db
JWT_SECRET=une-clé-secrète-longue
BACKEND_PORT=3000
PGADMIN_EMAIL=admin@homestock.com
PGADMIN_PASSWORD=votre-mot-de-passe
```

## Docker — commandes utiles

```bash
# Voir les logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f backend_db

# Reconstruire un seul service
docker-compose up --build backend

# Redémarrer un service
docker-compose restart backend

# Ouvrir un shell dans le conteneur backend
docker-compose exec backend sh

# Arrêter tout
docker-compose down

# Arrêter et supprimer les volumes (efface la base de données)
docker-compose down -v
```

## Docker — Prisma dans les conteneurs

Les migrations s'appliquent automatiquement au démarrage du backend (`prisma migrate deploy`). Pour intervenir manuellement :

```bash
# Créer une nouvelle migration
docker-compose exec backend npx prisma migrate dev --name nom_migration

# Voir l'état des migrations
docker-compose exec backend npx prisma migrate status

# Régénérer le client Prisma
docker-compose exec backend npx prisma generate
```

## Docker — pgAdmin

Ouvrez http://localhost:8080 et connectez-vous avec les identifiants `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` du `.env`.

Pour ajouter le serveur PostgreSQL dans pgAdmin :

| Champ    | Valeur          |
|----------|-----------------|
| Host     | `backend_db`    |
| Port     | `5432`          |
| Database | `homestock_db`  |
| Username | `homestock_user`|
| Password | (valeur du `.env`) |

Le host est `backend_db` et non `localhost` — c'est le nom du service Docker.

## Docker — problèmes courants

**Le backend ne démarre pas** : PostgreSQL n'est peut-être pas encore prêt. Le `depends_on` avec `condition: service_healthy` est censé l'éviter, mais en cas de doute vérifiez les logs avec `docker-compose logs backend_db`.

**Erreur de connexion à la base** : Vérifiez que la `DATABASE_URL` dans `.env` est correcte :
```
DATABASE_URL="postgresql://homestock_user:motdepasse@backend_db:5432/homestock_db?schema=public"
```

**Repartir de zéro** :
```bash
docker-compose down -v
docker-compose up --build
```

## Structure du projet

```
HomeStock/
├── backend/        # API NestJS
├── mobile/         # Application React Native / Expo
├── doc/
│   ├── BACKEND.md  # Modules, routes, schéma BDD, uploads
│   ├── DATABASE.md # Schéma SQL, relations, requêtes courantes
│   ├── DOCKER.md   # Services, commandes, pgAdmin
│   └── MOBILE.md   # Écrans, navigation, appels API, build
├── docker-compose.yml
└── .env.example
```

## Documentation

- [Backend](./doc/BACKEND.md) — modules, routes, base de données, uploads
- [Base de données](./doc/DATABASE.md) — schéma SQL, relations, requêtes courantes
- [Docker](./doc/DOCKER.md) — services, commandes, pgAdmin
- [Mobile](./doc/MOBILE.md) — écrans, navigation, appels API, build
