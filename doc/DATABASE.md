# 🗄️ Documentation Base de Données - HomeStock

## 📊 Vue d'ensemble

### Système de gestion
- **SGBD** : MySQL 8.0
- **ORM** : Prisma
- **Schéma** : Voir `prisma/schema.prisma`

### Hiérarchie des données

```
Foyer (Home)
  ├─ Utilisateurs (User + UserHome + Permission)
  ├─ Inventaire
  │   ├─ Catégories (Category)
  │   │   └─ Sous-catégories (Subcategory)
  │   │       └─ Produits (Product)
  │   │           └─ Unités Physiques (ProductBatch)
  │   └─ Panier (Cart)
  │       └─ Produits dans panier (CartProduct)
  └─ Recettes (Recipe)
      ├─ Ingrédients (RecipeIngredient)
      └─ Étapes (RecipeStep)
```

## 👥 Utilisateurs et Permissions

### Table `users`

Stocke les informations des utilisateurs.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  picture VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Champs** :
- `id` - Identifiant unique
- `email` - Email unique pour connexion
- `password` - Hash bcrypt du mot de passe
- `firstname` - Prénom
- `lastname` - Nom
- `picture` - URL de l'avatar
- `createdAt` - Date de création
- `updatedAt` - Dernière modification

### Table `homes`

Stocke les foyers/maisons.

```sql
CREATE TABLE homes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ownerId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
);
```

**champs** :
- `id` - Identifiant unique
- `ownerId` - Propriétaire du foyer (User)
- `name` - Nom du foyer (ex: "Maison principale")
- `createdAt` - Date de création
- `updatedAt` - Dernière modification

### Table `user_homes` (Relation)

Relie les utilisateurs aux foyers et définit leurs permissions.

```sql
CREATE TABLE user_homes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  homeId INT NOT NULL,
  role ENUM('owner', 'member') DEFAULT 'member',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE,
  UNIQUE(userId, homeId)
);
```

**Champs** :
- `userId` - Utilisateur
- `homeId` - Foyer
- `role` - `owner` ou `member`

**Rôles** :
- `owner` : Créateur du foyer, permissions complètes
- `member` : Invité, permissions restreintes

### Table `invite_links`

Génère des liens d'invitation temporaires pour partager un foyer.

```sql
CREATE TABLE invite_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homeId INT NOT NULL,
  code VARCHAR(32) UNIQUE NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  INDEX(expiresAt)
);
```

**Champs** :
- `code` - Code d'invitation unique (36 caractères)
- `expiresAt` - Expiration du lien
- `createdBy` - Utilisateur qui a créé le lien

**Exemple d'utilisation** :
1. Owner crée un lien : `POST /permissions/home/:id/invite`
2. Lien email à l'ami : `https://app.com/invite/ABC123XYZ`
3. Ami utilise le lien : `POST /permissions/home/:id/join?code=ABC123XYZ`

## 📦 Inventaire

### Table `categories`

Catégories d'inventaire (Fruits, Viandes, Pâtes, etc.).

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homeId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  picture VARCHAR(255) DEFAULT '/uploads/categories/default.jpg',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE,
  INDEX(homeId)
);
```

**Champs** :
- `homeId` - Foyer propriétaire
- `name` - Nom de la catégorie
- `picture` - Image de la catégorie
- Index sur `homeId` pour performances

### Table `subcategories`

Sous-catégories (Légumes, Fruits rouges sous Fruits).

```sql
CREATE TABLE subcategories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoryId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX(categoryId)
);
```

**Champs** :
- `categoryId` - Catégorie parent
- `name` - Nom de la sous-catégorie

### Table `products`

Types de produits (ex: "Tagliatelles Barilla 500g").

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homeId INT NOT NULL,
  subcategoryId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture VARCHAR(255) DEFAULT NULL,
  mass INT DEFAULT NULL,
  liquid INT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE,
  FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE CASCADE,
  INDEX(subcategoryId),
  INDEX(homeId)
);
```

**Champs** :
- `homeId` - Foyer propriétaire
- `subcategoryId` - Sous-catégorie du produit
- `name` - Nom du produit
- `picture` - Image du produit
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
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  homeId INT NOT NULL,
  expirationDate DATE DEFAULT NULL,
  purchaseDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE,
  INDEX(productId),
  INDEX(homeId),
  INDEX(expirationDate)
);
```

**Champs** :
- `productId` - Le type de produit
- `homeId` - Où c'est stocké
- `expirationDate` - Date limite de consommation
- `purchaseDate` - Date d'achat
- Indexes sur `expirationDate` pour recherches FEFO rapides

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
SELECT COUNT(*) as stock 
FROM product_batches 
WHERE productId = 5 AND homeId = 1 AND expirationDate > NOW();
```

### Table `carts`

Un panier par foyer.

```sql
CREATE TABLE carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homeId INT NOT NULL UNIQUE,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE
);
```

**Points** :
- Une seule ligne par foyer
- `UNIQUE(homeId)` - Un seul panier par foyer
- Créé automatiquement lors de la création du foyer

### Table `cart_products` (Relation)

Produits dans le panier (pas les unités).

```sql
CREATE TABLE cart_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cartId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT DEFAULT 1,
  suggestedExpirationDate DATE DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(cartId, productId),
  INDEX(cartId)
);
```

**Champs** :
- `quantity` - Nombre d'unités à acheter
- `suggestedExpirationDate` - Date suggestion pour ces unités

**Workflow** :
1. Ajouter au panier : INSERT dans `cart_products`
2. Validation panier : Crée les rows dans `product_batches` + DELETE dans `cart_products`

## 👨‍🍳 Recettes

### Table `recipes`

Recettes de cuisine.

```sql
CREATE TABLE recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homeId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  picture VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homeId) REFERENCES homes(id) ON DELETE CASCADE,
  INDEX(homeId)
);
```

**Champs** :
- `homeId` - Foyer propriétaire
- `name` - Nom de la recette
- `description` - Description/instructions
- `picture` - Image de la recette

### Table `recipe_ingredients`

Ingrédients d'une recette.

```sql
CREATE TABLE recipe_ingredients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipeId INT NOT NULL,
  productId INT NOT NULL,
  quantityNeeded INT DEFAULT NULL,
  multipliable BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(recipeId, productId),
  INDEX(recipeId)
);
```

**Champs** :
- `productId` - Type de produit
- `quantityNeeded` - Quantité de base (ex: 500 pour 500g)
- `multipliable` - Peut être adapté aux portions

**Exemple** :
```json
{
  "productId": 5,        // Tagliatelles Barilla 500g
  "quantityNeeded": 500, // 500g pour 4 portions
  "multipliable": true   // Peut augmenter pour plus de portions
}
```

### Table `recipe_steps`

Étapes de préparation.

```sql
CREATE TABLE recipe_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipeId INT NOT NULL,
  stepNumber INT NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(recipeId, stepNumber),
  INDEX(recipeId)
);
```

**Champs** :
- `stepNumber` - Numéro de l'étape (1, 2, 3...)
- `content` - Description de l'étape

## 🔍 Requêtes courantes

### Stock d'un produit
```sql
SELECT COUNT(*) as stock 
FROM product_batches 
WHERE productId = 5 
AND homeId = 1 
AND expirationDate > NOW();
```

### Produits proches expiration (dans 7 jours)
```sql
SELECT p.*, COUNT(pb.id) as quantity
FROM products p
LEFT JOIN product_batches pb ON p.id = pb.productId
WHERE p.homeId = 1 
AND pb.expirationDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
GROUP BY p.id
ORDER BY pb.expirationDate ASC;
```

### Consommation FEFO (First Expired, First Out)
```sql
SELECT * FROM product_batches
WHERE productId = 5 AND homeId = 1
ORDER BY expirationDate ASC
LIMIT 1;
```

### Panier pour un foyer
```sql
SELECT c.id, p.name, cp.quantity, cp.suggestedExpirationDate
FROM carts c
JOIN cart_products cp ON c.id = cp.cartId
JOIN products p ON cp.productId = p.id
WHERE c.homeId = 1;
```

### Recettes consommables (tous ingrédients en stock)
```sql
SELECT r.id, r.name,
  COUNT(DISTINCT ri.id) as ingredient_count,
  SUM(CASE 
    WHEN pb.id IS NOT NULL THEN 1 
    ELSE 0 
  END) as available_ingredients
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipeId
LEFT JOIN product_batches pb 
  ON ri.productId = pb.productId 
  AND pb.homeId = 1 
  AND pb.expirationDate > NOW()
WHERE r.homeId = 1
GROUP BY r.id
HAVING available_ingredients >= ingredient_count;
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
  ├─ 1:N homes (ownerId)
  ├─ 1:N user_homes (userId)
  └─ 1:N invite_links (createdBy)

homes
  ├─ N:1 users (ownerId)
  ├─ 1:N categories
  ├─ 1:N products
  ├─ 1:N product_batches
  ├─ 1:N carts
  ├─ 1:N recipes
  └─ 1:N user_homes

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
  └─ 1:N recipe_ingredients

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
  ├─ 1:N recipe_ingredients
  └─ 1:N recipe_steps

recipe_ingredients
  ├─ N:1 recipes
  └─ N:1 products

recipe_steps
  └─ N:1 recipes

invite_links
  ├─ N:1 homes
  └─ N:1 users (createdBy)

user_homes
  ├─ N:1 users
  └─ N:1 homes
```

## 🎯 Règles métier

### Stock
- Un produit n'a pas de "quantité" stockée
- Le stock = nombre de `product_batches` valides (expiration > maintenant)
- Chaque batch a sa propre date d'expiration

### Panier
- Un seul panier créé par foyer
- Le panier contient des `cart_products` (types de produits)
- La validation crée les `product_batches` réels

### Recettes
- Liées aux types de produits (Product), pas aux batches
- Ingrédients peuvent être "multipliables" pour adapter aux portions
- Consommation respecte FEFO (plus vieux batches d'abord)

## 🔒 Contraintes et Indexes

### Contraintes d'intégrité
- `users.email` UNIQUE
- `homes.ownerId` NOT NULL
- `user_homes(userId, homeId)` UNIQUE - Un utilisateur ne peut être dans un foyer qu'une fois
- `cart_products(cartId, productId)` UNIQUE - Un produit une seule fois par panier
- `recipe_ingredients(recipeId, productId)` UNIQUE
- `recipe_steps(recipeId, stepNumber)` UNIQUE

### Indexes pour performance
- `categories(homeId)` - Lister les catégories d'un foyer
- `subcategories(categoryId)` - Lister sous-cats
- `products(subcategoryId, homeId)` - Lister produits
- `product_batches(productId, homeId, expirationDate)` - Recherches stock/FEFO
- `carts(homeId)` UNIQUE
- `cart_products(cartId, productId)` UNIQUE
- `recipes(homeId)` - Lister recettes
- `recipe_ingredients(recipeId, productId)` UNIQUE
- `recipe_steps(recipeId)` avec UNIQUE stepNumber
- `invite_links(expiresAt)` - Nettoyer liens expirés
