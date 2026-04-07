# 📚 Documentation Backend - HomeStock

## 🏗️ Architecture générale

### Stack technologique
- **Framework** : NestJS 10+
- **Langage** : TypeScript 5+
- **Base de données** : MySQL 8.0
- **ORM** : Prisma
- **Authentification** : JWT
- **Validation** : Class Validator & Class Transformer
- **API Documentation** : Swagger/OpenAPI
- **Testing** : Jest

### Structure des modules

```
backend/src/
├── auth/                 # Authentification & JWT
├── users/               # Gestion des utilisateurs
├── homes/               # Gestion des foyers
├── categories/          # Catégories et sous-catégories
├── products/            # Produits
├── product-batches/     # Unités physiques avec dates
├── cart/                # Panier de courses
├── recipes/             # Recettes et étapes
├── permissions/         # Système de permissions
├── common/              # Utilitaires partagés
├── config/              # Configuration globale
├── guards/              # Guards d'authentification
├── prisma.service.ts    # Service Prisma
├── app.controller.ts    # Contrôleur racine
├── app.module.ts        # Module racine
└── main.ts              # Point d'entrée
```

## 🔐 Authentification (Module `auth`)

### Structure
```
auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── jwt.strategy.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── auth-response.dto.ts
└── guards/
    └── jwt.guard.ts
```

### Endpoints principaux

#### POST `/auth/register`
Inscription utilisateur
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstname": "Jean",
  "lastname": "Dupont"
}
```

**Réponse** :
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": { ... }
}
```

#### POST `/auth/login`
Connexion utilisateur
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/auth/refresh`
Renouvellement du token d'accès

#### POST `/auth/logout`
Déconnexion (révoke les tokens)

### JWT Strategy
- **Header** : `Authorization: Bearer <token>`
- **Secret** : Depuis `JWT_SECRET` .env
- **Expires** : `JWT_EXPIRES_IN` (par défaut 1h)
- **Payload** : `{ userId, email, homeId }`

## 👥 Module Utilisateurs (`users`)

### Structure
```
users/
├── users.controller.ts
├── users.service.ts
├── users.module.ts
├── entities/
│   └── user.entity.ts
└── dto/
    ├── create-user.dto.ts
    ├── update-user.dto.ts
    └── update-password.dto.ts
```

### Endpoints

#### GET `/users/:id`
Récupère les infos d'un utilisateur

#### PATCH `/users/:id`
Met à jour les infos d'un utilisateur
```json
{
  "firstname": "Jean",
  "lastname": "Martin"
}
```

#### POST `/users/:id/change-password`
Change le mot de passe
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

#### POST `/users/:id/avatar`
Upload un avatar (multipart/form-data)

## 🏠 Module Foyers (`homes`)

### Endpoints

#### POST `/homes`
Crée un nouveau foyer
```json
{
  "name": "Mon Foyer"
}
```

#### GET `/homes`
Liste tous les foyers de l'utilisateur

#### GET `/homes/:id`
Récupère un foyer spécifique

#### PATCH `/homes/:id`
Met à jour un foyer

#### DELETE `/homes/:id`
Supprime un foyer

#### POST `/homes/:id/members`
Ajoute un membre (via lien d'invitation)

## 🏷️ Module Catégories (`categories`)

### Hiérarchie
```
Catégories → Sous-catégories → Produits → Unités(product_batches)
```

### Structure
```
categories/
├── categories.service.ts
├── categories.controller.ts
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── create-subcategory.dto.ts
│   └── update-subcategory.dto.ts
└── entities/
    ├── category.entity.ts
    └── subcategory.entity.ts
```

### Endpoints Catégories

#### POST `/categories`
Crée une catégorie
```json
{
  "homeId": 1,
  "name": "Féculents",
  "picture": "/uploads/categories/feculent.jpg"
}
```

#### GET `/categories/home/:homeId`
Liste toutes les catégories d'un foyer

#### PATCH `/categories/:id`
Met à jour une catégorie

#### DELETE `/categories/:id`
Supprime une catégorie

### Endpoints Sous-catégories

#### POST `/categories/:id/subcategories`
Crée une sous-catégorie
```json
{
  "name": "Pâtes"
}
```

#### GET `/categories/:id/subcategories`
Liste les sous-catégories

#### PATCH `/categories/:categoryId/subcategories/:id`
Met à jour une sous-catégorie

#### DELETE `/categories/:categoryId/subcategories/:id`
Supprime une sous-catégorie

## 📦 Module Produits (`products`)

### Structure
```
products/
├── products.service.ts
├── products.controller.ts
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
└── entities/
    └── product.entity.ts
```

### Endpoints

#### POST `/products`
Crée un produit
```json
{
  "homeId": 1,
  "subcategoryId": 3,
  "name": "Tagliatelles Barilla 500g",
  "picture": "/uploads/products/tagliatelle.jpg",
  "mass": 500,
  "liquid": null
}
```

#### GET `/products/subcategory/:subcategoryId`
Liste les produits d'une sous-catégorie

#### PATCH `/products/:id`
Met à jour un produit

#### DELETE `/products/:id`
Supprime un produit

## 📊 Module Unités Produits (`product-batches`)

### Concept
Chaque `product_batch` représente **une unité physique réelle** avec sa propre date d'expiration.

### Structure
```
product-batches/
├── product-batches.service.ts
├── product-batches.controller.ts
├── dto/
│   ├── create-product-batch.dto.ts
│   └── update-product-batch.dto.ts
└── entities/
    └── product-batch.entity.ts
```

### Endpoints

#### POST `/product-batches`
Ajoute une unité au stock
```json
{
  "productId": 5,
  "homeId": 1,
  "expirationDate": "2025-12-31",
  "purchaseDate": "2025-01-01"
}
```

#### GET `/products/:id/batches`
Liste les unités d'un produit

#### PATCH `/product-batches/:id`
Met à jour une unité (changer date expiration)

#### DELETE `/product-batches/:id`
Supprime une unité du stock

## 🛒 Module Panier (`cart`)

### Structure
```
cart/
├── cart.service.ts
├── cart.controller.ts
├── dto/
│   ├── add-to-cart.dto.ts
│   ├── remove-from-cart.dto.ts
│   └── validate-cart.dto.ts
└── entities/
    └── cart.entity.ts
```

### Concept
- **Un seul panier par foyer**
- Contient des produits (types) pas des unités
- Validation crée les unités dans `product_batches`

### Endpoints

#### GET `/carts/home/:homeId`
Récupère le panier du foyer

#### POST `/carts/home/:homeId/add`
Ajoute un produit au panier
```json
{
  "productId": 5,
  "quantity": 2
}
```

#### POST `/carts/home/:homeId/remove`
Retire un produit du panier
```json
{
  "productId": 5
}
```

#### POST `/carts/home/:homeId/validate`
Valide le panier et crée les unités
```json
{
  "items": [
    {
      "productId": 5,
      "quantity": 2,
      "expirationDate": "2025-12-31"
    }
  ]
}
```

#### POST `/carts/home/:homeId/clear`
Vide complètement le panier

## 👨‍🍳 Module Recettes (`recipes`)

### Structure
```
recipes/
├── recipes.service.ts
├── recipes.controller.ts
├── dto/
│   ├── create-recipe.dto.ts
│   ├── update-recipe.dto.ts
│   ├── add-ingredient.dto.ts
│   └── add-step.dto.ts
└── entities/
    ├── recipe.entity.ts
    ├── recipe-ingredient.entity.ts
    └── recipe-step.entity.ts
```

### Endpoints

#### POST `/recipes`
Crée une recette (sans ingrédients/étapes)
```json
{
  "homeId": 1,
  "name": "Pâtes à la Carbonara",
  "description": "Recette italienne classique",
  "picture": "/uploads/recipes/carbonara.jpg"
}
```

#### GET `/recipes/home/:homeId`
Liste les recettes d'un foyer

#### GET `/recipes/:id`
Récupère les détails complets d'une recette (avec ingrédients et étapes)

#### PATCH `/recipes/:id`
Met à jour une recette

#### DELETE `/recipes/:id`
Supprime une recette

#### POST `/recipes/:id/ingredients`
Ajoute un ingrédient
```json
{
  "productId": 8,
  "quantityNeeded": 500,
  "multipliable": true
}
```

#### DELETE `/recipes/:id/ingredients/:productId`
Retire un ingrédient

#### POST `/recipes/:id/steps`
Ajoute une étape
```json
{
  "stepNumber": 1,
  "content": "Faire bouillir l'eau avec du sel"
}
```

#### DELETE `/recipes/:id/steps/:stepNumber`
Retire une étape

### Algorithme FEFO (First Expired, First Out)
Lors de la consommation d'ingrédients d'une recette, les unités sont consommées dans l'ordre de leurs dates d'expiration (unités les plus anciennes d'abord).

## 🔐 Module Permissions

### Rôles
- **owner** : Propriétaire du foyer, accès complet
- **member** : Membre du foyer, accès limité

### Endpoints

#### GET `/permissions/home/:homeId`
Liste les permissions du foyer

#### PATCH `/permissions/:homeId/user/:userId`
Modifie le rôle d'un utilisateur

#### POST `/permissions/home/:homeId/invite`
Génère un lien d'invitation
```json
{
  "expiresInDays": 7
}
```

#### POST `/permissions/home/:homeId/join`
Rejoint un foyer via lien d'invitation
```json
{
  "inviteCode": "ABC123XYZ"
}
```

## 🛡️ Guards et Middlewares

### JwtGuard
Protège les routes en vérifiant le JWT. À utiliser avec `@UseGuards(JwtGuard)`

### Décorateurs personnalisés
- `@GetUser()` - Récupère l'utilisateur actuel depuis le JWT
- `@GetHome()` - Récupère l'ID du foyer depuis le JWT

## ⚙️ Configuration

### Environment Variables
```env
DATABASE_URL=mysql://user:password@localhost:3306/database
JWT_SECRET=votre-clé-secrète-très-sécurisée
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
```

### Swagger/OpenAPI
Accédez à `http://localhost:3000/api/docs` pour explorer l'API complète en mode interactif.

## 🧪 Testing

### Lancer les tests
```bash
npm run test              # Tests unitaires
npm run test:watch       # Mode watch
npm run test:cov         # Avec couverture
npm run test:e2e         # Tests e2e
```

### Structure des tests
```
src/
├── users/
│   └── users.service.spec.ts
├── cart/
│   └── cart.service.spec.ts
└── recipes/
    └── recipes.service.spec.ts
```

## 📤 Upload de fichiers

### Avatars utilisateur
**Endpoint** : `POST /users/:id/avatar`
- **Format** : multipart/form-data
- **Dossier** : `public/uploads/avatars/`
- **Max size** : 5MB
- **Types** : jpg, jpeg, png

### Images de catégories
**Endpoint** : Lors de la création
- **Format** : URL ou fichier
- **Dossier** : `public/uploads/categories/`

### Images de produits
**Endpoint** : Lors de la création
- **Format** : URL ou fichier
- **Dossier** : `public/uploads/products/`

### Images de recettes
**Endpoint** : `PATCH /recipes/:id`
- **Format** : multipart/form-data
- **Dossier** : `public/uploads/recipes/`

## 🚀 Déploiement

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker build -f Dockerfile -t homestock-backend .
docker run -p 3000:3000 -e DATABASE_URL=... homestock-backend
```

## 📝 Conventions de code

### Nommage
- Services : `*Service` (ex: `UsersService`)
- Contrôleurs : `*Controller` (ex: `UsersController`)
- DTOs : `*Dto` (ex: `CreateUserDto`)
- Entités : `*Entity` (ex: `UserEntity`)

### Structure des fichiers
- Un module = un dossier avec `*.service.ts`, `*.controller.ts`, `*.module.ts`
- Les DTOs dans un dossier `dto/`
- Les entités dans un dossier `entities/`

### Logs
```typescript
this.logger.log('Message d'info');
this.logger.warn('Avertissement');
this.logger.error('Erreur', new Error());
```
