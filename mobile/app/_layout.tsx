import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
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
          name="pages/profile" 
          options={{ title: 'Mon Profil' }} 
        />
      </Stack>
    </AuthProvider>
  );
}
