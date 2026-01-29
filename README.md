# HomeStock

Application de gestion de stock avec Expo (React Native) et Node.js.

## Technologies

- Frontend : Expo (React Native)
- Backend : Node.js + Express
- Base de données : MySQL
- Admin DB : phpMyAdmin

## Installation

```bash
docker-compose up --build
```

## Accès

- Backend : http://localhost:3000
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