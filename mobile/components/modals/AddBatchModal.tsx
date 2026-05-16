import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoriesAPI, productsAPI, Category, Subcategory, Product } from '../../services/api';
import { styles } from '../../styles/add-form.styles';
import { Ionicons } from '@expo/vector-icons';
import CustomPicker from '../CustomPicker';

interface AddBatchModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddBatchModal({ visible, onClose, onSuccess }: AddBatchModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

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
      setProducts([]);
      setSelectedProductId(null);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedSubcategoryId) {
      loadProducts(selectedSubcategoryId);
    } else {
      setProducts([]);
      setSelectedProductId(null);
    }
  }, [selectedSubcategoryId]);

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

  const loadProducts = async (subcategoryId: number) => {
    try {
      setLoadingProducts(true);
      const data = await productsAPI.getProductsBySubcategory(subcategoryId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
    setSelectedProductId(null);
  };

  const handleSubcategorySelect = (subcategoryId: number) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedProductId(null);
  };

  const handleDateConfirm = () => {
    const day = parseInt(tempDay);
    const month = parseInt(tempMonth);
    const year = parseInt(tempYear);

    if (!tempDay || !tempMonth || !tempYear) {
      Alert.alert('Erreur', 'Veuillez entrer une date complète');
      return;
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100) {
      Alert.alert('Erreur', 'Date invalide');
      return;
    }

    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      Alert.alert('Erreur', 'Date invalide');
      return;
    }

    setExpirationDate(date);
    setShowDateModal(false);
  };

  const handleDateClear = () => {
    setExpirationDate(null);
    setTempDay('');
    setTempMonth('');
    setTempYear('');
    setShowDateModal(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Aucune date sélectionnée';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!selectedProductId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un produit');
      return;
    }

    try {
      setLoading(true);
      const homeId = await AsyncStorage.getItem('selectedHomeId');
      
      if (!homeId) {
        Alert.alert('Erreur', 'Aucune maison sélectionnée');
        return;
      }

      await productsAPI.createBatch({
        productId: selectedProductId,
        homeId: parseInt(homeId),
        expirationDate: expirationDate ? expirationDate.toISOString() : undefined,
      });
      
      Alert.alert('Succès', 'Lot créé avec succès');
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      setSelectedProductId(null);
      setExpirationDate(null);
      setTempDay('');
      setTempMonth('');
      setTempYear('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating batch:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer le lot');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedProductId(null);
    setExpirationDate(null);
    setTempDay('');
    setTempMonth('');
    setTempYear('');
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
            <Text style={styles.modalTitle}>Ajouter un lot</Text>
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
                        onValueChange={handleSubcategorySelect}
                        placeholder="Sélectionner une sous-catégorie"
                        label="Sous-catégorie *"
                      />
                    )}
                  </View>
                )}

                {selectedSubcategoryId && (
                  <View style={styles.formGroup}>
                    {loadingProducts ? (
                      <ActivityIndicator color="#007AFF" />
                    ) : (
                      <CustomPicker
                        items={products}
                        selectedValue={selectedProductId}
                        onValueChange={setSelectedProductId}
                        placeholder="Sélectionner un produit"
                        label="Produit *"
                      />
                    )}
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date d'expiration (optionnelle)</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDateModal(true)}
                  >
                    <Text style={styles.datePickerButtonText}>{formatDate(expirationDate)}</Text>
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
                <Text style={styles.submitButtonText}>Créer le lot</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner une date</Text>
            
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Jour</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempDay}
                  onChangeText={setTempDay}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="JJ"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Mois</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempMonth}
                  onChangeText={setTempMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Année</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempYear}
                  onChangeText={setTempYear}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="AAAA"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleDateClear}
              >
                <Text style={styles.modalButtonTextSecondary}>Effacer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleDateConfirm}
              >
                <Text style={styles.modalButtonTextPrimary}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
