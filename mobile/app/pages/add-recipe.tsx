import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { recipesAPI, productsAPI, categoriesAPI, Product } from '../../services/api';
import { styles } from '../../styles/add-form.styles';

interface SelectedIngredient {
  productId: number;
  productName: string;
  quantityNeeded?: number;
  multipliable: boolean;
}

interface RecipeStep {
  stepNumber: number;
  content: string;
}

export default function AddRecipePage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [homeId, setHomeId] = useState<number | null>(null);

  // Form states
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [multipliable, setMultipliable] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      if (!selectedHomeId) {
        Alert.alert('Erreur', 'Aucune maison sélectionnée');
        return;
      }

      const id = parseInt(selectedHomeId);
      setHomeId(id);
      
      // Charger toutes les catégories
      const categories = await categoriesAPI.getCategoriesByHome(id);
      
      const allProducts: Product[] = [];
      for (const category of categories) {
        // Charger les sous-catégories
        const subcategories = await categoriesAPI.getSubcategoriesByCategory(category.id);
        
        // Charger les produits de chaque sous-catégorie
        for (const subcategory of subcategories) {
          const products = await productsAPI.getProductsBySubcategory(subcategory.id);
          allProducts.push(...products);
        }
      }
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoadingProducts(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    if (!selectedProductId) {
      Alert.alert('Erreur', 'Sélectionnez un produit');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const ingredient: SelectedIngredient = {
      productId: selectedProductId,
      productName: product.name,
      quantityNeeded: quantity ? parseInt(quantity) : undefined,
      multipliable,
    };

    setSelectedIngredients([...selectedIngredients, ingredient]);
    setSelectedProductId(null);
    setQuantity('');
    setMultipliable(false);
    setShowIngredientPicker(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
  };

  const addStep = () => {
    if (!currentStep.trim()) {
      Alert.alert('Erreur', 'Entrez une description pour l\'étape');
      return;
    }

    const step: RecipeStep = {
      stepNumber: steps.length + 1,
      content: currentStep,
    };

    setSteps([...steps, step]);
    setCurrentStep('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const removeStep = (stepNumber: number) => {
    const updatedSteps = steps.filter(s => s.stepNumber !== stepNumber);
    // Renuméroter les étapes restantes
    const renumberedSteps = updatedSteps.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
    setSteps(renumberedSteps);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Entrez un nom');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Entrez une description');
      return;
    }

    if (selectedIngredients.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins un ingrédient');
      return;
    }

    if (steps.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins une étape');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('homeId', homeId!.toString());
      formData.append('name', name);
      formData.append('description', description);

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }

      // Créer la recette
      const recipe = await recipesAPI.createRecipe(formData);

      // Ajouter les ingrédients
      for (const ingredient of selectedIngredients) {
        await recipesAPI.addIngredient(recipe.id, {
          productId: ingredient.productId,
          quantityNeeded: ingredient.quantityNeeded,
          multipliable: ingredient.multipliable,
        });
      }

      // Ajouter les étapes avec numérotation corrigée
      const renumberedSteps = steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));
      
      for (const step of renumberedSteps) {
        await recipesAPI.addStep(recipe.id, {
          stepNumber: step.stepNumber,
          content: step.content,
        });
      }

      Alert.alert('Succès', 'Recette créée');
      router.replace('/pages/recipe');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de créer la recette');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#68A68F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView ref={scrollViewRef} style={styles.content}>
        <Text style={styles.title}>Créer une recette</Text>

        {/* Nom */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom de la recette</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Pâtes à la Carbonara"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Comment faire)</Text>
          <TextInput
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder="Décrivez comment préparer votre recette..."
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!loading}
          />
        </View>

        {/* Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image de la recette</Text>
          <TouchableOpacity 
            onPress={pickImage}
            style={[styles.input, { 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 150,
              backgroundColor: '#f5f5f5'
            }]}
            disabled={loading}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
            ) : (
              <Ionicons name="image-outline" size={40} color="#999" />
            )}
          </TouchableOpacity>
        </View>

        {/* Ingrédients */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ingrédients</Text>
          
          {selectedIngredients.map((ingredient, index) => (
            <View 
              key={index}
              style={{
                backgroundColor: '#f5f5f5',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{ingredient.productName}</Text>
                {ingredient.quantityNeeded && (
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    Qty: {ingredient.quantityNeeded}
                  </Text>
                )}
                {ingredient.multipliable && (
                  <Text style={{ fontSize: 11, color: '#68A68F', fontStyle: 'italic' }}>
                    ✓ Adaptable
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <Ionicons name="close" size={24} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          ))}

          {!showIngredientPicker ? (
            <TouchableOpacity
              onPress={() => setShowIngredientPicker(true)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: '#68A68F',
                borderRadius: 8,
                alignItems: 'center'
              }}
              disabled={loading}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>+ Ajouter un ingrédient</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Sélectionner un produit</Text>
              <ScrollView 
                style={{ maxHeight: 150, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6 }}
                nestedScrollEnabled
              >
                {products.map(product => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => setSelectedProductId(product.id)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: selectedProductId === product.id ? '#e8f5e9' : '#fff',
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee'
                    }}
                  >
                    <Text style={{ color: selectedProductId === product.id ? '#2e7d32' : '#333' }}>
                      {selectedProductId === product.id ? '✓ ' : ''}{product.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Quantité */}
              <TextInput
                style={styles.input}
                placeholder="Quantité (optionnel)"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />

              {/* Multipliable */}
              <TouchableOpacity
                onPress={() => setMultipliable(!multipliable)}
                style={{
                  marginTop: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: multipliable ? '#e8f5e9' : '#fff',
                  borderWidth: 1,
                  borderColor: multipliable ? '#68A68F' : '#ddd',
                  borderRadius: 6
                }}
              >
                <Ionicons 
                  name={multipliable ? "checkbox" : "checkbox-outline"} 
                  size={20} 
                  color={multipliable ? '#68A68F' : '#999'}
                />
                <Text style={{ marginLeft: 8 }}>Adaptable aux portions</Text>
              </TouchableOpacity>

              {/* Boutons */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={addIngredient}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    backgroundColor: '#68A68F',
                    borderRadius: 6,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowIngredientPicker(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    backgroundColor: '#ccc',
                    borderRadius: 6,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#333', fontWeight: '600' }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Étapes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Étapes</Text>
          
          {steps.map((step) => (
            <View
              key={step.stepNumber}
              style={{
                backgroundColor: '#f5f5f5',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#68A68F'
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 4 }}>Étape {step.stepNumber}</Text>
                  <Text style={{ color: '#556B6B', lineHeight: 18 }}>{step.content}</Text>
                </View>
                <TouchableOpacity onPress={() => removeStep(step.stepNumber)}>
                  <Ionicons name="close" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Décrivez l'étape..."
            value={currentStep}
            onChangeText={setCurrentStep}
            multiline
            editable={!loading}
          />
          
          <TouchableOpacity
            onPress={addStep}
            style={{
              marginTop: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: '#68A68F',
              borderRadius: 8,
              alignItems: 'center'
            }}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Ajouter une étape</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton valider */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: '#68A68F',
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 24,
            opacity: loading ? 0.6 : 1
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Créer la recette</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
