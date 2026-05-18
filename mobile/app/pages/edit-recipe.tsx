import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { recipesAPI, productsAPI, categoriesAPI, Product, Recipe, RecipeIngredient, RecipeStep } from '../../services/api';
import { styles } from '../../styles/add-form.styles';
import { URL } from '../../config/config';

interface SelectedIngredient extends RecipeIngredient {
  productName: string;
}

export default function EditRecipePage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { recipeId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [currentPicture, setCurrentPicture] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [homeId, setHomeId] = useState<number | null>(null);

  // Form states
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [multipliable, setMultipliable] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [recipeId])
  );

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      if (!recipeId) {
        Alert.alert('Erreur', 'Recette non trouvée');
        router.back();
        return;
      }

      // Charger la recette
      const fetchedRecipe = await recipesAPI.getRecipeById(parseInt(recipeId as string));
      setRecipe(fetchedRecipe);
      setName(fetchedRecipe.name);
      setDescription(fetchedRecipe.description);
      setCurrentPicture(fetchedRecipe.picture);
      setNewImageUri(null);
      setShowIngredientPicker(false);
      setSelectedProductId(null);
      setQuantity('');
      setMultipliable(false);
      setCurrentStep('');
      setSelectedIngredients(
        fetchedRecipe.ingredients.map(ing => ({
          ...ing,
          productName: ing.productName,
        }))
      );
      setSteps(fetchedRecipe.steps);

      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      if (!selectedHomeId) {
        Alert.alert('Erreur', 'Aucune maison sélectionnée');
        return;
      }

      const id = parseInt(selectedHomeId);
      setHomeId(id);

      // Charger tous les produits
      const categories = await categoriesAPI.getCategoriesByHome(id);

      const allProducts: Product[] = [];
      for (const category of categories) {
        const subcategories = await categoriesAPI.getSubcategoriesByCategory(category.id);

        for (const subcategory of subcategories) {
          const categoryProducts = await productsAPI.getProductsBySubcategory(subcategory.id);
          allProducts.push(...categoryProducts);
        }
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoadingData(false);
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
      setNewImageUri(result.assets[0].uri);
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
      id: 0,
      recipeId: parseInt(recipeId as string),
      productId: selectedProductId,
      productName: product.name,
      quantityNeeded: quantity ? parseInt(quantity) : null,
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
      id: 0,
      recipeId: parseInt(recipeId as string),
      stepNumber: Math.max(...steps.map(s => s.stepNumber), 0) + 1,
      content: currentStep,
    };

    setSteps([...steps, step]);
    setCurrentStep('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const removeStep = (id: number) => {
    const updatedSteps = steps.filter(s => s.id !== id);
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
      formData.append('name', name);
      formData.append('description', description);

      if (newImageUri) {
        const filename = newImageUri.split('/').pop() || 'image.jpg';
        formData.append('image', {
          uri: newImageUri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }

      // Mettre à jour la recette
      await recipesAPI.updateRecipe(parseInt(recipeId as string), formData);

      // Supprimer les anciens ingrédients
      for (const ingredient of recipe?.ingredients || []) {
        await recipesAPI.removeIngredient(parseInt(recipeId as string), ingredient.productId);
      }

      // Ajouter TOUS les ingrédients (anciens et nouveaux)
      for (const ingredient of selectedIngredients) {
        await recipesAPI.addIngredient(parseInt(recipeId as string), {
          productId: ingredient.productId,
          quantityNeeded: ingredient.quantityNeeded ?? undefined,
          multipliable: ingredient.multipliable,
        });
      }

      // Supprimer les anciennes étapes
      for (const step of recipe?.steps || []) {
        await recipesAPI.removeStep(parseInt(recipeId as string), step.stepNumber);
      }

      // Ajouter TOUTES les étapes (anciennes et nouvelles) avec numérotation corrigée
      const renumberedSteps = steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));
      
      for (const step of renumberedSteps) {
        await recipesAPI.addStep(parseInt(recipeId as string), {
          stepNumber: step.stepNumber,
          content: step.content,
        });
      }

      Alert.alert('Succès', 'Recette modifiée');
      router.back();
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de modifier la recette');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier une recette</Text>
        </View>

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
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder="Décrivez votre recette..."
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
            {newImageUri ? (
              <Image source={{ uri: newImageUri }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
            ) : currentPicture ? (
              <Image source={{ uri: `${URL}${currentPicture}` }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
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
                  <Text style={{ fontSize: 12, color: '#68A68F', fontWeight: '500' }}>✓ Adaptable</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ))}

          {!showIngredientPicker ? (
            <TouchableOpacity
              onPress={() => setShowIngredientPicker(true)}
              style={{ backgroundColor: '#68A68F', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
              disabled={loading}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>+ Ajouter un ingrédient</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8 }}>
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

              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                placeholder="Quantité (optionnel)"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                onPress={() => setMultipliable(!multipliable)}
                style={{
                  marginBottom: 12,
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
              
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={addIngredient}
                  style={{ flex: 1, backgroundColor: '#68A68F', padding: 10, borderRadius: 6, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowIngredientPicker(false);
                    setSelectedProductId(null);
                    setQuantity('');
                    setMultipliable(false);
                  }}
                  style={{ flex: 1, backgroundColor: '#e0e0e0', padding: 10, borderRadius: 6, alignItems: 'center' }}
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
              key={step.id}
              style={{
                backgroundColor: '#f5f5f5',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 4 }}>Étape {step.stepNumber}</Text>
                  <Text style={{ color: '#333' }}>{step.content}</Text>
                </View>
                <TouchableOpacity onPress={() => removeStep(step.id)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top', marginTop: 8 }]}
            placeholder="Décrivez l'étape..."
            value={currentStep}
            onChangeText={setCurrentStep}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            onPress={addStep}
            style={{ backgroundColor: '#68A68F', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Ajouter une étape</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: loading ? '#ccc' : '#68A68F',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 32
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Modifier la recette</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
