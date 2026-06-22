# HomeStock — Mobile

Application mobile du projet HomeStock, construite avec React Native et Expo.

## Stack

- React Native 0.81, TypeScript
- Expo Router 6 (navigation basée sur les fichiers)
- Axios (requêtes HTTP avec intercepteur JWT)
- Context API + AsyncStorage (état global et persistance locale)
- Expo Image Picker (sélection de photos)
- Ionicons (icônes)

## Lancer l'application

```bash
npm install
npm start
```

Expo affiche un QR code. Scannez-le avec l'app **Expo Go** sur votre téléphone.
Ou appuyez sur `a` pour Android / `i` pour iOS.

Avant de lancer, vérifiez que l'URL dans `config/config.ts` correspond à l'adresse IP de la machine qui fait tourner le backend :

```typescript
export const API_URL = 'http://192.168.X.X:3000';
```

Sur émulateur Android, utilisez `10.0.2.2` à la place de `localhost`.

## Build

Pour générer un APK Android ou une IPA iOS via EAS :

```bash
npx eas build --platform android --local
npx eas build --platform ios --local
```

## Documentation

- [Écrans, navigation, appels API, build](../doc/MOBILE.md)
