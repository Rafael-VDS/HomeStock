import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { permissionsAPI, Permission } from '../../services/api';
import { styles } from '../../styles/select-home.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectHomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (user) {
      loadPermissions();
    }
  }, [user, loading]);

  const loadPermissions = async () => {
    try {
      const data = await permissionsAPI.getUserPermissions(user!.id);
      setPermissions(data);

      // Si aucun foyer, rediriger vers création
      if (data.length === 0) {
        router.replace('/pages/create-home');
        return;
      }

      // Si un seul foyer, sélectionner automatiquement
      if (data.length === 1) {
        await selectHome(data[0].homeId, data[0].home?.name || 'Mon foyer');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      Alert.alert('Erreur', 'Impossible de charger vos foyers');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const selectHome = async (homeId: number, homeName: string) => {
    try {
      // Sauvegarder le foyer sélectionné
      await AsyncStorage.setItem('selectedHomeId', homeId.toString());
      await AsyncStorage.setItem('selectedHomeName', homeName);
      
      // Rediriger vers stock
      router.replace('/pages/stock');
    } catch (error) {
      console.error('Erreur lors de la sélection du foyer:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner ce foyer');
    }
  };

  const handleCreateNewHome = () => {
    router.push('/pages/create-home');
  };

  if (loading || loadingPermissions) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={[]}>
        <ActivityIndicator size="large" color="#68A68F" />
      </SafeAreaView>
    );
  }

  // Si un seul foyer, ne rien afficher (redirection automatique)
  if (permissions.length === 1) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={[]}>
        <ActivityIndicator size="large" color="#68A68F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sélectionnez votre foyer</Text>
          <Text style={styles.subtitle}>Choisissez le foyer que vous souhaitez gérer</Text>
        </View>

        <View style={styles.homesContainer}>
          {permissions.map((permission) => (
            <TouchableOpacity
              key={permission.id}
              style={styles.homeCard}
              onPress={() => selectHome(permission.homeId, permission.home?.name || 'Mon foyer')}
            >
              <View style={styles.homeIconContainer}>
                <Ionicons name="home" size={32} color="#68A68F" />
              </View>
              <View style={styles.homeInfo}>
                <Text style={styles.homeName}>{permission.home?.name || 'Mon foyer'}</Text>
                <Text style={styles.homeRole}>
                  {permission.type === 'OWNER' ? 'Propriétaire' : 'Membre'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateNewHome}>
          <Ionicons name="add-circle-outline" size={24} color="#68A68F" />
          <Text style={styles.createButtonText}>Créer un nouveau foyer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
