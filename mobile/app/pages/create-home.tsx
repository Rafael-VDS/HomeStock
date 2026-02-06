import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { homesAPI } from '../../services/api';
import { styles } from '../../styles/create-home.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateHomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [homeName, setHomeName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  const handleCreateHome = async () => {
    if (!homeName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour votre foyer');
      return;
    }

    setCreating(true);
    try {
      const newHome = await homesAPI.create({ 
        name: homeName,
        userId: user!.id,
      });
      
      // Sauvegarder le foyer créé comme foyer sélectionné
      await AsyncStorage.setItem('selectedHomeId', newHome.id.toString());
      await AsyncStorage.setItem('selectedHomeName', newHome.name);
      
      Alert.alert('Succès', 'Votre foyer a été créé avec succès', [
        {
          text: 'OK',
          onPress: () => router.replace('/pages/stock'),
        },
      ]);
    } catch (error: any) {
      console.error('Erreur lors de la création du foyer:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer le foyer');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={[]}>
        <ActivityIndicator size="large" color="#68A68F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="home" size={64} color="#68A68F" />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Créez votre foyer</Text>
            <Text style={styles.subtitle}>
              Donnez un nom à votre foyer pour commencer à gérer votre stock
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom du foyer</Text>
              <TextInput
                style={styles.input}
                value={homeName}
                onChangeText={setHomeName}
                placeholder="Ex: Ma maison, Appartement Paris..."
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreateHome}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                  <Text style={styles.createButtonText}>Créer mon foyer</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color="#68A68F" />
              <Text style={styles.infoText}>
                Vous pourrez inviter d'autres personnes à rejoindre votre foyer plus tard
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
