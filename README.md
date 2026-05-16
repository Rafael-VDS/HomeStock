# 🏠 HomeStock

Application complète de **gestion d'inventaire alimentaire et ménager** pour la maison avec gestion intelligente des dates d'expiration, panier de courses collaboratif et recettes interactives.

## 🎯 Concept clé

HomeStock gère **des unités physiques réelles** (paquets, bouteilles, cannettes, etc.), pas des quantités abstraites.

Chaque unité possédée dans la maison est tracée individuellement avec sa propre date d'expiration. Le stock est donc calculé dynamiquement en comptant les unités disponibles.

### Hiérarchie de l'inventaire
```
Catégorie (Féculents)
  └── Sous-catégorie (Pâtes)
      └── Produit (Tagliatelles Barilla 500g)
          └── Unités réelles (3 paquets avec dates différentes)
```

## 🏗️ Architecture

### Backend - NestJS
- **Framework** : NestJS avec TypeScript
- **Base de données** : MySQL 8.0
- **ORM** : Prisma
- **Authentification** : JWT
- **Validation** : Class Validator
- **API Docs** : Swagger
- **Port** : 3000

**Modules disponibles :**
- `auth` - Authentification et permissions
- `users` - Gestion des utilisateurs
- `homes` - Gestion des foyers/maisons
- `categories` - Catégories et sous-catégories
- `products` - Produits
- `product-batches` - Unités physiques avec dates
- `cart` - Panier de courses partagé
- `recipes` - Recettes et étapes
- `permissions` - Système de permissions

### Mobile - React Native + Expo
- **Framework** : React Native avec TypeScript
- **Navigation** : Expo Router (file-based routing)
- **UI Components** : React Native avec Ionicons
- **État** : Context API + AsyncStorage
- **Port** : 8081

**Pages principales :**
- Stock - Liste des catégories et produits
- Panier - Gestion des courses
- Recettes - Consultation et gestion
- Profil - Paramètres utilisateur
- Gestion de la maison - Création et sélection

## 🚀 Installation et lancement

### Prérequis
- **Docker** et **Docker Compose** (recommandé)
- **Node.js** 24+ (si sans Docker)

### Avec Docker (Recommandé)

```bash
# À la racine du projet
docker-compose up

# Ou avec rebuild
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter tout
docker-compose down
```

**Services disponibles :**
- Backend API : http://localhost:3000
- API Swagger : http://localhost:3000/api/docs
- Mobile Expo : http://localhost:8081
- phpMyAdmin : http://localhost:8080 (user: `root`)
- MySQL : localhost:3306

### Sans Docker

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Mobile
```bash
cd mobile
npm install
npm start
# Puis scanner le QR code avec Expo Go
```

## 📱 Interface Mobile

### Barre de navigation
- **Stock** - Vue d'ensemble de l'inventaire
- **Achats** - Panier de courses
- **+** - Ajout rapide (catégorie, produit, lot)
- **Recettes** - Liste et détails des recettes
- **Compte** - Profil utilisateur

### Indicateur de page active
Carré vert avec fond semi-transparent derrière l'icône active pour indiquer la page courante

### Pages clés

#### Stock
- Liste des catégories avec images
- Clic → Liste des produits par sous-catégorie
- Chaque produit affiche son stock en temps réel
- Filtrage par maison

#### Panier
- Affichage des produits ajoutés
- Sélection des unités à acheter
- Dates d'expiration suggérées
- Validation de l'achat

#### Recettes
- Affichage en grille 2 colonnes
- Détails complets avec ingrédients et étapes
- Vérification de la faisabilité
- Multiplicateur de portions

#### Profil
- Affichage des informations utilisateur
- Édition du profil (nom, prénom, avatar)
- Changement de mot de passe
- Gestion des maisons

## 🗄️ Base de données

### Tables principales

**Utilisateurs et permissions**
- `users` - Utilisateurs de l'application
- `homes` - Maisons/foyers
- `invite_links` - Liens d'invitation pour partager une maison
- `user_homes` - Relation avec permissions

**Inventaire**
- `categories` - Catégories (Féculents, Viandes, etc.)
- `subcategories` - Sous-catégories (Pâtes, Riz, etc.)
- `products` - Types de produits (Tagliatelles Barilla 500g)
- `product_batches` - **Unités réelles** avec dates d'expiration

**Panier**
- `carts` - Un panier par maison
- `cart_products` - Produits dans le panier

**Recettes**
- `recipes` - Recettes
- `recipe_ingredients` - Ingrédients des recettes
- `recipe_steps` - Étapes de préparation

## 🎯 Fonctionnalités détaillées

### 📦 Gestion du Stock
- ✅ Stock en temps réel (comptage dynamique des unités)
- ✅ Dates d'expiration par unité
- ✅ Alertes proches expiration
- ✅ Historique des achats
- ✅ Images des produits

### 🛒 Panier de courses
- ✅ Un seul panier partagé par maison
- ✅ Ajout depuis la liste des produits
- ✅ Suggestion de quantité based on stock
- ✅ Validation crée les unités dans le stock
- ✅ Calcul automatique des besoins

### 👨‍🍳 Recettes
- ✅ Liées aux **types de produits** (adaptables)
- ✅ Vérification de faisabilité en temps réel
- ✅ Consommation **FEFO** (First Expired, First Out)
- ✅ Multiplicateur de portions
- ✅ Ingredient marqués comme "adaptables"
- ✅ Étapes numérotées

### 🔐 Authentification et permissions
- ✅ JWT avec refresh tokens
- ✅ Système de permissions par maison
- ✅ Plusieurs utilisateurs par maison
- ✅ Rôles : owner, member
- ✅ Liens d'invitation temporaires

## 🔧 Development

### Backend

```bash
cd backend

# Installation
npm install

# Développement
npm run start:dev

# Build
npm run build

# Tests
npm run test

# Tests e2e
npm run test:e2e

# Linting
npm run lint

# Seed database
npm run seed
```

### Mobile

```bash
cd mobile

# Installation
npm install

# Démarrage
npm start

# Options
# - Press a to open Android
# - Press i to open iOS
# - Press w to open web
```

## 📄 Fichiers de configuration

### `.env` (base de données)
```env
MYSQL_ROOT_PASSWORD=Q6G3qRau5Td9C2z2I3rr
DB_BACKEND_NAME=backend_db
DB_BACKEND_USER=user-db
DB_BACKEND_PASSWORD=Q6G3qRau5Td9C2z2I3rr
```

### Backend `.env`
```env
DATABASE_URL=mysql://user-db:password@backend_db:3306/backend_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
```

## 🐛 Débogage

### Logs
```bash
# Backend
docker-compose logs -f backend

# Base de données
docker-compose logs -f backend_db

# Tous les services
docker-compose logs -f
```

### Accès à la base de données
- **phpMyAdmin** : http://localhost:8080
- **Utilisateur** : root
- **Mot de passe** : Voir `.env`

### Reinitialiser complètement
```bash
docker-compose down -v
docker-compose up --build
```

## 📚 Documentation supplémentaire

Voir [Consigne.md](./Consigne.md) pour :
- Règles de gestion du stock
- Algorithmes FEFO
- Validations métier
- Cas d'usage particuliers

Consultez le dossier [`doc/`](./doc/) pour la documentation détaillée :
- [Backend](./doc/BACKEND.md) - Architecture et API
- [Mobile](./doc/MOBILE.md) - Interface et composants
- [Database](./doc/DATABASE.md) - Schéma et relations

---

## 👨‍💻 Développeur

**Vital** - Responsable du projet complet

