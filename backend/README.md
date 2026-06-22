# HomeStock — Backend

API REST du projet HomeStock, construite avec NestJS et PostgreSQL.

## Stack

- NestJS 11, TypeScript
- PostgreSQL 16
- Prisma 6 (ORM + migrations)
- JWT (Passport)
- Multer (uploads de fichiers)
- Swagger : `http://localhost:3000/api/docs`

## Lancer le backend

### Sans Docker

```bash
npm install
npm run start:dev
```

Le serveur démarre sur `http://localhost:3000`.

### Avec Docker (depuis la racine du projet)

```bash
docker-compose up --build
```

## Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL=postgresql://homestock_user:votre-mot-de-passe@localhost:5432/homestock_db
JWT_SECRET=une-clé-secrète-longue-et-aléatoire
BACKEND_PORT=3000
```

## Commandes utiles

```bash
npm run start:dev      # Démarre avec hot-reload
npm run build          # Compile pour la production
npm run test           # Tests unitaires
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Couverture de code
```

```bash
npx prisma migrate dev --name nom    # Crée une migration
npx prisma migrate deploy            # Applique les migrations
npx prisma studio                    # Interface graphique BDD
npm run seed                         # Peuple la base avec des données de test
```

## Documentation

- [Modules et routes API](../doc/BACKEND.md)
- [Base de données](../doc/DATABASE.md)
- [Docker](../doc/DOCKER.md)
- [Architecture NestJS](./ARCHITECTURE.md)
