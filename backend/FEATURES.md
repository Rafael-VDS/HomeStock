# 🎯 Features - HomeStock API

> Architecture des modules à implémenter basée sur le schéma Prisma

## 📋 Vue d'ensemble

Le projet HomeStock nécessite les modules suivants, organisés par ordre de priorité :

---

## ✅ MODULE 1 : Users
**Statut** : 🔵 EN COURS

Gestion des utilisateurs de l'application.

### Modèle Prisma
```prisma
model User {
  id          Int          @id @default(autoincrement())
  firstname   String
  lastname    String
  mail        String
  picture     String?
  password    String
  permissions Permission[]
}
```

### Endpoints à créer
- `POST /users` - Créer un utilisateur
- `GET /users` - Liste de tous les utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `PATCH /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur
- `GET /users/:id/permissions` - Permissions d'un utilisateur
- `GET /users/search?mail=xxx` - Rechercher par email

### DTOs nécessaires
- `CreateUserDto`
- `UpdateUserDto`

---

## 📦 MODULE 2 : Homes
**Statut** : ⚪ À FAIRE

Gestion des maisons/foyers partagés entre utilisateurs.

### Modèle Prisma
```prisma
model Home {
  id              Int              @id @default(autoincrement())
  name            String
  permissions     Permission[]
  categories      Category[]
  products        Product[]
  productBatches  ProductBatch[]
  cart            Cart?
  recipes         Recipe[]
}
```

### Endpoints à créer
- `POST /homes` - Créer une maison
- `GET /homes` - Liste des maisons
- `GET /homes/:id` - Détails d'une maison
- `PATCH /homes/:id` - Modifier une maison
- `DELETE /homes/:id` - Supprimer une maison
- `GET /homes/:id/users` - Utilisateurs d'une maison (via permissions)
- `GET /homes/:id/categories` - Catégories d'une maison
- `GET /homes/:id/products` - Produits d'une maison

---

## 🔐 MODULE 3 : Permissions
**Statut** : ⚪ À FAIRE

Gestion des droits d'accès (User ↔ Home).

### Modèle Prisma
```prisma
model Permission {
  id      Int    @id @default(autoincrement())
  userId  Int
  homeId  Int
  type    String  // "admin", "member", "viewer"
  user    User   @relation(fields: [userId], references: [id])
  home    Home   @relation(fields: [homeId], references: [id])
  @@unique([userId, homeId])
}
```

### Endpoints à créer
- `POST /permissions` - Ajouter un utilisateur à une maison
- `GET /permissions/home/:homeId` - Permissions d'une maison
- `GET /permissions/user/:userId` - Permissions d'un utilisateur
- `PATCH /permissions/:id` - Modifier le type de permission
- `DELETE /permissions/:id` - Retirer un utilisateur d'une maison

---

## 📂 MODULE 4 : Categories & Subcategories
**Statut** : ⚪ À FAIRE

Organisation hiérarchique des produits.

### Modèles Prisma
```prisma
model Category {
  id             Int            @id @default(autoincrement())
  homeId         Int
  name           String
  picture        String
  subcategories  Subcategory[]
}

model Subcategory {
  id                     Int                     @id @default(autoincrement())
  categoryId             Int
  name                   String
  subcategoriesProducts  SubcategoryProduct[]
}
```

### Endpoints à créer
**Categories**
- `POST /categories` - Créer une catégorie
- `GET /categories/home/:homeId` - Catégories d'une maison
- `GET /categories/:id` - Détails
- `PATCH /categories/:id` - Modifier
- `DELETE /categories/:id` - Supprimer

**Subcategories**
- `POST /subcategories` - Créer une sous-catégorie
- `GET /subcategories/category/:categoryId` - Sous-catégories d'une catégorie
- `PATCH /subcategories/:id` - Modifier
- `DELETE /subcategories/:id` - Supprimer

---

## 🛒 MODULE 5 : Products
**Statut** : ⚪ À FAIRE (REPORTÉ)

Gestion du catalogue de produits.

### Modèle Prisma
```prisma
model Product {
  id                     Int                  @id @default(autoincrement())
  homeId                 Int
  name                   String
  picture                String
  mass                   Int?      // grammes
  liquid                 Int?      // ml
  subcategoriesProducts  SubcategoryProduct[]
  productBatches         ProductBatch[]
  cartProducts           CartProduct[]
  recipeProducts         RecipeProduct[]
}
```

### Endpoints à créer
- `POST /products` - Créer un produit
- `GET /products/home/:homeId` - Produits d'une maison
- `GET /products/:id` - Détails
- `PATCH /products/:id` - Modifier
- `DELETE /products/:id` - Supprimer
- `GET /products/:id/stock` - Stock disponible (count de productBatches)
- `GET /products/search?name=xxx` - Recherche par nom

---

## 📊 MODULE 6 : ProductBatches (Stock)
**Statut** : ⚪ À FAIRE

Gestion du stock réel (unités physiques avec dates de péremption).

### Modèle Prisma
```prisma
model ProductBatch {
  id             Int       @id @default(autoincrement())
  productId      Int
  homeId         Int
  expirationDate DateTime?
}
```

### Endpoints à créer
- `POST /product-batches` - Ajouter un lot (nouvelle unité)
- `GET /product-batches/home/:homeId` - Stock d'une maison
- `GET /product-batches/product/:productId` - Lots d'un produit
- `GET /product-batches/expiring?days=7` - Lots arrivant à expiration
- `DELETE /product-batches/:id` - Retirer un lot (consommé)

---

## 🛍️ MODULE 7 : Cart & CartProducts
**Statut** : ⚪ À FAIRE

Liste de courses (1 panier par maison).

### Modèles Prisma
```prisma
model Cart {
  id           Int           @id @default(autoincrement())
  homeId       Int           @unique
  cartProducts CartProduct[]
}

model CartProduct {
  id        Int     @id @default(autoincrement())
  cartId    Int
  productId Int
  quantity  Int     @default(1)
  checked   Boolean @default(false)
}
```

### Endpoints à créer
- `GET /cart/home/:homeId` - Panier d'une maison
- `POST /cart-products` - Ajouter un produit au panier
- `PATCH /cart-products/:id` - Modifier quantité ou checked
- `DELETE /cart-products/:id` - Retirer du panier
- `DELETE /cart/:homeId/checked` - Vider les produits cochés

---

## 🍳 MODULE 8 : Recipes
**Statut** : ⚪ À FAIRE

Gestion des recettes de cuisine.

### Modèle Prisma
```prisma
model Recipe {
  id             Int                 @id @default(autoincrement())
  homeId         Int
  name           String
  picture        String
  prepTime       Int                 // minutes
  recipe         String              // description
  recipeProducts RecipeProduct[]
  recipeSteps    RecipeStep[]
  recipeTags     RecipeRecipeTag[]
}
```

### Endpoints à créer
- `POST /recipes` - Créer une recette
- `GET /recipes/home/:homeId` - Recettes d'une maison
- `GET /recipes/:id` - Détails complets (avec steps, products, tags)
- `PATCH /recipes/:id` - Modifier
- `DELETE /recipes/:id` - Supprimer
- `GET /recipes/search?tag=xxx` - Filtrer par tag

---

## 📝 MODULE 9 : RecipeSteps
**Statut** : ⚪ À FAIRE

Étapes de préparation des recettes.

### Modèle Prisma
```prisma
model RecipeStep {
  id         Int    @id @default(autoincrement())
  recipeId   Int
  stepNumber Int
  content    String
  @@unique([recipeId, stepNumber])
}
```

### Endpoints à créer
- `POST /recipe-steps` - Ajouter une étape
- `GET /recipe-steps/recipe/:recipeId` - Étapes d'une recette
- `PATCH /recipe-steps/:id` - Modifier une étape
- `DELETE /recipe-steps/:id` - Supprimer une étape

---

## 🏷️ MODULE 10 : RecipeTags
**Statut** : ⚪ À FAIRE

Tags pour catégoriser les recettes (végétarien, rapide, etc.).

### Modèle Prisma
```prisma
model RecipeTag {
  id      Int               @id @default(autoincrement())
  name    String            @unique
  recipes RecipeRecipeTag[]
}
```

### Endpoints à créer
- `POST /recipe-tags` - Créer un tag
- `GET /recipe-tags` - Liste de tous les tags
- `DELETE /recipe-tags/:id` - Supprimer un tag
- `POST /recipes/:recipeId/tags/:tagId` - Associer un tag à une recette
- `DELETE /recipes/:recipeId/tags/:tagId` - Retirer un tag d'une recette

---

## 🔗 Relations à implémenter

- `SubcategoryProduct` : Lien Subcategory ↔ Product
- `RecipeProduct` : Lien Recipe ↔ Product (avec quantité)
- `RecipeRecipeTag` : Lien Recipe ↔ RecipeTag

---

## 📈 Ordre d'implémentation recommandé

1. ✅ **Users** → Base utilisateurs
2. **Homes** → Structure principale
3. **Permissions** → Droits d'accès
4. **Categories & Subcategories** → Organisation
5. **Products** → Catalogue
6. **ProductBatches** → Gestion du stock
7. **Cart** → Liste de courses
8. **Recipes** → Recettes
9. **RecipeSteps** → Détails recettes
10. **RecipeTags** → Catégorisation recettes

---

## 🛡️ Fonctionnalités transversales

À implémenter en parallèle :
- **Authentification JWT** (Auth module)
- **Guards** (vérifier ownership via permissions)
- **Upload d'images** (pour pictures)
- **Validation globale** (déjà en place)
- **Swagger documentation** (déjà en place)
- **Tests E2E** par module
