# 🏠 HomeStock

Application mobile de gestion d'inventaire alimentaire et ménager pour la maison avec gestion des dates d'expiration, panier de courses et recettes intelligentes.

## 📋 Concept

Le principe central : l'application ne gère pas des quantités théoriques, mais **des unités physiques réelles** (paquets, bouteilles, etc.).

Chaque ligne dans `product_batches` représente une unité réelle possédée dans la maison.

## 🏗️ Architecture

### Backend
- **Framework** : NestJS
- **Base de données** : MySQL 8.0
- **ORM** : TypeORM
- **Authentification** : JWT
- **Port** : 3000

### Mobile
- **Framework** : React Native + Expo
- **Navigation** : Expo Router
- **Port** : 8081

## 🚀 Installation et lancement

### Prérequis
- Docker et Docker Compose
- Node.js 24+ (optionnel, si lancement sans Docker)

### Avec Docker (recommandé)

```bash
# Lancer tous les services
docker-compose up

# Ou seulement certains services
docker-compose up backend backend_db phpmyadmin
```

**Services disponibles :**
- Backend API : http://localhost:3000
- Frontend mobile : http://localhost:8081
- phpMyAdmin : http://localhost:8080
- Base de données MySQL : localhost:3306

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
```

## 📁 Structure du projet

```
HomeStock/
├── backend/           # API NestJS
│   ├── src/
│   │   ├── users/
│   │   ├── homes/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── recipes/
│   │   └── auth/
│   └── package.json
│
├── mobile/            # Application Expo
│   ├── app/          # Écrans et navigation
│   ├── components/   # Composants réutilisables
│   ├── constants/    # Thèmes et constantes
│   └── package.json
│
├── docker-compose.yml
├── db.sql            # Schéma de base de données
└── Consigne.md       # Documentation détaillée
```

## 🗄️ Base de données

### Hiérarchie
Catégorie → Sous-catégorie → Produit → Unités réelles (product_batches)

**Exemple** :
Féculents → Pâtes → Tagliatelles Barilla 500g → 3 paquets avec dates différentes

### Tables principales
- `users` - Utilisateurs de l'application
- `homes` - Maisons/foyers
- `permissions` - Droits des utilisateurs sur les maisons
- `categories` / `subcategories` - Organisation des produits
- `products` - Types de produits
- `product_batches` - **Unités physiques réelles** avec dates d'expiration
- `carts` / `carts_products` - Panier de courses (1 par maison)
- `recipes` - Recettes
- `recipe_steps` - Étapes de préparation
- `recipe_tags` - Tags (végétarien, rapide, dessert...)

## 🎯 Fonctionnalités

### Stock
- Le stock est **calculé dynamiquement** en comptant les `product_batches`
- Chaque unité peut avoir sa propre date d'expiration
- Alertes pour les produits proches de l'expiration

### Panier de courses
- **Un seul panier par maison**
- Ajout de produits depuis la liste ou depuis les recettes
- Gestion des quantités
- Validation d'achat qui crée les unités dans le stock

### Recettes
- Liées aux **types de produits**, pas aux unités
- Vérification automatique de faisabilité selon le stock
- Consommation **FEFO** (First Expired, First Out)
- Tags pour filtrage (végétarien, rapide, dessert...)
- Étapes numérotées

### Authentification
- Système de permissions par maison
- Plusieurs utilisateurs peuvent partager une maison
- Types de permissions : owner, member

## 🔧 Variables d'environnement

Voir le fichier `.env` à la racine du projet :

```env
# Database
MYSQL_ROOT_USER=user-root
MYSQL_ROOT_PASSWORD=Q6G3qRau5Td9C2z2I3rr
DB_BACKEND_USER=user-db
DB_BACKEND_PASSWORD=Q6G3qRau5Td9C2z2I3rr
DB_BACKEND_NAME=backend_db
DB_BACKEND_HOST=backend_db

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=8081
MYSQL_PORT=3306
PHPMYADMIN_PORT=8080
```

## 📱 Application Mobile

L'application mobile utilise Expo avec :
- **Expo Router** pour la navigation
- **React Native Reanimated** pour les animations
- **Expo Image** pour l'optimisation des images
- Architecture en tabs

## 🛠️ Développement

### Backend
```bash
cd backend
npm run start:dev  # Mode développement avec hot-reload
npm run build      # Build de production
npm run lint       # Linter
npm run test       # Tests
```

### Mobile
```bash
cd mobile
npm start          # Démarrer Expo
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur le web
```

## 📖 Documentation

Consultez [Consigne.md](./Consigne.md) pour les règles détaillées de gestion du stock, des recettes et du panier.

## 🐛 Débogage

- **phpMyAdmin** : http://localhost:8080 (utilisateur: `user-root`, mot de passe dans `.env`)
- **Logs backend** : `docker-compose logs -f backend`
- **Logs frontend** : `docker-compose logs -f frontend`
- **Logs base de données** : `docker-compose logs -f backend_db`
- Frontend : http://localhost:8081
- phpMyAdmin : http://localhost:8080

## Structure

```
HomeStock/
├── backend/        # API Node.js
├── frontend/       # App Expo
└── docker-compose.yml
```

## Commandes

```bash
# Démarrer
docker-compose up

# Arrêter
docker-compose down

# Redémarrer proprement
docker-compose down
docker rm -f backend-db frontend-dev backend-dev phpmyadmin
docker-compose up --build
```

## Build APK

```bash
cd frontend
npx eas build --platform android
```