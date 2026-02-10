import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoriesAPI, productsAPI, Category, Subcategory } from '../../services/api';
import { styles } from '../../styles/add-form.styles';
import { Ionicons } from '@expo/vector-icons';
import CustomPicker from '../CustomPicker';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddProductModal({ visible, onClose, onSuccess }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubcategories(selectedCategoryId);
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId(null);
    }
  }, [selectedCategoryId]);

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

  const loadSubcategories = async (categoryId: number) => {
    try {
      setLoadingSubcategories(true);
      const data = await categoriesAPI.getSubcategoriesByCategory(categoryId);
      setSubcategories(data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      Alert.alert('Erreur', 'Impossible de charger les sous-catégories');
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder aux photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le produit');
      return;
    }

    if (!selectedCategoryId || !selectedSubcategoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie et une sous-catégorie');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('subcategoryId', selectedSubcategoryId.toString());

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      } else {
        formData.append('picture', '');
      }

      await productsAPI.createProduct(formData);
      
      Alert.alert('Succès', 'Produit créé avec succès');
      setName('');
      setImageUri(null);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating product:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer le produit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setImageUri(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
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
            <Text style={styles.modalTitle}>Ajouter un produit</Text>
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
                    onValueChange={handleCategorySelect}
                    placeholder="Sélectionner une catégorie"
                    label="Catégorie *"
                  />
                </View>

                {selectedCategoryId && (
                  <View style={styles.formGroup}>
                    {loadingSubcategories ? (
                      <ActivityIndicator color="#007AFF" />
                    ) : (
                      <CustomPicker
                        items={subcategories}
                        selectedValue={selectedSubcategoryId}
                        onValueChange={setSelectedSubcategoryId}
                        placeholder="Sélectionner une sous-catégorie"
                        label="Sous-catégorie *"
                      />
                    )}
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom du produit *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Tomates"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Image (optionnelle)</Text>
                  <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                      <View style={styles.imagePickerPlaceholder}>
                        <Text style={styles.imagePickerText}>Appuyez pour choisir une image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
                <Text style={styles.submitButtonText}>Créer le produit</Text>
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
