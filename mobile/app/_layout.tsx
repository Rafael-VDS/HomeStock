import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // Masquer la barre de navigation sur Android
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#68A68F',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ title: 'Connexion' }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ title: 'Inscription' }} 
        />
        <Stack.Screen 
          name="pages/stock" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/cart" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/recipe" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/profile" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/home" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/select-home" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/create-home" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </AuthProvider>
  );
}
