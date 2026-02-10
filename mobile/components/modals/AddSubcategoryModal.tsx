import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoriesAPI, Category } from '../../services/api';
import { styles } from '../../styles/add-form.styles';
import { Ionicons } from '@expo/vector-icons';
import CustomPicker from '../CustomPicker';

interface AddSubcategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddSubcategoryModal({ visible, onClose, onSuccess }: AddSubcategoryModalProps) {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const homeId = await AsyncStorage.getItem('selectedHomeId');
      if (!homeId) {
        Alert.alert('Erreur', 'Aucune maison sélectionnée');
        return;
      }

      const data = await categoriesAPI.getCategoriesByHome(parseInt(homeId));
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la sous-catégorie');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    try {
      setLoading(true);
      
      await categoriesAPI.createSubcategory({
        name,
        categoryId: selectedCategoryId,
      });
      
      Alert.alert('Succès', 'Sous-catégorie créée avec succès');
      setName('');
      setSelectedCategoryId(null);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer la sous-catégorie');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedCategoryId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter une sous-catégorie</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {loadingCategories ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <CustomPicker
                    items={categories}
                    selectedValue={selectedCategoryId}
                    onValueChange={setSelectedCategoryId}
                    placeholder="Sélectionner une catégorie"
                    label="Catégorie parente *"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom de la sous-catégorie *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Légumes verts"
                    placeholderTextColor="#999"
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Créer la sous-catégorie</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
