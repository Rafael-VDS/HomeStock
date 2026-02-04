# Structure du Backend NestJS - Bonnes Pratiques

## 📁 Architecture du projet

```
backend/src/
├── common/                     # Code partagé entre modules
│   ├── decorators/            # Décorateurs personnalisés (@CurrentUser, etc.)
│   ├── filters/               # Exception filters (gestion des erreurs)
│   ├── guards/                # Guards (authentification, rôles)
│   ├── interceptors/          # Interceptors (transformation, logging)
│   └── pipes/                 # Pipes (validation, transformation)
│
├── config/                     # Configuration de l'application
│   └── configuration.ts       # Variables d'environnement centralisées
│
├── prisma.service.ts          # Service Prisma global
│
├── [feature]/                 # Modules par fonctionnalité (products, users, etc.)
│   ├── dto/                   # Data Transfer Objects
│   │   ├── create-[feature].dto.ts
│   │   └── update-[feature].dto.ts
│   ├── entities/              # Entités (représentation des données)
│   │   └── [feature].entity.ts
│   ├── [feature].controller.ts
│   ├── [feature].service.ts
│   └── [feature].module.ts
│
├── app.module.ts              # Module racine
└── main.ts                    # Point d'entrée de l'application
```

## 🎯 Principes fondamentaux

### 1. **Séparation des préoccupations**
- **Controllers** : Gèrent les requêtes HTTP uniquement
- **Services** : Contiennent la logique métier
- **DTOs** : Définissent et valident les données entrantes
- **Entities** : Représentent les modèles de données

### 2. **Module par fonctionnalité**
Chaque fonctionnalité (products, users, recipes) est un module autonome avec :
- Son controller
- Son service
- Ses DTOs
- Ses entities

### 3. **Code partagé dans `common/`**
Tout ce qui est réutilisable entre modules va dans `common/` :
- Decorators personnalisés
- Exception filters
- Guards (auth, roles)
- Interceptors (logging, transform)
- Pipes (validation)

## 🔧 Composants principaux

### Controllers
```typescript
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  findAll() {
    return this.productsService.findAll();
  }
}
```

**Responsabilités** :
- Définir les routes
- Valider les entrées (avec DTOs)
- Appeler les services
- Documenter avec Swagger

### Services
```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: { home: true }
    });
  }
}
```

**Responsabilités** :
- Logique métier
- Accès aux données (Prisma)
- Validation business rules
- Transformations complexes

### DTOs (Data Transfer Objects)
```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  homeId: number;
}
```

**Responsabilités** :
- Définir la structure des données
- Validation avec `class-validator`
- Documentation Swagger

### Entities
```typescript
export class ProductEntity {
  id: number;
  name: string;
  homeId: number;
}
```

**Responsabilités** :
- Représenter les données retournées par l'API
- Documentation Swagger pour les responses

## 🛡️ Middleware & Guards

### Exception Filters
Gèrent les erreurs de manière cohérente dans toute l'application.

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Formate toutes les erreurs de manière standardisée
  }
}
```

### Interceptors
Transforment les requêtes/réponses ou ajoutent de la logique (logging).

```typescript
// common/interceptors/logging.interceptor.ts
export class LoggingInterceptor implements NestInterceptor {
  // Log toutes les requêtes avec temps de réponse
}
```

### Pipes
Valident et transforment les données entrantes.

```typescript
// Utilisé globalement dans main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

## 📊 Configuration Swagger

Toute l'API est documentée automatiquement avec Swagger :

- **URL** : http://localhost:3000/api/docs
- Décorateurs utilisés :
  - `@ApiTags()` : Grouper les endpoints
  - `@ApiOperation()` : Décrire l'endpoint
  - `@ApiResponse()` : Décrire les réponses
  - `@ApiProperty()` : Documenter les propriétés

## 🚀 Points d'entrée de l'API

- **Base URL** : `http://localhost:3000/api/v1`
- **Documentation** : `http://localhost:3000/api/docs`

### Exemple d'endpoints générés :
- `GET /api/v1/products` - Liste tous les produits
- `GET /api/v1/products/:id` - Détails d'un produit
- `POST /api/v1/products` - Créer un produit
- `PATCH /api/v1/products/:id` - Modifier un produit
- `DELETE /api/v1/products/:id` - Supprimer un produit
- `GET /api/v1/products/home/:homeId` - Produits par maison
- `GET /api/v1/products/:id/stock` - Stock d'un produit

## 📝 Validation automatique

Grâce aux DTOs et class-validator :
```typescript
// Requête invalide
POST /api/v1/products
{ "name": "" }

// Réponse automatique
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "property": "name",
      "constraints": {
        "isNotEmpty": "name should not be empty"
      }
    }
  ]
}
```

## 🔄 Prochaines étapes recommandées

1. **Créer les autres modules** :
   - Users
   - Homes
   - Categories
   - Recipes
   - Carts

2. **Ajouter l'authentification** :
   - Module Auth avec JWT
   - Guards pour protéger les routes
   - Decorator `@CurrentUser()`

3. **Tests** :
   - Unit tests pour les services
   - E2E tests pour les controllers

4. **Database** :
   - Créer la première migration Prisma
   - Seed de données de test

## 🎨 Commandes utiles

```bash
# Créer un nouveau module
nest g module [name]

# Créer un controller
nest g controller [name]

# Créer un service
nest g service [name]

# Créer une ressource complète (CRUD)
nest g resource [name]

# Démarrer en mode dev
npm run start:dev

# Builder pour production
npm run build
```

## 📚 Ressources

- [Documentation NestJS](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI](https://docs.nestjs.com/openapi/introduction)
