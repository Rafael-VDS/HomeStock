import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { permissionsAPI, inviteLinksAPI, Permission } from '../../services/api';
import { styles } from '../../styles/select-home.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectHomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningHome, setJoiningHome] = useState(false);

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

      // Si aucun foyer, afficher le choix créer/rejoindre
      if (data.length === 0) {
        setShowChoiceModal(true);
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

  const handleOpenJoinModal = () => {
    setShowChoiceModal(false);
    setShowJoinModal(true);
  };

  const handleJoinHome = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code d\'invitation');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setJoiningHome(true);
    try {
      const permission = await inviteLinksAPI.use({ 
        link: joinCode.trim(), 
        userId: user.id 
      });
      
      // Sélectionner automatiquement le foyer rejoint
      await AsyncStorage.setItem('selectedHomeId', permission.homeId.toString());
      await AsyncStorage.setItem('selectedHomeName', permission.home?.name || 'Mon foyer');
      
      Alert.alert('Succès', 'Vous avez rejoint le foyer avec succès', [
        {
          text: 'OK',
          onPress: () => router.replace('/pages/stock'),
        },
      ]);
    } catch (error: any) {
      console.error('Erreur lors de la tentative de rejoindre le foyer:', error);
      const message = error.response?.data?.message || 'Impossible de rejoindre le foyer. Vérifiez le code.';
      Alert.alert('Erreur', message);
    } finally {
      setJoiningHome(false);
    }
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

  // Si pas de foyer et modal de choix
  if (permissions.length === 0 && showChoiceModal) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="home" size={64} color="#68A68F" />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Bienvenue !</Text>
            <Text style={styles.subtitle}>
              Pour commencer, créez votre foyer ou rejoignez celui de votre famille
            </Text>

            <TouchableOpacity
              style={styles.choiceButton}
              onPress={handleCreateNewHome}
            >
              <View style={styles.choiceIconContainer}>
                <Ionicons name="add-circle-outline" size={32} color="#68A68F" />
              </View>
              <View style={styles.choiceInfo}>
                <Text style={styles.choiceTitle}>Créer un foyer</Text>
                <Text style={styles.choiceDescription}>
                  Créez votre propre foyer et invitez votre famille
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.choiceButton}
              onPress={handleOpenJoinModal}
            >
              <View style={styles.choiceIconContainer}>
                <Ionicons name="enter-outline" size={32} color="#68A68F" />
              </View>
              <View style={styles.choiceInfo}>
                <Text style={styles.choiceTitle}>Rejoindre un foyer</Text>
                <Text style={styles.choiceDescription}>
                  J'ai un code d'invitation de ma famille
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Si pas de foyer et modal de rejoindre
  if (permissions.length === 0 && showJoinModal) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                setShowJoinModal(false);
                setShowChoiceModal(true);
                setJoinCode('');
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="enter-outline" size={64} color="#68A68F" />
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>Rejoindre un foyer</Text>
              <Text style={styles.subtitle}>
                Entrez le code d'invitation que vous avez reçu
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Code d'invitation</Text>
                <TextInput
                  style={styles.codeInput}
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholder="Entrez le code ici"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={25}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.createButton, joiningHome && styles.createButtonDisabled]}
                onPress={handleJoinHome}
                disabled={joiningHome}
              >
                {joiningHome ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                    <Text style={styles.createButtonText}>Rejoindre le foyer</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={24} color="#68A68F" />
                <Text style={styles.infoText}>
                  Demandez le code d'invitation au propriétaire du foyer
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
