# 🧪 Tests API - Users Module

> Requêtes pour tester les endpoints du module Users

## 📋 Prérequis

- Serveur lancé : `npm run start:dev`
- Base URL : `http://localhost:3000/api/v1`
- Documentation Swagger : `http://localhost:3000/api/docs`

---

## 1️⃣ Créer un utilisateur

### Request
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "mail": "john.doe@example.com",
  "password": "SecurePass123!",
  "picture": "https://randomuser.me/api/portraits/men/1.jpg"
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"John\",\"lastname\":\"Doe\",\"mail\":\"john.doe@example.com\",\"password\":\"SecurePass123!\",\"picture\":\"https://randomuser.me/api/portraits/men/1.jpg\"}"
```

### Response attendue (201 Created)
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe",
  "mail": "john.doe@example.com",
  "picture": "https://randomuser.me/api/portraits/men/1.jpg"
}
```

---

## 2️⃣ Créer un deuxième utilisateur

### Request
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "firstname": "Jane",
  "lastname": "Smith",
  "mail": "jane.smith@example.com",
  "password": "Password456!",
  "picture": "https://randomuser.me/api/portraits/women/2.jpg"
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Jane\",\"lastname\":\"Smith\",\"mail\":\"jane.smith@example.com\",\"password\":\"Password456!\",\"picture\":\"https://randomuser.me/api/portraits/women/2.jpg\"}"
```

---

## 3️⃣ Récupérer tous les utilisateurs

### Request
```bash
GET http://localhost:3000/api/v1/users
```

### cURL
```bash
curl http://localhost:3000/api/v1/users
```

### Response attendue (200 OK)
```json
[
  {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "mail": "john.doe@example.com",
    "picture": "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    "id": 2,
    "firstname": "Jane",
    "lastname": "Smith",
    "mail": "jane.smith@example.com",
    "picture": "https://randomuser.me/api/portraits/women/2.jpg"
  }
]
```

---

## 4️⃣ Récupérer un utilisateur par ID

### Request
```bash
GET http://localhost:3000/api/v1/users/1
```

### cURL
```bash
curl http://localhost:3000/api/v1/users/1
```

### Response attendue (200 OK)
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe",
  "mail": "john.doe@example.com",
  "picture": "https://randomuser.me/api/portraits/men/1.jpg"
}
```

---

## 5️⃣ Rechercher un utilisateur par email

### Request
```bash
GET http://localhost:3000/api/v1/users/search?mail=john.doe@example.com
```

### cURL
```bash
curl "http://localhost:3000/api/v1/users/search?mail=john.doe@example.com"
```

### Response attendue (200 OK)
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe",
  "mail": "john.doe@example.com",
  "picture": "https://randomuser.me/api/portraits/men/1.jpg"
}
```

---

## 6️⃣ Modifier un utilisateur

### Request
```bash
PATCH http://localhost:3000/api/v1/users/1
Content-Type: application/json

{
  "firstname": "Johnny",
  "picture": "https://randomuser.me/api/portraits/men/10.jpg"
}
```

### cURL
```bash
curl -X PATCH http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Johnny\",\"picture\":\"https://randomuser.me/api/portraits/men/10.jpg\"}"
```

### Response attendue (200 OK)
```json
{
  "id": 1,
  "firstname": "Johnny",
  "lastname": "Doe",
  "mail": "john.doe@example.com",
  "picture": "https://randomuser.me/api/portraits/men/10.jpg"
}
```

---

## 7️⃣ Récupérer les permissions d'un utilisateur

### Request
```bash
GET http://localhost:3000/api/v1/users/1/permissions
```

### cURL
```bash
curl http://localhost:3000/api/v1/users/1/permissions
```

### Response attendue (200 OK)
```json
[]
```
*Note : Vide pour l'instant car le module Permissions n'est pas encore implémenté*

---

## 8️⃣ Supprimer un utilisateur

### Request
```bash
DELETE http://localhost:3000/api/v1/users/2
```

### cURL
```bash
curl -X DELETE http://localhost:3000/api/v1/users/2
```

### Response attendue (200 OK)
```json
{
  "message": "Utilisateur #2 supprimé avec succès"
}
```

---

## ❌ Tests d'erreurs

### Email déjà existant (409 Conflict)
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "firstname": "Test",
  "lastname": "User",
  "mail": "john.doe@example.com",
  "password": "password123"
}
```

**Response :**
```json
{
  "statusCode": 409,
  "message": "Un utilisateur avec cet email existe déjà"
}
```

### Utilisateur introuvable (404 Not Found)
```bash
GET http://localhost:3000/api/v1/users/999
```

**Response :**
```json
{
  "statusCode": 404,
  "message": "Utilisateur #999 introuvable"
}
```

### Validation échouée (400 Bad Request)
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "firstname": "Test",
  "mail": "invalid-email",
  "password": "short"
}
```

**Response :**
```json
{
  "statusCode": 400,
  "message": [
    "lastname should not be empty",
    "mail must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

---

## 🔧 Utilisation avec VS Code REST Client

Si vous avez l'extension **REST Client** installée, créez un fichier `api.http` avec ce contenu :

```http
### Variables
@baseUrl = http://localhost:3000/api/v1
@contentType = application/json

### 1. Créer un utilisateur
POST {{baseUrl}}/users
Content-Type: {{contentType}}

{
  "firstname": "John",
  "lastname": "Doe",
  "mail": "john.doe@example.com",
  "password": "SecurePass123!",
  "picture": "https://randomuser.me/api/portraits/men/1.jpg"
}

### 2. Récupérer tous les utilisateurs
GET {{baseUrl}}/users

### 3. Récupérer un utilisateur par ID
GET {{baseUrl}}/users/1

### 4. Rechercher par email
GET {{baseUrl}}/users/search?mail=john.doe@example.com

### 5. Modifier un utilisateur
PATCH {{baseUrl}}/users/1
Content-Type: {{contentType}}

{
  "firstname": "Johnny"
}

### 6. Permissions d'un utilisateur
GET {{baseUrl}}/users/1/permissions

### 7. Supprimer un utilisateur
DELETE {{baseUrl}}/users/1
```

---

## 📦 Installer bcrypt (requis)

Le module Users utilise `bcrypt` pour hasher les mots de passe. Installez-le :

```bash
cd backend
npm install bcrypt
npm install -D @types/bcrypt
```

---

## 🚀 Lancer le serveur

```bash
cd backend
npm run start:dev
```

Le serveur démarre sur `http://localhost:3000`

---

## 📊 Swagger UI

Pour tester visuellement l'API avec une interface graphique :

👉 **http://localhost:3000/api/docs**

Tous les endpoints sont documentés et testables directement depuis Swagger !
