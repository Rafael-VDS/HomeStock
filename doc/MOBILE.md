# 📱 Documentation Mobile - HomeStock

## 🏗️ Architecture générale

### Stack technologique
- **Framework** : React Native 0.76+
- **Langage** : TypeScript 5+
- **Navigation** : Expo Router (file-based routing)
- **État local** : Context API + AsyncStorage
- **Requêtes API** : Fetch API
- **Icons** : Expo Icons (Ionicons)
- **Images** : Expo Image
- **Sélecteurs** : React Native Picker

### Structure du projet

```
mobile/
├── app/                      # Routing (file-based avec Expo Router)
│   ├── _layout.tsx          # Layout racine avec NavBar
│   ├── index.tsx            # Page de démarrage
│   ├── login.tsx            # Connexion
│   ├── register.tsx         # Inscription
│   └── pages/               # Pages de l'application
│       ├── stock.tsx        # Gestion du stock
│       ├── cart.tsx         # Panier de courses
│       ├── recipe.tsx       # Liste des recettes
│       ├── recipe-detail.tsx # Détail d'une recette
│       ├── edit-recipe.tsx  # Édition de recette
│       ├── profile.tsx      # Profil utilisateur
│       ├── home.tsx         # Gestion des foyers
│       ├── select-home.tsx  # Sélection du foyer
│       ├── create-home.tsx  # Création de foyer
│       ├── subcategories.tsx # Liste des produits
│       ├── product-detail.tsx # Détail d'un produit
│       ├── panier.tsx       # Détail du panier
│       └── add-*.tsx        # Pages d'ajout rapide
│
├── components/              # Composants réutilisables
│   ├── NavBar.tsx           # Barre de navigation
│   ├── CustomPicker.tsx     # Sélecteur personnalisé
│   └── modals/              # Modals pour ajouts rapides
│       ├── AddCategoryModal.tsx
│       ├── AddSubcategoryModal.tsx
│       ├── AddProductModal.tsx
│       └── AddBatchModal.tsx
│
├── context/                 # Context API
│   └── AuthContext.tsx      # Gestion authentification & user
│
├── services/                # Services API
│   └── api.ts               # Interfaces TypeScript + requêtes
│
├── styles/                  # Fichiers de styles
│   ├── index.styles.ts
│   ├── login.styles.ts
│   ├── register.styles.ts
│   ├── stock.styles.ts
│   ├── cart.styles.ts
│   ├── recipe.styles.ts
│   ├── profile.styles.ts
│   └── *.styles.ts
│
└── package.json
```

## 🧭 Navigation avec Expo Router

### Routage basé sur les fichiers
Expo Router utilise le système de fichiers pour générer les routes automatiquement.

**Exemples** :
- `app/pages/stock.tsx` → `/pages/stock`
- `app/pages/recipe-detail.tsx` → `/pages/recipe-detail`
- `app/profile.tsx` → `/profile`

### Layout Racine (`_layout.tsx`)

```typescript
// Structure de base
<AuthProvider>
  <View style={{ flex: 1 }}>
    <Stack screenOptions={...}>
      {/* Tous les écrans */}
    </Stack>
    {showNavBar && <NavBar pathname={pathname} />}
  </View>
</AuthProvider>
```

**Points clés** :
- NavBar permanente (ne re-rend pas lors du changement de page)
- Stack pour l'historique de navigation
- AuthProvider au niveau racine

## 🧩 Composants principaux

### NavBar (`components/NavBar.tsx`)

**Spécifications** :
- 5 items : Stock, Achats, +, Recettes, Compte
- Hauteur : 70px
- Indicateur actif : Icône avec fond vert semi-transparent
- Animation smooth lors du changement
- Padding bottom: 80 sur toutes les pages

**Icônes utilisées** :
- Stock : `archive-outline`
- Achats : `cart-outline`
- Ajout : `add`
- Recettes : `receipt-outline`
- Compte : `person-outline`

### CustomPicker (`components/CustomPicker.tsx`)

Menu déroulant pour sélectionner des items (catégories, sous-catégories, produits).

### Modals d'ajout rapide

Accessible via le bouton `+` de la NavBar :
- `AddCategoryModal` - Crée une catégorie
- `AddSubcategoryModal` - Crée une sous-catégorie
- `AddProductModal` - Crée un produit
- `AddBatchModal` - Ajoute une unité au stock

## 📄 Pages principales

### Stock (`pages/stock.tsx`)

**Affichage** :
- Vue en grille 2 colonnes
- Chaque card : image + nom de catégorie

**Interactions** :
- Clic sur une catégorie → `/pages/subcategories?categoryId=X`
- Affiche les produits avec:
  - Image du produit
  - Nom du produit
  - Stock en temps réel
  - Bouton "+" pour ajouter au panier

**States** :
- Loading, Empty, Error states
- Refresh capability

### Panier (`pages/cart.tsx`)

**Affichage** :
- Liste des catégories expandables
- Chaque catégorie → sous-catégories → produits dans le panier

**Interactions** :
- Toggle expand/collapse catégories
- Increase/decrease quantité par lot
- Supprimer un item
- Bouton validation panier
- Dernière ligne : résumé + bouton "Valider l'achat"

**Mécanique** :
- Les produits sont groupés par catégorie
- Une checkbox par unité physique
- Sélection des dates d'expiration

### Recettes (`pages/recipe.tsx`)

**Affichage** :
- Grille 2 colonnes
- Chaque card : image + titre + servings

**Interactions** :
- Clic → `/pages/recipe-detail?recipeId=X`
- Pull-to-refresh pour actualiser

### Détail Recette (`pages/recipe-detail.tsx`)

**Layout** :
- Header avec image (background)
- Flèche retour + bouton modifier en bas de l'image
- Titre en bas du header

**Sections** :
- Description
- Sélecteur de portions (-, nombre, +)
- Liste des ingrédients
  - Nom du produit
  - Quantité (adaptée aux portions si multipliable)
  - Tag "Adaptable" si ingredient.multipliable
- Liste des étapes numérotées

### Édition Recette (`pages/edit-recipe.tsx`)

**Formulaire** :
- Champ nom
- Champ description
- Sélection d'image
- Panel ingrédients (add/remove dynamique)
- Panel étapes (add/remove dynamique)
- Bouton valider

**Interactions** :
- Scroll automatique vers le bas lors de l'ajout
- Confirmation avant suppression
- État loading pendant upload

### Profil (`pages/profile.tsx`)

**Sections** :
- Avatar (cliquable en mode édition)
- Prénom + Nom
- Email (taille réduite : fontSize 12)
- Boutons : Éditer, Gestion maison, Changer mot de passe, Déconnexion

**Modal édition** :
- Champs texte pour prénom/nom
- Upload avatar
- Sauvegarde avec loading state

### Sélection Foyer (`pages/select-home.tsx`)

**Affichage** :
- Liste des foyers
- Bouton "+ Créer un foyer"
- Bouton "+ Rejoindre un foyer"

**Interactions** :
- Clic sur un foyer → Sélection et redirection vers `/pages/stock`

### Création Foyer (`pages/create-home.tsx`)

**Formulaire** :
- Champ nom du foyer
- Bouton créer
- Retour après création

## 🎨 Design System

### Couleurs
- **Primaire** : `#68A68F` (vert)
- **Texte** : `#333`
- **Secondaire** : `#666`
- **Light** : `#f5f5f5`
- **Border** : `#e0e0e0`

### Spacing
- Padding standard : 16-20px
- Gap entre éléments : 8-12px
- Margin bottom : 16px

### Typographie
- **Titres** : 24-28px, bold
- **Sous-titres** : 16px, semi-bold
- **Body** : 14px
- **Small** : 12px

### Composants courants
- Radius : 8-12px
- Shadow : subtle (elevation 2-3)
- Button padding : 10-16px

## 🔐 AuthContext

### État global
```typescript
{
  user: User | null,
  token: string | null,
  loading: boolean,
  currentHome: Home | null,
  login: (data) => Promise<void>,
  register: (data) => Promise<void>,
  logout: () => Promise<void>,
  loadUser: () => Promise<void>,
  loadCurrentHome: () => Promise<void>
}
```

### Stockage
- Token : AsyncStorage (`token`)
- Foyer sélectionné : AsyncStorage (`selectedHomeId`)

### Chargement initial
Au démarrage de l'app :
1. Vérifier si token en storage
2. Charger user depuis token
3. Charger foyer actuellement sélectionné
4. Rediriger vers login ou select-home

## 🔌 Services API

### Fichier `services/api.ts`

**Interfaces TypeScript** : Toutes les entités sont typées
- `User`, `Home`, `Permission`, `Category`, `Subcategory`, `Product`, `ProductBatch`, `Cart`, `CartProduct`, `Recipe`, `RecipeIngredient`, `RecipeStep`

**Classes d'API** :
- `authAPI.login()`, `register()`, `getProfile()`
- `usersAPI.updateProfile()`, `updateAvatar()`, `changePassword()`
- `homesAPI.getHomes()`, `createHome()`, `selectHome()`
- `categoriesAPI.getCategoriesByHome()`, `getSubcategoriesByCategory()`
- `productsAPI.getProductsBySubcategory()`, `getProductById()`, `createProduct()`
- `cartAPI.getCart()`, `addToCart()`, `removeFromCart()`, `validateCart()`
- `recipesAPI.getRecipes()`, `getRecipeById()`, `createRecipe()`, `updateRecipe()`, `addIngredient()`, `addStep()`

**Base URL** : Configurable (actuellement localhost:3000 en dev)

## 📱 Gestion du stockage local

### AsyncStorage

**Clés utilisées** :
- `token` - JWT token
- `selectedHomeId` - ID du foyer actuel
- `user` - Données utilisateur (cache optionnel)

**Exemple** :
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder
await AsyncStorage.setItem('token', jwtToken);

// Récupérer
const token = await AsyncStorage.getItem('token');

// Supprimer
await AsyncStorage.removeItem('token');
```

## 🎯 Flows utilisateur

### Authentification
```
Page initiale (index)
  ↓
Vérifier token en storage
  ├─ Token valide → LoadUser
  │   ├─ User chargé → SelectHome
  │   │   ├─ Home exists → Stock
  │   │   └─ No home → CreateHome
  │   └─ Erreur → Login
  └─ Pas de token → Login
       ├─ RegisterPage
       └─ LoginPage
```

### Navigation Stock
```
Stock (Catégories)
  └─ Clic catégorie → Subcategories (Produits)
       └─ Clic produit → ProductDetail
            ├─ Bouton + → AddToCart
            └─ Bouton - → RemoveFromCart
```

### Navigation Recette
```
Recettes (Grille)
  └─ Clic recette → RecipeDetail
       ├─ Multiplicateur portions
       ├─ Consommer ingrédients (FEFO)
       └─ Bouton modifier → EditRecipe
```

## 🛠️ Développement

### Démarrer l'app
```bash
cd mobile
npm install
npm start

# Puis :
# - Press a pour Android
# - Press i pour iOS  
# - Press w pour web
```

### Hot Reload
L'app se recharge automatiquement lors des changements de fichier.

### Debugging
- Shake device / Ctrl+M → Developer Menu
- Remote debugger
- Logs avec `console.log()`

### Styling
Chaque page a son fichier de style correspondant dans `styles/`.

Exemple : `stock.tsx` → `stock.styles.ts`

Les styles utilisent `StyleSheet.create()` pour l'optimisation.

## 📦 Packaging & Distribution

### Build APK Android
```bash
cd mobile
npx eas build --platform android --local
```

### Build IPA iOS
```bash
npx eas build --platform ios --local
```

### Build Web
```bash
npx expo export --platform web
```

## ⚡ Optimisations

- **Images** : Expo Image avec caching
- **Navigation** : Nav ne re-rend pas
- **State** : Context limits re-renders
- **Lists** : FlatList pour grandes listes (à implémenter si besoin)

## 🐛 Debugging

### Logs
```typescript
console.log('Debug message');
console.error('Error occurred', error);
```

### Console Errors
Via Developer Menu → "Debug remote JS"

### State Inspection
Ajouter au contexte :
```typescript
useEffect(() => console.log('State changed:', state), [state]);
```
