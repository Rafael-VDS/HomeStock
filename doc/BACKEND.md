# Documentation technique - Backend

## Stack

- NestJS 11, TypeScript
- PostgreSQL 16
- Prisma 6 (ORM + migrations)
- JWT (Passport)
- Multer (uploads de fichiers)
- class-validator + class-transformer (validation des DTOs)
- Jest (tests)
- Swagger : `/api/docs`

## Lancer le projet

```bash
cd backend
npm install
npm run start:dev   # Démarre avec hot-reload sur le port 3000
```

Avec Docker depuis la racine :

```bash
docker-compose up --build
```

## Configuration globale

**Préfixe global :** toutes les routes sont préfixées par `/api`. Exemple : `POST /auth/register` est accessible à `POST /api/auth/register`.

**ValidationPipe global :**
- `whitelist: true` — les champs non déclarés dans le DTO sont silencieusement supprimés
- `forbidNonWhitelisted: true` — renvoie une erreur si un champ inconnu est envoyé
- `transform: true` — convertit automatiquement les types (string → number, etc.)

**Fichiers statiques :** les uploads sont servis à l'URL `/uploads/...` (ex. `/uploads/products/photo.jpg`).

**Variables d'environnement :**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/homestock_db
JWT_SECRET=clé-secrète-longue-et-aléatoire
BACKEND_PORT=3000
```

---

## Authentification

Toutes les routes marquées "protégée" nécessitent un header :

```
Authorization: Bearer <access_token>
```

Le token JWT contient `{ userId, email }` dans son payload.

Dans les contrôleurs, le décorateur `@CurrentUser()` permet de récupérer le userId directement depuis le token sans faire de requête.

---

## Module Auth

### POST `/auth/register`

Crée un compte utilisateur.

**Body :**
```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "mail": "jean@example.com",
  "password": "motdepasse8chars",
  "picture": "url-optionnelle"
}
```

Contraintes : `password` minimum 8 caractères, `mail` doit être un email valide. Si l'email est déjà utilisé → `409 Conflict`.

**Réponse :**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "firstname": "Jean",
    "lastname": "Dupont",
    "mail": "jean@example.com",
    "picture": null
  }
}
```

### POST `/auth/login`

**Body :**
```json
{
  "mail": "jean@example.com",
  "password": "motdepasse8chars"
}
```

Même réponse que le register. Si email inconnu ou mot de passe incorrect → `401 Unauthorized`.

### GET `/auth/profile` — protégée

Retourne les données de l'utilisateur connecté (extrait du JWT).

```json
{
  "id": 1,
  "firstname": "Jean",
  "lastname": "Dupont",
  "mail": "jean@example.com",
  "picture": null
}
```

---

## Module Users — protégé

### GET `/users`

Retourne tous les utilisateurs (sans les mots de passe).

### GET `/users/search?mail=jean@example.com`

Cherche un utilisateur par email exact. `404` si introuvable.

### GET `/users/:id`

Retourne un utilisateur par son ID. `404` si introuvable.

### GET `/users/:id/permissions`

Retourne les permissions de l'utilisateur (liste de ses foyers et rôles).

```json
[
  {
    "id": 3,
    "userId": 1,
    "homeId": 2,
    "type": "owner",
    "home": { "id": 2, "name": "Chez Dupont" }
  }
]
```

### PATCH `/users/:id`

Met à jour les champs du profil. Tous les champs sont optionnels. Si `mail` est changé et qu'il existe déjà → `409`. Si `password` est fourni, il est hashé automatiquement.

**Body (partiel) :**
```json
{
  "firstname": "Jean-Pierre",
  "lastname": "Martin"
}
```

### PATCH `/users/:id/avatar`

Upload d'avatar. Requête `multipart/form-data` avec le champ `file`.
Formats acceptés : jpg, jpeg, png, gif. Max 5 Mo.
Stocké dans `public/uploads/avatars/`.

Retourne le user mis à jour.

### DELETE `/users/:id`

Supprime l'utilisateur. `404` si introuvable.

---

## Module Homes — protégé

### POST `/homes`

Crée un foyer. L'utilisateur créateur devient automatiquement `owner`.

**Body :**
```json
{
  "name": "Chez Dupont",
  "userId": 1
}
```

### GET `/homes`

Retourne tous les foyers (ordre par ID croissant).

### GET `/homes/:id`

Retourne un foyer spécifique.

### GET `/homes/:id/users`

Retourne les membres du foyer avec leur rôle.

```json
[
  {
    "id": 1,
    "firstname": "Jean",
    "lastname": "Dupont",
    "mail": "jean@example.com",
    "permissionType": "owner",
    "permissionId": 3
  }
]
```

### GET `/homes/:id/categories`

Retourne les catégories du foyer.

### GET `/homes/:id/products`

Retourne tous les produits du foyer avec leur sous-catégorie et catégorie parente.

### PATCH `/homes/:id`

Met à jour le nom du foyer.

### DELETE `/homes/:id`

Supprime le foyer et toutes ses données en cascade.

---

## Module Permissions — protégé

Les types de permission valides : `owner`, `read`, `read-write`.

### POST `/permissions`

**Body :**
```json
{
  "userId": 1,
  "homeId": 2,
  "type": "read-write"
}
```

Si la permission existe déjà pour ce couple userId/homeId → `409 Conflict`.

### GET `/permissions/home/:homeId`

Toutes les permissions d'un foyer (avec les données user associées).

### GET `/permissions/user/:userId`

Toutes les permissions d'un utilisateur (avec les données home associées).

### GET `/permissions/:id`

Une permission par son ID.

### PATCH `/permissions/:id`

Modifie le type de permission (`type` uniquement, pas les IDs).

### DELETE `/permissions/:id`

Supprime la permission — l'utilisateur perd l'accès au foyer.

---

## Module Categories — protégé

### POST `/categories`

Requête `multipart/form-data`. Champ fichier : `picture` (optionnel).
Formats : jpg, jpeg, png, gif, svg. Max 5 Mo. Stocké dans `public/uploads/categories/`.

**Champs de formulaire :**
```
name: string
homeId: number (en string dans le formData, converti automatiquement)
picture: file (optionnel)
```

Retourne la catégorie créée.

### GET `/categories/home/:homeId`

Toutes les catégories d'un foyer avec leurs sous-catégories.

### GET `/categories/:id`

Une catégorie avec ses sous-catégories.

### PATCH `/categories/:id`

Requête `multipart/form-data`. Champs `name` et/ou `picture` (optionnels).

### DELETE `/categories/:id`

Supprime la catégorie et ses sous-catégories en cascade.

---

## Module Subcategories — protégé

### POST `/subcategories`

**Body :**
```json
{
  "categoryId": 1,
  "name": "Pâtes"
}
```

### GET `/subcategories/category/:categoryId`

Toutes les sous-catégories d'une catégorie.

### GET `/subcategories/:id`

Une sous-catégorie avec sa catégorie parente.

### PATCH `/subcategories/:id`

**Body :** `{ "name": "Nouveau nom" }`

### DELETE `/subcategories/:id`

---

## Module Products — routes non protégées

### POST `/products`

Requête `multipart/form-data`. Champ fichier : `image` (optionnel).
Formats : jpg, jpeg, png, gif. Max 5 Mo. Stocké dans `public/uploads/products/`.

**Champs :**
```
name: string
homeId: number
subcategoryId: number
mass: number (optionnel, en grammes)
liquid: number (optionnel, en ml)
image: file (optionnel)
```

**Réponse :**
```json
{
  "id": 5,
  "homeId": 2,
  "subcategoryId": 3,
  "name": "Tagliatelles Barilla 500g",
  "picture": "/uploads/products/abc123.jpg",
  "mass": 500,
  "liquid": null,
  "stockCount": 3,
  "needsToBuy": false,
  "subcategory": {
    "id": 3,
    "name": "Pâtes",
    "categoryId": 1,
    "categoryName": "Féculents"
  },
  "productBatches": [
    {
      "id": 10,
      "productId": 5,
      "homeId": 2,
      "expirationDate": "2025-12-31",
      "daysUntilExpiration": 217,
      "isExpired": false,
      "expiringSoon": false
    }
  ]
}
```

`stockCount` = nombre d'unités disponibles (calculé dynamiquement depuis `productBatches`).
`needsToBuy` = true si `stockCount < 2`.

### GET `/products?homeId=2`

Tous les produits, filtrés optionnellement par foyer.

### GET `/products/to-buy/:homeId`

Produits dont `needsToBuy === true` (stock inférieur à 2 unités).

### GET `/products/subcategory/:subcategoryId`

Produits d'une sous-catégorie.

### GET `/products/:id`

Un produit avec toutes ses données.

### PATCH `/products/:id`

Tous les champs sont optionnels. Si `subcategoryId` est fourni, la sous-catégorie est vérifiée.

### DELETE `/products/:id`

Conditions : le produit ne doit pas avoir de batches ni être dans un panier. Sinon → `400 Bad Request`.

---

## Module Product Batches — routes non protégées

Un `ProductBatch` est une unité physique réelle avec une date d'expiration. C'est ce qui constitue le stock.

### POST `/product-batches`

Ajoute une unité au stock.

**Body :**
```json
{
  "productId": 5,
  "homeId": 2,
  "expirationDate": "2025-12-31"
}
```

`expirationDate` est optionnel (format `YYYY-MM-DD`). `null` si le produit n'a pas de date d'expiration.

**Réponse :**
```json
{
  "id": 12,
  "productId": 5,
  "homeId": 2,
  "expirationDate": "2025-12-31",
  "daysUntilExpiration": 217,
  "isExpired": false,
  "expiringSoon": false,
  "product": { "id": 5, "name": "Tagliatelles Barilla 500g", "picture": "..." }
}
```

`expiringSoon` = true si la date d'expiration est dans moins de 7 jours.

### POST `/product-batches/bulk`

Ajoute plusieurs unités d'un coup (pour un achat de plusieurs exemplaires).

**Body :**
```json
{
  "productId": 5,
  "homeId": 2,
  "quantity": 3,
  "expirationDate": "2025-12-31"
}
```

Retourne un tableau de `ProductBatch`.

### POST `/product-batches/consume`

Consomme des unités selon la règle FEFO (First Expired, First Out) : les unités dont la date d'expiration est la plus proche sont supprimées en premier.

**Body :**
```json
{
  "productId": 5,
  "homeId": 2,
  "quantity": 2
}
```

Si le stock est insuffisant → `400 Bad Request`. Retourne `204 No Content`.

### GET `/product-batches?homeId=2`

Toutes les unités, triées par date d'expiration (la plus proche en premier — ordre FEFO).

### GET `/product-batches/product/:productId`

Toutes les unités d'un produit.

### GET `/product-batches/expired/:homeId`

Unités dont la date d'expiration est dépassée.

### GET `/product-batches/expiring-soon/:homeId`

Unités qui expirent dans les 7 prochains jours.

### GET `/product-batches/:id`

Une unité par son ID.

### PATCH `/product-batches/:id`

Modifie la date d'expiration d'une unité.

**Body :** `{ "expirationDate": "2026-01-15" }`

### DELETE `/product-batches/:id`

Supprime (consomme manuellement) une unité. Retourne `204 No Content`.

---

## Module Cart — routes non protégées

Un seul panier par foyer. Il est créé automatiquement à la première requête si il n'existe pas.

### GET `/cart/:homeId`

Retourne le panier du foyer avec ses produits.

```json
{
  "id": 1,
  "homeId": 2,
  "products": [
    {
      "id": 7,
      "productId": 5,
      "productName": "Tagliatelles Barilla 500g",
      "productPicture": "/uploads/products/abc.jpg",
      "quantity": 2,
      "checked": false,
      "subcategoryId": 3,
      "subcategoryName": "Pâtes"
    }
  ],
  "totalItems": 2,
  "uncheckedItems": 2
}
```

### POST `/cart/:homeId/products`

Ajoute un produit au panier. Si le produit est déjà présent, la quantité est augmentée.

**Body :**
```json
{
  "productId": 5,
  "quantity": 1
}
```

`quantity` vaut 1 par défaut si absent. Retourne le panier mis à jour.

### PATCH `/cart/:homeId/products/:cartProductId`

Met à jour la quantité ou l'état coché d'un produit dans le panier.

**Body (partiel) :**
```json
{
  "quantity": 3,
  "checked": true
}
```

### DELETE `/cart/:homeId/products/:cartProductId`

Retire un produit du panier. Retourne le panier mis à jour.

### DELETE `/cart/:homeId?onlyChecked=true`

Vide le panier. Avec `onlyChecked=true`, supprime uniquement les produits cochés.

---

## Module Invite Links — protégé (sauf /use)

### POST `/invite-links`

Crée un lien d'invitation valable 7 jours.

**Body :**
```json
{
  "homeId": 2,
  "permissionType": "read-write"
}
```

`permissionType` accepte `read` ou `read-write`.

**Réponse :**
```json
{
  "id": 1,
  "homeId": 2,
  "link": "A3xKp9mQrTwZ2nByL7dHj0cVs",
  "permissionType": "read-write",
  "expirationDate": "2025-06-28T00:00:00.000Z",
  "createdAt": "2025-05-28T00:00:00.000Z"
}
```

`link` est un code de 25 caractères.

### GET `/invite-links/home/:homeId`

Retourne les liens actifs (non expirés) du foyer.

### POST `/invite-links/use` — protégée

Permet à un utilisateur de rejoindre un foyer via un code.

**Body :**
```json
{
  "link": "A3xKp9mQrTwZ2nByL7dHj0cVs",
  "userId": 1
}
```

Si le lien est expiré → `400`. Si l'utilisateur est déjà membre → `409`. Sinon, crée la permission et la retourne.

### DELETE `/invite-links/:id`

Supprime un lien d'invitation. Retourne `204 No Content`.

### DELETE `/invite-links/clean/expired`

Supprime tous les liens expirés du système. Retourne `{ "count": 3 }`.

---

## Module Recipes — routes non protégées

### POST `/recipes`

Requête `multipart/form-data`. Champ fichier : `image` (optionnel).
Formats : jpg, jpeg, png, gif, webp. Max 5 Mo. Stocké dans `public/uploads/recipes/`.

**Champs :**
```
name: string
description: string
homeId: number
image: file (optionnel)
tagIds: number[] (optionnel)
```

La recette est créée sans ingrédients ni étapes — on les ajoute ensuite.

**Réponse :**
```json
{
  "id": 3,
  "homeId": 2,
  "name": "Pâtes à la carbonara",
  "picture": "/uploads/recipes/xyz.jpg",
  "description": "Recette italienne classique",
  "ingredients": [],
  "steps": [],
  "tags": [],
  "createdAt": "2025-05-28T10:00:00.000Z",
  "updatedAt": "2025-05-28T10:00:00.000Z"
}
```

### GET `/recipes?homeId=2`

`homeId` est obligatoire. Retourne toutes les recettes du foyer triées par nom.

### GET `/recipes/:id`

Retourne la recette complète avec ingrédients, étapes et tags.

### PATCH `/recipes/:id`

Requête `multipart/form-data`. Champs `name`, `description`, `picture`, `tagIds` optionnels.

### DELETE `/recipes/:id`

Supprime la recette et toutes ses données en cascade. Retourne les données de la recette supprimée.

### POST `/recipes/:recipeId/ingredients`

Ajoute un ingrédient à la recette.

**Body :**
```json
{
  "productId": 5,
  "quantityNeeded": 500,
  "multipliable": true
}
```

`quantityNeeded` est optionnel. `multipliable: true` signifie que la quantité sera multipliée par le nombre de portions côté mobile. Si le produit est déjà ingrédient de cette recette → `400 Bad Request`.

### PATCH `/recipes/:recipeId/ingredients/:productId`

Modifie `quantityNeeded` et/ou `multipliable` d'un ingrédient.

### DELETE `/recipes/:recipeId/ingredients/:productId`

Retire l'ingrédient de la recette.

### POST `/recipes/:recipeId/steps`

Ajoute une étape.

**Body :**
```json
{
  "stepNumber": 1,
  "content": "Faire bouillir l'eau avec du sel"
}
```

`stepNumber` doit être unique dans la recette. Si le numéro existe déjà → `400`.

### PATCH `/recipes/:recipeId/steps/:stepNumber`

**Body :** `{ "content": "Nouveau contenu" }`

### DELETE `/recipes/:recipeId/steps/:stepNumber`

---

## Schéma de base de données (Prisma)

```
User
  id            Int       (PK, autoincrement)
  firstname     String
  lastname      String
  mail          String    (unique)
  password      String    (hashé bcrypt)
  picture       String?

Home
  id            Int       (PK, autoincrement)
  name          String

Permission
  id            Int       (PK, autoincrement)
  userId        Int       (FK → User)
  homeId        Int       (FK → Home)
  type          String    (owner | read | read-write)
  @@unique([userId, homeId])

InviteLink
  id              Int       (PK, autoincrement)
  homeId          Int       (FK → Home, cascade delete)
  link            String    (unique, max 25 chars)
  permissionType  String    (default: "read-write")
  expirationDate  DateTime
  createdAt       DateTime  (default: now)

Category
  id        Int     (PK, autoincrement)
  homeId    Int     (FK → Home)
  name      String
  picture   String

Subcategory
  id          Int     (PK, autoincrement)
  categoryId  Int     (FK → Category)
  name        String

Product
  id              Int     (PK, autoincrement)
  homeId          Int     (FK → Home)
  subcategoryId   Int     (FK → Subcategory)
  name            String
  picture         String
  mass            Int?    (en grammes)
  liquid          Int?    (en ml)

ProductBatch
  id              Int       (PK, autoincrement)
  productId       Int       (FK → Product)
  homeId          Int       (FK → Home)
  expirationDate  DateTime? (date seulement, pas d'heure)
  @@index([homeId, productId])

Cart
  id      Int   (PK, autoincrement)
  homeId  Int   (unique → 1 panier par foyer)

CartProduct
  id          Int     (PK, autoincrement)
  cartId      Int     (FK → Cart)
  productId   Int     (FK → Product)
  quantity    Int     (default: 1)
  checked     Boolean (default: false)
  @@unique([cartId, productId])

Recipe
  id          Int       (PK, autoincrement)
  homeId      Int       (FK → Home)
  name        String
  picture     String
  description String
  createdAt   DateTime  (default: now)
  updatedAt   DateTime  (@updatedAt)

RecipeProduct
  id              Int     (PK, autoincrement)
  recipeId        Int     (FK → Recipe, cascade delete)
  productId       Int     (FK → Product)
  quantityNeeded  Int?
  multipliable    Boolean
  @@unique([recipeId, productId])

RecipeStep
  id          Int     (PK, autoincrement)
  recipeId    Int     (FK → Recipe)
  stepNumber  Int
  content     String
  @@unique([recipeId, stepNumber])

RecipeTag
  id    Int     (PK, autoincrement)
  name  String  (unique)

RecipeRecipeTag
  id        Int   (PK, autoincrement)
  recipeId  Int   (FK → Recipe)
  tagId     Int   (FK → RecipeTag)
  @@unique([recipeId, tagId])
```

---

## Uploads de fichiers

| Type de fichier  | Endpoint                  | Champ    | Dossier de stockage               |
|------------------|---------------------------|----------|-----------------------------------|
| Avatar           | PATCH `/users/:id/avatar` | `picture`| `public/uploads/avatars/`         |
| Image catégorie  | POST/PATCH `/categories`  | `picture`| `public/uploads/categories/`     |
| Image produit    | POST/PATCH `/products`    | `image`  | `public/uploads/products/`       |
| Image recette    | POST/PATCH `/recipes`     | `image`  | `public/uploads/recipes/`        |

Les fichiers sont accessibles via `http://localhost:3000/uploads/<dossier>/<nom-du-fichier>`.

---

## Gestion des erreurs

Un filtre global (`AllExceptionsFilter`) intercepte toutes les exceptions et retourne une réponse standardisée. Un intercepteur de logs (`LoggingInterceptor`) trace chaque requête avec méthode, URL, statut et temps de réponse.

---

## Tests

```bash
npm run test          # Tests unitaires
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Couverture de code
```

---

## Commandes Prisma utiles

```bash
npx prisma migrate dev        # Crée et applique une nouvelle migration en dev
npx prisma migrate deploy     # Applique les migrations en production
npx prisma studio             # Interface graphique pour explorer les données
npx prisma generate           # Régénère le client Prisma (après modification du schéma)
npm run seed                  # Peuple la base avec des données de test
```
