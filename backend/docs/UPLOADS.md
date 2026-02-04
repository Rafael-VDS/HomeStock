# 📁 Gestion des Uploads

## Structure des dossiers

```
backend/public/uploads/
├── avatars/          # Avatars utilisateurs (jpg, png, webp)
├── products/         # Images de produits (à créer)
├── recipes/          # Images de recettes (à créer)
└── categories/       # Images de catégories (à créer)
```

## 🌐 URLs d'accès

Les fichiers sont accessibles via :
```
http://localhost:3000/uploads/avatars/alice-martin.jpg
http://localhost:3000/uploads/products/product-123.jpg
http://localhost:3000/uploads/recipes/recipe-456.jpg
```

## 🎨 Avatars utilisateurs

### Générer des avatars par défaut

**Option 1 : UI Avatars (API gratuite)**
```bash
https://ui-avatars.com/api/?name=Alice+Martin&size=400&background=4f46e5&color=fff
```

**Option 2 : DiceBear Avatars**
```bash
https://api.dicebear.com/7.x/avataaars/png?seed=alice-martin
```

### Script PowerShell

Utilisez le script `download-avatars.ps1` à la racine du projet.

## 📤 Upload de fichiers

### Installation des dépendances

```bash
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
```

### Exemple d'endpoint upload

```typescript
@Post(':id/avatar')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './public/uploads/avatars',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `user-${req.params.id}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
}))
uploadAvatar(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
  return { filename: file.filename, path: `/uploads/avatars/${file.filename}` };
}
```

## 🔒 Sécurité

### Règles à implémenter

1. **Taille maximale** : 5MB pour les avatars, 10MB pour les photos de produits
2. **Types autorisés** : jpg, jpeg, png, webp (pas de svg, exe, etc.)
3. **Validation MIME** : Vérifier le Content-Type ET l'extension
4. **Nettoyage** : Supprimer l'ancien avatar quand un nouveau est uploadé
5. **Noms de fichiers** : Utiliser des UUIDs ou timestamps pour éviter les conflits

### Exemple de validation

```typescript
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateImage(file: Express.Multer.File): boolean {
  if (!ALLOWED_MIMES.includes(file.mimetype)) return false;
  if (file.size > MAX_SIZE) return false;
  return true;
}
```

## 🗑️ Nettoyage automatique

Pour supprimer les anciens avatars :

```typescript
import { unlink } from 'fs/promises';
import { join } from 'path';

async function deleteOldAvatar(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.picture) {
    const filepath = join(__dirname, '..', 'public', user.picture);
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Failed to delete old avatar:', error);
    }
  }
}
```

## 📊 Base de données

Format du champ `picture` :
```
/uploads/avatars/user-1-1707045123456.jpg
```

L'URL complète est construite côté client :
```typescript
const fullUrl = `${API_BASE_URL}${user.picture}`;
// http://localhost:3000/uploads/avatars/user-1-1707045123456.jpg
```

## 🐳 Docker

Les uploads sont persistants grâce au volume :
```yaml
volumes:
  - ./backend:/app
  - /app/node_modules
```

Les fichiers dans `public/uploads/` sont conservés entre les redémarrages.

## 🎯 Bonnes pratiques

1. **CDN en production** : Utiliser AWS S3, Cloudinary, ou DigitalOcean Spaces
2. **Redimensionnement** : Utiliser `sharp` pour créer des thumbnails
3. **Format WebP** : Convertir en WebP pour optimiser la taille
4. **Cache** : Ajouter des headers Cache-Control appropriés
5. **Backup** : Sauvegarder régulièrement le dossier uploads/

## 📦 Optimisation des images avec Sharp

```bash
npm install --save sharp
```

```typescript
import sharp from 'sharp';

async function optimizeImage(inputPath: string, outputPath: string) {
  await sharp(inputPath)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(outputPath);
}
```
