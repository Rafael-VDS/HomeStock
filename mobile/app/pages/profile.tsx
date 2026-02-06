import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import NavBar from '../../components/NavBar';
import { authAPI } from '../../services/api';
import { styles } from '../../styles/profile.styles';
import { URL } from '../../services/api';

export default function ProfileScreen() {
  const { user, loading, logout, loadUser } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFirstname, setEditedFirstname] = useState('');
  const [editedLastname, setEditedLastname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Modal changement de mot de passe
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUser();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de recharger le profil');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    setEditedFirstname(user?.firstname || '');
    setEditedLastname(user?.lastname || '');
    setSelectedImage(null);
    setIsEditing(true);
  };

  const handleSelectImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  const handleSubmitPasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authAPI.changePassword(user!.id, { password: newPassword });
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de changer le mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedFirstname.trim() || !editedLastname.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom ne peuvent pas être vides');
      return;
    }

    setIsSaving(true);
    try {
      // Mise à jour du profil (nom et prénom)
      await authAPI.updateProfile(user!.id, {
        firstname: editedFirstname,
        lastname: editedLastname,
      });

      // Upload de l'avatar si une image a été sélectionnée
      if (selectedImage) {
        const formData = new FormData();
        const filename = selectedImage.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: selectedImage,
          name: filename,
          type,
        } as any);

        await authAPI.updateAvatar(user!.id, formData);
      }

      await loadUser();
      setIsEditing(false);
      setSelectedImage(null);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedImage(null);
  };

  const handleManageHome = () => {
    router.push('/pages/home');
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={[]}>
        <ActivityIndicator size="large" color="#68A68F" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
        </View>
        
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleSelectImage}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            <View style={styles.avatarWrapper}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : user.picture ? (
                <Image
                  source={{ uri: `${URL}${user.picture}` }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.firstname[0]}{user.lastname[0]}
                  </Text>
                </View>
              )}
              {isEditing && (
                <View style={styles.avatarOverlay}>
                  <Ionicons name="pencil" size={32} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>
            {user.firstname} {user.lastname}
          </Text>
          <Text style={styles.email}>{user.mail}</Text>
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations du profil</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prénom</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedFirstname}
                onChangeText={setEditedFirstname}
                placeholder="Prénom"
              />
            ) : (
              <Text style={styles.infoValue}>{user.firstname}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedLastname}
                onChangeText={setEditedLastname}
                placeholder="Nom"
              />
            ) : (
              <Text style={styles.infoValue}>{user.lastname}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.mail}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleChangePassword}>
          <Ionicons name="lock-closed-outline" size={20} color="#68A68F" />
          <Text style={styles.secondaryButtonText}>Changer de mot de passe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleManageHome}>
          <Ionicons name="home-outline" size={20} color="#68A68F" />
          <Text style={styles.secondaryButtonText}>Gestion du foyer</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" style={styles.chevron} />
        </TouchableOpacity>

        <View style={styles.divider} />
        <View style={{ height: 20 }} />

        {!isEditing ? (
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#68A68F" />
            <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
        <View style={styles.divider} />
        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="#68A68F" />
          ) : (
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
        <View style={styles.divider} />
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    {/* Modal changement de mot de passe */}
    <Modal
      visible={passwordModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setPasswordModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Changer de mot de passe</Text>
            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 8 caractères"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retaper le mot de passe"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.modalButton, isChangingPassword && styles.modalButtonDisabled]}
              onPress={handleSubmitPasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Modifier le mot de passe</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    
    <NavBar />
    </SafeAreaView>
  );
}
