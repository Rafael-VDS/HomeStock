# 🧪 Tests API - HomeStock

> Requêtes pour tester les endpoints de l'API

## 📋 Prérequis

- Serveur lancé : `npm run start:dev`
- Base URL : `http://localhost:3000/api`
- Documentation Swagger : `http://localhost:3000/api/docs`

---

# 🔐 Module Auth

## 1️⃣ Inscription (Register)

### Request
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstname": "Marie",
  "lastname": "Dubois",
  "mail": "marie.dubois@example.com",
  "password": "SecurePass123!",
  "picture": "/uploads/avatars/marie-dubois.jpg"
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Marie\",\"lastname\":\"Dubois\",\"mail\":\"marie.dubois@example.com\",\"password\":\"SecurePass123!\",\"picture\":\"/uploads/avatars/marie-dubois.jpg\"}"
```

### Response attendue (201 Created)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJlbWFpbCI6Im1hcmllLmR1Ym9pc0BleGFtcGxlLmNvbSIsImlhdCI6MTcwNzA0NTEyMywiZXhwIjoxNzA3MDQ4NzIzfQ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 11,
    "firstname": "Marie",
    "lastname": "Dubois",
    "mail": "marie.dubois@example.com",
    "picture": "/uploads/avatars/marie-dubois.jpg"
  }
}
```

---

## 2️⃣ Connexion (Login)

### Request
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "mail": "alice.martin@example.com",
  "password": "Password123"
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"mail\":\"alice.martin@example.com\",\"password\":\"Password123\"}"
```

### Response attendue (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWxpY2UubWFydGluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA3MDQ1MTIzLCJleHAiOjE3MDcwNDg3MjN9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "firstname": "Alice",
    "lastname": "Martin",
    "mail": "alice.martin@example.com",
    "picture": "/uploads/avatars/alice-martin.jpg"
  }
}
```

---

## 3️⃣ Récupérer son profil (protégé)

**⚠️ Nécessite un token JWT dans le header Authorization**

### Request
```bash
GET http://localhost:3000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### cURL
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### Response attendue (200 OK)
```json
{
  "id": 1,
  "firstname": "Alice",
  "lastname": "Martin",
  "mail": "alice.martin@example.com",
  "picture": "/uploads/avatars/alice-martin.jpg"
}
```

### Erreurs possibles

**401 Unauthorized - Token manquant ou invalide**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**401 Unauthorized - Mauvais identifiants (login)**
```json
{
  "statusCode": 401,
  "message": "Email ou mot de passe incorrect"
}
```

**409 Conflict - Email déjà utilisé (register)**
```json
{
  "statusCode": 409,
  "message": "Un utilisateur avec cet email existe déjà"
}
```

---

# 👤 Module Users

## 1️⃣ Créer un utilisateur

### Request
```bash
POST http://localhost:3000/api/users
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
curl -X POST http://localhost:3000/api/users \
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
POST http://localhost:3000/api/users
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
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"firstname\":\"Jane\",\"lastname\":\"Smith\",\"mail\":\"jane.smith@example.com\",\"password\":\"Password456!\",\"picture\":\"https://randomuser.me/api/portraits/women/2.jpg\"}"
```

---

## 3️⃣ Récupérer tous les utilisateurs

### Request
```bash
GET http://localhost:3000/api/users
```

### cURL
```bash
curl http://localhost:3000/api/users
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
GET http://localhost:3000/api/users/1
```

### cURL
```bash
curl http://localhost:3000/api/users/1
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
GET http://localhost:3000/api/users/search?mail=john.doe@example.com
```

### cURL
```bash
curl "http://localhost:3000/api/users/search?mail=john.doe@example.com"
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
PATCH http://localhost:3000/api/users/1
Content-Type: application/json

{
  "firstname": "Johnny",
  "picture": "https://randomuser.me/api/portraits/men/10.jpg"
}
```

### cURL
```bash
curl -X PATCH http://localhost:3000/api/users/1 \
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
GET http://localhost:3000/api/users/1/permissions
```

### cURL
```bash
curl http://localhost:3000/api/users/1/permissions
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
DELETE http://localhost:3000/api/users/2
```

### cURL
```bash
curl -X DELETE http://localhost:3000/api/users/2
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
POST http://localhost:3000/api/users
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
GET http://localhost:3000/api/users/999
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
POST http://localhost:3000/api/users
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
@baseUrl = http://localhost:3000/api
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
