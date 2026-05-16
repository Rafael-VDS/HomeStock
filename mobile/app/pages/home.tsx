import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../context/AuthContext';
import { homesAPI, permissionsAPI, inviteLinksAPI, HomeUser, Permission, URL } from '../../services/api';
import { styles } from '../../styles/home.styles';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [homeName, setHomeName] = useState('');
  const [homeId, setHomeId] = useState<number | null>(null);
  const [homeUsers, setHomeUsers] = useState<HomeUser[]>([]);
  const [otherHomes, setOtherHomes] = useState<Permission[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [showHomeChoiceModal, setShowHomeChoiceModal] = useState(false);
  const [showJoinHomeModal, setShowJoinHomeModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningHome, setJoiningHome] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      const selectedHomeName = await AsyncStorage.getItem('selectedHomeName');
      
      if (!selectedHomeId) {
        Alert.alert('Erreur', 'Aucun foyer sélectionné');
        router.back();
        return;
      }

      const id = parseInt(selectedHomeId);
      setHomeId(id);
      setHomeName(selectedHomeName || 'Mon foyer');

      // Charger les utilisateurs du foyer
      const users = await homesAPI.getHomeUsers(id);
      // Trier pour mettre le propriétaire en premier
      const sortedUsers = users.sort((a, b) => {
        if (a.permissionType === 'owner') return -1;
        if (b.permissionType === 'owner') return 1;
        return 0;
      });
      setHomeUsers(sortedUsers);

      // Charger les autres foyers de l'utilisateur
      if (user) {
        const allPermissions = await permissionsAPI.getUserPermissions(user.id);
        // Filtrer pour exclure le foyer actuel
        const others = allPermissions.filter(p => p.homeId !== id);
        setOtherHomes(others);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du foyer:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations du foyer');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionLabel = (type: string) => {
    switch (type) {
      case 'owner':
        return 'Propriétaire';
      case 'read':
        return 'Lecture seule';
      case 'read-write':
        return 'Lecture et écriture';
      default:
        return type;
    }
  };

  const handleUserPress = (user: HomeUser) => {
    // TODO: Ouvrir la page de détails de l'utilisateur
    console.log('User pressed:', user);
  };

  const handleChangeHome = async (permission: Permission) => {
    try {
      await AsyncStorage.setItem('selectedHomeId', permission.homeId.toString());
      await AsyncStorage.setItem('selectedHomeName', permission.home?.name || 'Mon foyer');
      router.replace('/pages/stock');
    } catch (error) {
      console.error('Erreur lors du changement de foyer:', error);
      Alert.alert('Erreur', 'Impossible de changer de foyer');
    }
  };

  const handleAddHome = () => {
    setShowHomeChoiceModal(true);
  };

  const handleCreateNewHome = () => {
    setShowHomeChoiceModal(false);
    router.push('/pages/create-home');
  };

  const handleOpenJoinHome = () => {
    setShowHomeChoiceModal(false);
    setShowJoinHomeModal(true);
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
      await inviteLinksAPI.use({ link: joinCode.trim(), userId: user.id });
      Alert.alert('Succès', 'Vous avez rejoint le foyer avec succès');
      setShowJoinHomeModal(false);
      setJoinCode('');
      // Recharger les données
      loadHomeData();
    } catch (error: any) {
      console.error('Erreur lors de la tentative de rejoindre le foyer:', error);
      const message = error.response?.data?.message || 'Impossible de rejoindre le foyer. Vérifiez le code.';
      Alert.alert('Erreur', message);
    } finally {
      setJoiningHome(false);
    }
  };

  const handleOpenPermissionModal = () => {
    setShowPermissionModal(true);
  };

  const handleCreateInviteCode = async (permissionType: 'read' | 'read-write') => {
    if (!homeId) return;

    setShowPermissionModal(false);
    setCreatingInvite(true);
    try {
      const invite = await inviteLinksAPI.create({ 
        homeId, 
        permissionType 
      });
      setInviteCode(invite.link);
      setShowInviteModal(true);
    } catch (error) {
      console.error('Erreur lors de la création du code d\'invitation:', error);
      Alert.alert('Erreur', 'Impossible de créer le code d\'invitation');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteCode(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color="#68A68F" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foyer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.currentHomeSection}>
          <View style={styles.currentHomeHeader}>
            <Ionicons name="home" size={32} color="#666" />
            <Text style={styles.currentHomeName}>{homeName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personnes du foyer</Text>

          <View style={styles.card}>
            {homeUsers.map((user, index) => {
              const isOwner = user.permissionType === 'owner';
              return (
                <View key={user.id}>
                  <TouchableOpacity 
                    style={styles.personRow}
                    onPress={() => !isOwner && handleUserPress(user)}
                    disabled={isOwner}
                  >
                    <View style={styles.personAvatar}>
                      {user.picture ? (
                        <Image
                          source={{ uri: `${URL}${user.picture}` }}
                          style={styles.avatarImage}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {user.firstname[0]}{user.lastname[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{user.firstname} {user.lastname}</Text>
                      <Text style={styles.personRole}>{getPermissionLabel(user.permissionType)}</Text>
                    </View>
                    {!isOwner && <Ionicons name="chevron-forward" size={20} color="#999" />}
                  </TouchableOpacity>
                  {index < homeUsers.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleOpenPermissionModal} disabled={creatingInvite}>
            <Text style={styles.addButtonText}>
              {creatingInvite ? 'Création...' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changer de foyer</Text>

          {otherHomes.length > 0 ? (
            <>
              <View style={styles.card}>
                {otherHomes.map((permission, index) => (
                  <View key={permission.id}>
                    <View style={styles.homeRow}>
                      <View style={styles.homeIcon}>
                        <Ionicons name="home" size={24} color="#666" />
                      </View>
                      <Text style={styles.homeName}>{permission.home?.name || 'Mon foyer'}</Text>
                      <TouchableOpacity 
                        style={styles.changeButton}
                        onPress={() => handleChangeHome(permission)}
                      >
                        <Text style={styles.changeButtonText}>Changer</Text>
                      </TouchableOpacity>
                    </View>
                    {index < otherHomes.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddHome}>
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={handleAddHome}>
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal pour choisir entre créer ou rejoindre un foyer */}
      <Modal
        visible={showHomeChoiceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHomeChoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un foyer</Text>
              <TouchableOpacity onPress={() => setShowHomeChoiceModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Voulez-vous créer un nouveau foyer ou rejoindre un foyer existant ?
            </Text>

            <TouchableOpacity 
              style={styles.permissionOption}
              onPress={handleCreateNewHome}
            >
              <View style={styles.permissionIconContainer}>
                <Ionicons name="add-circle-outline" size={24} color="#68A68F" />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Créer un foyer</Text>
                <Text style={styles.permissionDescription}>
                  Créez un nouveau foyer dont vous serez le propriétaire
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.permissionDivider} />

            <TouchableOpacity 
              style={styles.permissionOption}
              onPress={handleOpenJoinHome}
            >
              <View style={styles.permissionIconContainer}>
                <Ionicons name="enter-outline" size={24} color="#68A68F" />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Rejoindre un foyer</Text>
                <Text style={styles.permissionDescription}>
                  Entrez un code d'invitation pour rejoindre un foyer
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour rejoindre un foyer avec un code */}
      <Modal
        visible={showJoinHomeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowJoinHomeModal(false);
          setJoinCode('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rejoindre un foyer</Text>
              <TouchableOpacity onPress={() => {
                setShowJoinHomeModal(false);
                setJoinCode('');
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Entrez le code d'invitation que vous avez reçu du propriétaire du foyer :
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder="Code d'invitation"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={25}
            />

            <TouchableOpacity 
              style={[styles.copyButton, joiningHome && styles.disabledButton]}
              onPress={handleJoinHome}
              disabled={joiningHome}
            >
              {joiningHome ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.copyButtonText}>Rejoindre</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour choisir les permissions */}
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Type d'accès</Text>
              <TouchableOpacity onPress={() => setShowPermissionModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Choisissez le niveau d'accès pour la personne invitée :
            </Text>

            <TouchableOpacity 
              style={styles.permissionOption}
              onPress={() => handleCreateInviteCode('read')}
            >
              <View style={styles.permissionIconContainer}>
                <Ionicons name="eye-outline" size={24} color="#68A68F" />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Voir</Text>
                <Text style={styles.permissionDescription}>
                  Peut consulter le stock et les recettes
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.permissionDivider} />

            <TouchableOpacity 
              style={styles.permissionOption}
              onPress={() => handleCreateInviteCode('read-write')}
            >
              <View style={styles.permissionIconContainer}>
                <Ionicons name="create-outline" size={24} color="#68A68F" />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Modifier</Text>
                <Text style={styles.permissionDescription}>
                  Peut voir et modifier le stock et les recettes
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour afficher le code d'invitation */}
      <Modal
        visible={showInviteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseInviteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Code d'invitation</Text>
              <TouchableOpacity onPress={handleCloseInviteModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Partagez ce code avec la personne que vous souhaitez inviter. Le code expire dans 7 jours.
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopyInviteCode}>
              <Ionicons name="copy-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.copyButtonText}>Copier le code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
