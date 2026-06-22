# 🗄️ Documentation Base de Données - HomeStock

## 📊 Vue d'ensemble

### Système de gestion
- **SGBD** : PostgreSQL 16
- **ORM** : Prisma 6
- **Schéma** : Voir `prisma/schema.prisma`

### Hiérarchie des données

```
Foyer (Home)
  ├─ Membres (User via Permission)
  │   └─ Liens d'invitation (InviteLink)
  ├─ Inventaire
  │   ├─ Catégories (Category)
  │   │   └─ Sous-catégories (Subcategory)
  │   │       └─ Produits (Product)
  │   │           └─ Unités Physiques (ProductBatch)
  │   └─ Panier (Cart)
  │       └─ Produits dans panier (CartProduct)
  └─ Recettes (Recipe)
      ├─ Ingrédients (RecipeProduct)
      ├─ Étapes (RecipeStep)
      └─ Tags (RecipeTag via RecipeRecipeTag)
```

## 👥 Utilisateurs et Permissions

### Table `users`

Stocke les informations des utilisateurs.

```sql
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname  VARCHAR(100) NOT NULL,
  mail      VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  picture   VARCHAR(255) DEFAULT NULL
);
```

**Champs** :
- `id` - Identifiant unique
- `firstname` - Prénom
- `lastname` - Nom
- `mail` - Email unique pour connexion
- `password` - Hash bcrypt du mot de passe
- `picture` - Chemin vers l'avatar (`/uploads/avatars/...`)

### Table `homes`

Stocke les foyers partagés.

```sql
CREATE TABLE homes (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
```

**Champs** :
- `id` - Identifiant unique
- `name` - Nom du foyer (ex: "Maison principale")

Le propriétaire est déterminé par la table `permissions` (type `owner`), pas par une colonne sur le foyer.

### Table `permissions`

Relie les utilisateurs aux foyers et définit leurs droits.

```sql
CREATE TABLE permissions (
  id      SERIAL PRIMARY KEY,
  userId  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  homeId  INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  type    VARCHAR(20) NOT NULL,  -- 'owner', 'read', 'read-write'
  UNIQUE (userId, homeId)
);
```

**Champs** :
- `userId` - Utilisateur
- `homeId` - Foyer
- `type` - Niveau d'accès : `owner`, `read` ou `read-write`

**Règles** :
- `UNIQUE(userId, homeId)` — un utilisateur ne peut avoir qu'une permission par foyer
- La permission `owner` est créée automatiquement à la création du foyer

### Table `invite_links`

Génère des liens d'invitation temporaires pour partager un foyer.

```sql
CREATE TABLE invite_links (
  id              SERIAL PRIMARY KEY,
  homeId          INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  link            VARCHAR(25) UNIQUE NOT NULL,
  permissionType  VARCHAR(20) NOT NULL DEFAULT 'read-write',
  expirationDate  TIMESTAMP NOT NULL,
  createdAt       TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Champs** :
- `link` - Code d'invitation unique (25 caractères)
- `permissionType` - Niveau d'accès que recevra l'invité (`read` ou `read-write`)
- `expirationDate` - Expiration du lien (7 jours par défaut)

**Exemple d'utilisation** :
1. Membre crée un lien : `POST /invite-links`
2. Partage le code à un ami : `A3xKp9mQrTwZ2nByL7dHj0cVs`
3. Ami rejoint le foyer : `POST /invite-links/use`

## 📦 Inventaire

### Table `categories`

Catégories d'inventaire (Féculents, Fruits & Légumes, Produits laitiers, etc.).

```sql
CREATE TABLE categories (
  id      SERIAL PRIMARY KEY,
  homeId  INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  picture VARCHAR(255) NOT NULL
);

CREATE INDEX ON categories(homeId);
```

**Champs** :
- `homeId` - Foyer propriétaire
- `name` - Nom de la catégorie
- `picture` - Chemin vers l'image (`/uploads/categories/...`)

### Table `subcategories`

Sous-catégories (ex: Pâtes, Riz sous Féculents).

```sql
CREATE TABLE subcategories (
  id         SERIAL PRIMARY KEY,
  categoryId INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL
);

CREATE INDEX ON subcategories(categoryId);
```

**Champs** :
- `categoryId` - Catégorie parente
- `name` - Nom de la sous-catégorie

### Table `products`

Types de produits (ex: "Tagliatelles Barilla 500g").

```sql
CREATE TABLE products (
  id            SERIAL PRIMARY KEY,
  homeId        INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  subcategoryId INTEGER NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  picture       VARCHAR(255) NOT NULL,
  mass          INTEGER DEFAULT NULL,
  liquid        INTEGER DEFAULT NULL
);

CREATE INDEX ON products(homeId);
CREATE INDEX ON products(subcategoryId);
```

**Champs** :
- `homeId` - Foyer propriétaire
- `subcategoryId` - Sous-catégorie du produit
- `name` - Nom du produit
- `picture` - Chemin vers l'image (`/uploads/products/...`)
- `mass` - Masse en grammes (optionnel)
- `liquid` - Volume en millilitres (optionnel)

**Exemple** :
```json
{
  "name": "Tagliatelles Barilla 500g",
  "mass": 500,
  "liquid": null,
  "picture": "/uploads/products/tagliatelle.jpg"
}
```

### Table `product_batches` ⭐

**CONCEPT CLEF** : Chaque ligne représente une **unité physique réelle** dans la maison.

```sql
CREATE TABLE product_batches (
  id             SERIAL PRIMARY KEY,
  productId      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  homeId         INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  expirationDate DATE DEFAULT NULL
);

CREATE INDEX ON product_batches(homeId, productId);
CREATE INDEX ON product_batches(expirationDate);
```

**Champs** :
- `productId` - Le type de produit
- `homeId` - Où c'est stocké
- `expirationDate` - Date limite de consommation (optionnelle)

**Exemple** :
```
Product: Tagliatelles Barilla 500g (ID: 5)
  ├─ Batch 1: expires 2025-05-15
  ├─ Batch 2: expires 2025-04-20
  └─ Batch 3: expires 2025-06-10
```

**Stock dynamique** = Comptage des batches pour ce produit

**Query pour le stock** :
```sql
SELECT COUNT(*) AS stock
FROM product_batches
WHERE productId = 5 AND homeId = 1;
```

### Table `carts`

Un panier par foyer.

```sql
CREATE TABLE carts (
  id     SERIAL PRIMARY KEY,
  homeId INTEGER NOT NULL UNIQUE REFERENCES homes(id) ON DELETE CASCADE
);
```

**Points** :
- `UNIQUE(homeId)` — un seul panier par foyer
- Créé automatiquement à la première requête si inexistant

### Table `cart_products`

Produits dans le panier (types de produits, pas les unités physiques).

```sql
CREATE TABLE cart_products (
  id        SERIAL PRIMARY KEY,
  cartId    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity  INTEGER NOT NULL DEFAULT 1,
  checked   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (cartId, productId)
);

CREATE INDEX ON cart_products(cartId);
```

**Champs** :
- `quantity` - Nombre d'unités à acheter
- `checked` - Produit coché dans la liste de courses

**Workflow** :
1. Ajouter au panier : INSERT dans `cart_products`
2. Valider les achats : Crée les lignes dans `product_batches` + supprime les lignes cochées de `cart_products`

## 👨‍🍳 Recettes

### Table `recipes`

Recettes de cuisine.

```sql
CREATE TABLE recipes (
  id          SERIAL PRIMARY KEY,
  homeId      INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  picture     VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  createdAt   TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ON recipes(homeId);
```

**Champs** :
- `homeId` - Foyer propriétaire
- `name` - Nom de la recette
- `picture` - Chemin vers l'image (`/uploads/recipes/...`)
- `description` - Description ou instructions générales

### Table `recipe_products`

Ingrédients d'une recette (lien entre recette et produit).

```sql
CREATE TABLE recipe_products (
  id             SERIAL PRIMARY KEY,
  recipeId       INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  productId      INTEGER NOT NULL REFERENCES products(id),
  quantityNeeded INTEGER DEFAULT NULL,
  multipliable   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (recipeId, productId)
);

CREATE INDEX ON recipe_products(recipeId);
```

**Champs** :
- `productId` - Type de produit
- `quantityNeeded` - Quantité de base (ex: 500 pour 500g)
- `multipliable` - Si `true`, la quantité est multipliée par le nombre de portions côté mobile

**Exemple** :
```json
{
  "productId": 5,
  "quantityNeeded": 500,
  "multipliable": true
}
```

### Table `recipe_steps`

Étapes de préparation.

```sql
CREATE TABLE recipe_steps (
  id         SERIAL PRIMARY KEY,
  recipeId   INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  stepNumber INTEGER NOT NULL,
  content    TEXT NOT NULL,
  UNIQUE (recipeId, stepNumber)
);

CREATE INDEX ON recipe_steps(recipeId);
```

**Champs** :
- `stepNumber` - Numéro de l'étape (1, 2, 3…)
- `content` - Description de l'étape

### Table `recipe_tags`

Tags pour catégoriser les recettes (Végétarien, Rapide, Sans gluten, etc.).

```sql
CREATE TABLE recipe_tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);
```

### Table `recipe_recipe_tags`

Table de jonction entre recettes et tags.

```sql
CREATE TABLE recipe_recipe_tags (
  id       SERIAL PRIMARY KEY,
  recipeId INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tagId    INTEGER NOT NULL REFERENCES recipe_tags(id) ON DELETE CASCADE,
  UNIQUE (recipeId, tagId)
);
```

## 🔍 Requêtes courantes

### Stock d'un produit
```sql
SELECT COUNT(*) AS stock
FROM product_batches
WHERE productId = 5 AND homeId = 1;
```

### Produits proches expiration (dans 7 jours)
```sql
SELECT p.name, COUNT(pb.id) AS quantity, MIN(pb.expirationDate) AS next_expiration
FROM products p
JOIN product_batches pb ON p.id = pb.productId
WHERE p.homeId = 1
  AND pb.expirationDate BETWEEN NOW() AND NOW() + INTERVAL '7 days'
GROUP BY p.id, p.name
ORDER BY next_expiration ASC;
```

### Consommation FEFO (First Expired, First Out)
```sql
SELECT * FROM product_batches
WHERE productId = 5 AND homeId = 1
ORDER BY expirationDate ASC NULLS LAST
LIMIT 1;
```

### Panier pour un foyer
```sql
SELECT c.id, p.name, cp.quantity, cp.checked
FROM carts c
JOIN cart_products cp ON c.id = cp.cartId
JOIN products p ON cp.productId = p.id
WHERE c.homeId = 1;
```

### Recettes dont tous les ingrédients sont en stock
```sql
SELECT r.id, r.name,
  COUNT(DISTINCT rp.id) AS ingredient_count,
  SUM(CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END) AS available_ingredients
FROM recipes r
LEFT JOIN recipe_products rp ON r.id = rp.recipeId
LEFT JOIN product_batches pb ON rp.productId = pb.productId AND pb.homeId = 1
WHERE r.homeId = 1
GROUP BY r.id, r.name
HAVING SUM(CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END) >= COUNT(DISTINCT rp.id);
```

## 📈 Migrations

Les migrations Prisma sont stockées dans `prisma/migrations/`.

### Appliquer les migrations
```bash
npx prisma migrate deploy
```

### Créer une migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset complet
```bash
npx prisma migrate reset
```

## 📊 Diagramme des relations

```
users
  └─ N:N homes (via permissions)

homes
  ├─ 1:N categories
  ├─ 1:N products
  ├─ 1:N product_batches
  ├─ 1:1 carts
  ├─ 1:N recipes
  ├─ 1:N permissions
  └─ 1:N invite_links

permissions
  ├─ N:1 users
  └─ N:1 homes

invite_links
  └─ N:1 homes

categories
  ├─ N:1 homes
  └─ 1:N subcategories

subcategories
  ├─ N:1 categories
  └─ 1:N products

products
  ├─ N:1 homes
  ├─ N:1 subcategories
  ├─ 1:N product_batches
  ├─ 1:N cart_products
  └─ 1:N recipe_products

product_batches
  ├─ N:1 products
  └─ N:1 homes

carts
  ├─ N:1 homes
  └─ 1:N cart_products

cart_products
  ├─ N:1 carts
  └─ N:1 products

recipes
  ├─ N:1 homes
  ├─ 1:N recipe_products
  ├─ 1:N recipe_steps
  └─ N:N recipe_tags (via recipe_recipe_tags)

recipe_products
  ├─ N:1 recipes
  └─ N:1 products

recipe_steps
  └─ N:1 recipes

recipe_tags
  └─ N:N recipes (via recipe_recipe_tags)

recipe_recipe_tags
  ├─ N:1 recipes
  └─ N:1 recipe_tags
```

## 🎯 Règles métier

### Stock
- Un produit n'a pas de "quantité" stockée directement
- Le stock = nombre de `product_batches` pour ce produit
- Chaque batch a sa propre date d'expiration (optionnelle)
- La consommation suit le principe FEFO : les unités avec la date la plus proche sont retirées en premier

### Panier
- Un seul panier par foyer, créé automatiquement à la première utilisation
- Le panier contient des `cart_products` (types de produits, pas des unités physiques)
- Valider un achat crée les `product_batches` correspondants et supprime les lignes cochées du panier

### Recettes
- Liées aux types de produits (`Product`), pas aux unités physiques (`ProductBatch`)
- Les ingrédients `multipliable: true` voient leur quantité adaptée au nombre de portions côté mobile
- Les tags permettent de filtrer les recettes par catégorie (Végétarien, Rapide, etc.)

## 🔒 Contraintes et Index

### Contraintes d'intégrité
- `users.mail` UNIQUE
- `permissions(userId, homeId)` UNIQUE — un utilisateur ne peut avoir qu'un rôle par foyer
- `invite_links.link` UNIQUE
- `cart_products(cartId, productId)` UNIQUE — un produit une seule fois par panier
- `recipe_products(recipeId, productId)` UNIQUE — un produit une seule fois par recette
- `recipe_steps(recipeId, stepNumber)` UNIQUE — numéros d'étapes uniques par recette
- `recipe_tags.name` UNIQUE
- `recipe_recipe_tags(recipeId, tagId)` UNIQUE

### Index pour performance
- `categories(homeId)` — lister les catégories d'un foyer
- `subcategories(categoryId)` — lister les sous-catégories
- `products(homeId)`, `products(subcategoryId)` — lister les produits
- `product_batches(homeId, productId)`, `product_batches(expirationDate)` — recherches stock/FEFO
- `cart_products(cartId)` — lister les produits du panier
- `recipes(homeId)` — lister les recettes
- `recipe_products(recipeId)` — ingrédients d'une recette
- `recipe_steps(recipeId)` — étapes d'une recette
