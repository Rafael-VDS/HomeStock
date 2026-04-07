import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View } from 'react-native';
import NavBar from "../components/NavBar";
import { usePathname } from "expo-router";

export default function RootLayout() {
  const pathname = usePathname();
  
  // Afficher la NavBar seulement sur les pages principales
  const showNavBar = [
    '/pages/stock',
    '/pages/cart',
    '/pages/recipe',
    '/pages/profile',
    '/pages/home',
    '/pages/subcategories',
    '/pages/product-detail',
    '/pages/panier'
  ].includes(pathname);

  useEffect(() => {
    // Masquer la barre de navigation sur Android
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
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
        <Stack.Screen 
          name="pages/subcategories" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/product-detail" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/panier" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/add-menu" 
          options={{ title: 'Ajouter' }} 
        />
        <Stack.Screen 
          name="pages/add-category" 
          options={{ title: 'Ajouter une catégorie' }} 
        />
        <Stack.Screen 
          name="pages/add-subcategory" 
          options={{ title: 'Ajouter une sous-catégorie' }} 
        />
        <Stack.Screen 
          name="pages/add-product" 
          options={{ title: 'Ajouter un produit' }} 
        />
        <Stack.Screen 
          name="pages/add-batch" 
          options={{ title: 'Ajouter un lot' }} 
        />
        <Stack.Screen 
          name="pages/add-recipe" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/recipe-detail" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="pages/edit-recipe" 
          options={{ title: 'Modifier la recette' }} 
        />
      </Stack>
        {showNavBar && <NavBar pathname={pathname} />}
      </View>
    </AuthProvider>
  );
}
