# Documentation technique - Mobile

## Stack

- React Native 0.81, TypeScript
- Expo Router 6 (navigation basée sur les fichiers)
- Axios (requêtes HTTP avec intercepteur JWT)
- Context API + AsyncStorage (état global et persistance locale)
- Expo Image Picker (sélection de photos)
- Ionicons (icônes)

## Lancer l'application

```bash
cd mobile
npm install
npm start
```

Expo affiche un QR code. Scannez-le avec l'app Expo Go sur votre téléphone.
Ou appuyez sur `a` pour Android, `i` pour iOS.

Avant de lancer, vérifiez que `mobile/config/config.ts` contient la bonne adresse IP :

```typescript
export const API_URL = 'http://192.168.1.91:3000';
```

Cette IP doit être celle de la machine qui fait tourner le backend. Sur émulateur Android, `10.0.2.2` correspond à `localhost` de la machine hôte.

---

## Structure du projet

```
mobile/
├── app/
│   ├── _layout.tsx            # Layout racine, NavBar, providers
│   ├── index.tsx              # Page de démarrage (redirige selon le token)
│   ├── login.tsx              # Connexion
│   ├── register.tsx           # Inscription
│   └── pages/
│       ├── stock.tsx              # Liste des catégories
│       ├── subcategories.tsx      # Produits d'une sous-catégorie
│       ├── product-detail.tsx     # Détail + stock d'un produit
│       ├── panier.tsx             # Validation des achats
│       ├── cart.tsx               # Vue du panier de courses
│       ├── recipe.tsx             # Liste des recettes
│       ├── recipe-detail.tsx      # Détail d'une recette
│       ├── edit-recipe.tsx        # Édition d'une recette
│       ├── add-recipe.tsx         # Création d'une recette
│       ├── add-category.tsx       # Création d'une catégorie
│       ├── add-subcategory.tsx    # Création d'une sous-catégorie
│       ├── add-product.tsx        # Création d'un produit
│       ├── add-batch.tsx          # Ajout d'une unité au stock
│       ├── add-menu.tsx           # Modal du bouton "+"
│       ├── profile.tsx            # Profil utilisateur
│       ├── home.tsx               # Gestion du foyer
│       ├── select-home.tsx        # Sélection du foyer actif
│       └── create-home.tsx        # Création d'un nouveau foyer
├── components/
│   ├── NavBar.tsx                 # Barre de navigation principale
│   ├── CustomPicker.tsx           # Menu déroulant custom
│   └── modals/
│       ├── AddCategoryModal.tsx
│       ├── AddSubcategoryModal.tsx
│       ├── AddProductModal.tsx
│       └── AddBatchModal.tsx
├── context/
│   └── AuthContext.ts             # État global (user, token, foyer actif)
├── services/
│   └── api.ts                     # Client Axios + toutes les interfaces TypeScript
├── styles/
│   └── *.styles.ts                # Un fichier par écran
└── config/
    └── config.ts                  # URL de base de l'API
```

---

## Navigation

Expo Router génère les routes depuis l'arborescence de fichiers. `app/pages/stock.tsx` → route `/pages/stock`.

Pour naviguer :
```typescript
import { router, useLocalSearchParams } from 'expo-router';

router.push('/pages/subcategories?categoryId=1&categoryName=Féculents');
router.replace('/login');  // Remplace l'entrée courante dans l'historique
router.back();
```

Pour lire les paramètres reçus :
```typescript
const { categoryId, categoryName } = useLocalSearchParams<{
  categoryId: string;
  categoryName: string;
}>();
```

Les paramètres passés en query string sont toujours des strings — pensez à les convertir avec `parseInt()` si besoin.

### Flux de navigation principal

```
index.tsx
  ├─ Pas de token → /login → /register
  └─ Token présent → chargement du profil
       ├─ Pas de foyer sélectionné → /pages/select-home → /pages/create-home
       └─ Foyer trouvé → /pages/stock

NavBar (onglets permanents) :
  Stock → /pages/stock
    └─ Clic catégorie → /pages/subcategories?categoryId=X&categoryName=Y
         └─ Clic produit → /pages/product-detail?productId=X

  Achats → /pages/cart
    └─ Bouton panier → /pages/panier

  + → Modal d'ajout (catégorie / sous-catégorie / produit / lot / recette)

  Recettes → /pages/recipe
    └─ Clic recette → /pages/recipe-detail?recipeId=X
         └─ Bouton modifier → /pages/edit-recipe?recipeId=X

  Compte → /pages/profile
    └─ Gérer le foyer → /pages/home
```

La NavBar est visible sur : `/pages/stock`, `/pages/cart`, `/pages/recipe`, `/pages/profile`, `/pages/home`, `/pages/subcategories`, `/pages/product-detail`, `/pages/panier`.

---

## Client API (`services/api.ts`)

L'instance Axios est configurée avec la base URL et un intercepteur qui injecte le token JWT dans chaque requête :

```typescript
const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Interfaces TypeScript principales

```typescript
interface User {
  id: number;
  firstname: string;
  lastname: string;
  mail: string;
  picture?: string;
}

interface Home {
  id: number;
  name: string;
}

interface Category {
  id: number;
  homeId: number;
  name: string;
  picture: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
}

interface Product {
  id: number;
  homeId: number;
  subcategoryId: number;
  name: string;
  picture: string;
  mass?: number;
  liquid?: number;
  stockCount: number;
  needsToBuy: boolean;
  subcategory?: { id: number; name: string; categoryId: number; categoryName: string };
  productBatches?: ProductBatch[];
}

interface ProductBatch {
  id: number;
  productId: number;
  homeId: number;
  expirationDate?: string;
  daysUntilExpiration?: number;
  isExpired?: boolean;
  expiringSoon?: boolean;
}

interface Cart {
  id: number;
  homeId: number;
  products: CartProduct[];
  totalItems: number;
  uncheckedItems: number;
}

interface CartProduct {
  id: number;
  productId: number;
  productName: string;
  productPicture: string;
  quantity: number;
  checked: boolean;
  subcategoryId: number;
  subcategoryName: string;
}

interface Recipe {
  id: number;
  homeId: number;
  name: string;
  picture: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tags: RecipeTag[];
  createdAt: string;
  updatedAt: string;
}

interface RecipeIngredient {
  id: number;
  recipeId: number;
  productId: number;
  productName: string;
  quantityNeeded?: number;
  multipliable: boolean;
}

interface RecipeStep {
  id: number;
  recipeId: number;
  stepNumber: number;
  content: string;
}
```

### Méthodes disponibles

**authAPI**
```typescript
authAPI.register(data: { firstname, lastname, mail, password })
authAPI.login(data: { mail, password })
authAPI.getProfile()
authAPI.updateProfile(userId, data: { firstname?, lastname? })
authAPI.changePassword(userId, data: { password })
authAPI.updateAvatar(userId, formData: FormData)   // PATCH /users/:id/avatar
```

**homesAPI**
```typescript
homesAPI.create(data: { name, userId })
homesAPI.getHomes()
homesAPI.findOne(id)
homesAPI.getHomeUsers(id)
```

**permissionsAPI**
```typescript
permissionsAPI.getUserPermissions(userId)
```

**inviteLinksAPI**
```typescript
inviteLinksAPI.create(data: { homeId, permissionType })
inviteLinksAPI.getByHome(homeId)
inviteLinksAPI.use(data: { link, userId })
inviteLinksAPI.delete(id)
```

**categoriesAPI**
```typescript
categoriesAPI.getCategoriesByHome(homeId)
categoriesAPI.getSubcategoriesByCategory(categoryId)
categoriesAPI.createCategory(formData: FormData)    // POST /categories (multipart)
categoriesAPI.updateCategory(categoryId, formData)  // PATCH /categories/:id (multipart)
categoriesAPI.createSubcategory(data: { categoryId, name })
categoriesAPI.updateSubcategory(subcategoryId, data: { name })
```

**productsAPI**
```typescript
productsAPI.getProductsBySubcategory(subcategoryId)
productsAPI.getProductById(productId)
productsAPI.createProduct(formData: FormData)       // POST /products (multipart)
productsAPI.updateProduct(productId, data)
productsAPI.createBatch(data: { productId, homeId, expirationDate? })
```

**cartAPI**
```typescript
cartAPI.getCart(homeId)
cartAPI.addProduct(homeId, productId, quantity?)
cartAPI.updateProduct(homeId, cartProductId, data: { quantity?, checked? })
cartAPI.removeProduct(homeId, cartProductId)
cartAPI.clearCart(homeId, onlyChecked?)
```

**recipesAPI**
```typescript
recipesAPI.getRecipesByHome(homeId)
recipesAPI.getRecipeById(recipeId)
recipesAPI.createRecipe(formData: FormData)
recipesAPI.updateRecipe(recipeId, formData)
recipesAPI.deleteRecipe(recipeId)
recipesAPI.addIngredient(recipeId, data: { productId, quantityNeeded?, multipliable })
recipesAPI.updateIngredient(recipeId, productId, data)
recipesAPI.removeIngredient(recipeId, productId)
recipesAPI.addStep(recipeId, data: { stepNumber, content })
recipesAPI.updateStep(recipeId, stepNumber, content)
recipesAPI.removeStep(recipeId, stepNumber)
```

---

## Contexte d'authentification (`context/AuthContext.ts`)

Géré par le `AuthProvider` monté à la racine dans `_layout.tsx`. Disponible partout via le hook `useAuth()`.

### État

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  currentHome: Home | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadCurrentHome: () => Promise<void>;
}
```

### Clés AsyncStorage

- `token` — le JWT
- `selectedHomeId` — l'ID du foyer actif (stocké comme string, parsé en int à la lecture)

### Cycle de vie au démarrage

Au montage du provider, `loadStoredAuth()` s'exécute :
1. Récupère le token depuis AsyncStorage
2. Si token présent → appelle `loadUser()` (GET `/auth/profile`)
3. Appelle `loadCurrentHome()` → lit `selectedHomeId`, récupère la liste des foyers, trouve le foyer correspondant et le stocke dans `currentHome`
4. `loading` passe à `false`

`index.tsx` surveille `loading` et `user` pour rediriger vers la bonne page.

### Usage dans un écran

```typescript
const { user, currentHome, logout, loadUser } = useAuth();
```

---

## NavBar (`components/NavBar.tsx`)

La NavBar est montée dans `_layout.tsx` et reste visible en permanence sur les pages principales.

Les cinq éléments :

| Nom      | Icône (Ionicons)    | Route cible         |
|----------|---------------------|---------------------|
| Stock    | `archive-outline`   | `/pages/stock`      |
| Achats   | `cart-outline`      | `/pages/cart`       |
| +        | `add`               | Modal (voir ci-dessous)|
| Recettes | `receipt-outline`   | `/pages/recipe`     |
| Compte   | `person-outline`    | `/pages/profile`    |

L'onglet actif est mis en évidence par un fond vert semi-transparent derrière l'icône (comparaison avec le pathname courant).

Le bouton `+` ouvre un menu avec cinq options :
1. Ajouter une catégorie → `AddCategoryModal`
2. Ajouter une sous-catégorie → `AddSubcategoryModal`
3. Ajouter un produit → `AddProductModal`
4. Ajouter un lot → `AddBatchModal`
5. Ajouter une recette → navigation vers `/pages/add-recipe`

Les modals se ferment automatiquement quand le pathname change.

---

## Écrans en détail

### `index.tsx` — Page de démarrage

Ne s'affiche pas visuellement. Surveille le contexte auth et redirige :
- `loading === true` → attend
- `loading === false` et `user === null` → `/login`
- `loading === false` et `user !== null` et pas de foyer → `/pages/select-home`
- `loading === false` et `user !== null` et foyer sélectionné → `/pages/stock`

---

### `pages/stock.tsx` — Vue inventaire

**État :**
```typescript
categories: Category[]          // Catégories filtrées (seulement celles qui ont des produits)
loading: boolean
editingCategory: Category | null  // Catégorie en cours d'édition
editName: string
editImageUri: string | null
saveLoading: boolean
```

**Au montage :** Lit `selectedHomeId` depuis AsyncStorage, appelle `categoriesAPI.getCategoriesByHome(homeId)`, puis pour chaque catégorie récupère les sous-catégories, et pour chaque sous-catégorie récupère les produits. N'affiche que les catégories qui ont au moins un produit.

**Interactions :**
- Clic sur une catégorie → `/pages/subcategories?categoryId=X&categoryName=Y`
- Bouton éditer → ouvre une modal pour modifier le nom et/ou l'image de la catégorie
- Sélection d'image via `ImagePicker` (ratio 16:9, qualité 0.8)
- Sauvegarde → `categoriesAPI.updateCategory()` avec un `FormData`

---

### `pages/subcategories.tsx` — Produits d'une catégorie

Reçoit `categoryId` et `categoryName` en paramètres.

Récupère les sous-catégories de la catégorie, puis les produits de chaque sous-catégorie. Affiche les produits groupés par sous-catégorie. Chaque produit montre son `stockCount`.

Clic sur un produit → `/pages/product-detail?productId=X`

---

### `pages/product-detail.tsx` — Détail d'un produit

Reçoit `productId` en paramètre. Appelle `productsAPI.getProductById()`.

Affiche :
- Image, nom, sous-catégorie, masse/volume si renseigné
- Nombre d'unités en stock (`stockCount`)
- Liste des `productBatches` avec leurs dates d'expiration
- Indicateurs `expiringSoon` et `isExpired`

Bouton "Ajouter au panier" → `cartAPI.addProduct()`.

---

### `pages/cart.tsx` — Panier de courses

Affiche le contenu du panier via `cartAPI.getCart()`. Pour chaque produit dans le panier, montre la quantité désirée.

Clic sur un produit → incrémente/décrémente la quantité (`cartAPI.updateProduct()`).
Bouton poubelle → `cartAPI.removeProduct()`.
Bouton "Valider l'achat" → navigue vers `/pages/panier`.

---

### `pages/panier.tsx` — Validation des achats

C'est ici que les articles du panier sont convertis en unités de stock.

**Concept des lignes :** Chaque `CartProduct` avec une quantité de N est éclaté en N lignes individuelles. Chaque ligne représente une unité physique avec sa propre case à cocher et son propre champ de date d'expiration.

**État :**
```typescript
interface CartLine {
  lineId: string;            // "${cartProductId}-${index}"
  cartProductId: number;
  productId: number;
  productName: string;
  productPicture: string;
  subcategoryName: string;
  checked: boolean;
  expirationDate: string;    // Format DD/MM/YYYY saisi par l'utilisateur
}

lines: CartLine[]
loading: boolean
actionLoading: boolean
homeId: number | null
```

**Bouton "Acheter" :** Pour chaque ligne cochée, crée un `ProductBatch` via `productsAPI.createBatch()` avec la date d'expiration parsée (DD/MM/YYYY → ISO). Met ensuite à jour les quantités du panier (décrémente ou supprime selon ce qui reste).

**Bouton "Supprimer" :** Pour chaque ligne cochée, décrémente la quantité du `CartProduct` correspondant dans le panier (ou le supprime si quantité tombe à 0), sans créer de batch.

La date d'expiration est optionnelle. Si le champ est vide, le batch est créé sans date (`expirationDate: null`).

---

### `pages/recipe.tsx` — Liste des recettes

Récupère les recettes via `recipesAPI.getRecipesByHome()`. Affiche une grille à deux colonnes. Clic → `/pages/recipe-detail?recipeId=X`.

---

### `pages/recipe-detail.tsx` — Détail d'une recette

Reçoit `recipeId`. Appelle `recipesAPI.getRecipeById()`.

**État :**
```typescript
recipe: Recipe | null
loading: boolean
servings: number    // Nombre de portions, commence à 1
```

**Calcul des quantités :** Si un ingrédient a `multipliable === true`, la quantité affichée est `quantityNeeded × servings`. Sinon, elle reste fixe.

**Actions :**
- Bouton Modifier → `/pages/edit-recipe?recipeId=X`
- Bouton Supprimer → confirmation, puis `recipesAPI.deleteRecipe()`, puis `router.back()`

---

### `pages/edit-recipe.tsx` — Édition d'une recette

Reçoit `recipeId`. Charge la recette et permet de modifier :
- Nom, description, image (via ImagePicker)
- Ingrédients : ajout via recherche de produit, modification quantité/multipliable, suppression
- Étapes : ajout, modification du contenu, suppression

Chaque modification appelle directement l'API correspondante (`recipesAPI.updateIngredient()`, `recipesAPI.addStep()`, etc.).

---

### `pages/profile.tsx` — Profil utilisateur

Utilise `useAuth()` pour récupérer `user`, `logout`, `loadUser`.

**Mode lecture :** Affiche prénom, nom, email, avatar (ou initiales si pas d'image).

**Mode édition :** Champs pour modifier prénom et nom. Bouton pour changer l'avatar (ImagePicker). Sauvegarde via `authAPI.updateProfile()` et `authAPI.updateAvatar()`.

**Changement de mot de passe :** Modal avec trois champs (mot de passe actuel, nouveau, confirmation). Validation locale (8 caractères minimum, correspondance des deux nouveaux). Appel `authAPI.changePassword()`.

**Déconnexion :** Confirmation via `Alert.alert()`, puis `logout()` du contexte, puis navigation vers `/login`.

**Gérer le foyer :** Navigation vers `/pages/home`.

---

### `pages/home.tsx` — Gestion du foyer

Affiche les membres du foyer actif via `homesAPI.getHomeUsers()`. Permet de créer un lien d'invitation via `inviteLinksAPI.create()` et de le copier dans le presse-papier.

---

### `pages/select-home.tsx` — Sélection du foyer actif

Liste les foyers auxquels l'utilisateur appartient (via `permissionsAPI.getUserPermissions()`). Clic sur un foyer → sauvegarde `selectedHomeId` dans AsyncStorage, appelle `loadCurrentHome()` du contexte, navigue vers `/pages/stock`.

Bouton "+ Créer un foyer" → `/pages/create-home`.
Bouton "+ Rejoindre un foyer" → champ de saisie pour entrer un code d'invitation, appel `inviteLinksAPI.use()`.

---

### `pages/create-home.tsx` — Création d'un foyer

Formulaire avec un champ nom. Appel `homesAPI.create({ name, userId: user.id })`. Crée aussi la permission `owner` côté serveur automatiquement. Retour vers `/pages/select-home`.

---

## Styles

Chaque écran a son fichier de styles dans `styles/` (ex. `stock.styles.ts` pour `stock.tsx`). Tous utilisent `StyleSheet.create()`.

**Palette de couleurs :**
```
Vert principal  : #68A68F
Texte           : #333333
Texte secondaire: #666666
Fond            : #f5f5f5
Bordures        : #e0e0e0
```

**Typographie :**
```
Titre    : 24-28px, bold
Sous-titre: 16px, semi-bold (600)
Corps    : 14px
Petit    : 12px
```

---

## Gestion des erreurs

Les erreurs API sont généralement attrapées avec `try/catch`. En cas d'erreur, un `Alert.alert()` est affiché à l'utilisateur avec le message d'erreur. Pas de système de retry automatique.

---

## Build

Pour générer un APK Android ou une IPA iOS via EAS :

```bash
npx eas build --platform android --local
npx eas build --platform ios --local
```

Pour exporter la version web :

```bash
npx expo export --platform web
```
