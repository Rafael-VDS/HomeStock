import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipesAPI, Recipe, URL } from '../../services/api';
import { styles } from '../../styles/recipe.styles';

export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      if (!recipeId) {
        Alert.alert('Erreur', 'Recette non trouvée');
        router.back();
        return;
      }

      const fetchedRecipe = await recipesAPI.getRecipeById(parseInt(recipeId as string));
      setRecipe(fetchedRecipe);
    } catch (error) {
      console.error('Erreur lors du chargement de la recette:', error);
      Alert.alert('Erreur', 'Impossible de charger la recette');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !recipe) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#68A68F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={[]}>
      <ScrollView>
        {/* Image de la recette */}
        <View style={styles.detailHeader}>
          <Image
            source={{ 
              uri: recipe.picture ? `${URL}${recipe.picture}` : 'https://via.placeholder.com/400'
            }}
            style={styles.detailImage}
            resizeMode="cover"
          />
          {/* Boutons de navigation */}
          <View style={{ position: 'absolute', top: 50, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/pages/edit-recipe?recipeId=${recipe.id}`)} style={{ width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="pencil" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.detailTitle, { position: 'absolute', bottom: 12, left: 12, right: 12 }]}>{recipe.name}</Text>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {/* Sélecteur de portions */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginRight: 12 }}>Portions:</Text>
          <TouchableOpacity 
            onPress={() => setServings(Math.max(1, servings - 1))}
            style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6 }}
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 16, fontSize: 16, fontWeight: 'bold' }}>{servings}</Text>
          <TouchableOpacity 
            onPress={() => setServings(servings + 1)}
            style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6 }}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Ingrédients */}
        {recipe.ingredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ingrédients ({recipe.ingredients.length})</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>
                    • {ingredient.productName}
                  </Text>
                  {ingredient.quantityNeeded && (
                    <Text style={styles.ingredientQuantity}>
                      Quantité: {ingredient.multipliable ? ingredient.quantityNeeded * servings : ingredient.quantityNeeded}
                    </Text>
                  )}
                  {ingredient.multipliable && (
                    <Text style={styles.multipliableTag}>✓ Adaptable aux portions</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Étapes */}
        {recipe.steps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Étapes ({recipe.steps.length})</Text>
            <View style={styles.stepsList}>
              {recipe.steps.map((step) => (
                <View key={step.id} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>Étape {step.stepNumber}</Text>
                  <Text style={styles.stepContent}>{step.content}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
            {recipe.tags.map((tag) => (
              <View 
                key={tag.id}
                style={{ 
                  backgroundColor: '#68A68F', 
                  paddingVertical: 6, 
                  paddingHorizontal: 12, 
                  borderRadius: 20, 
                  marginRight: 8,
                  marginBottom: 8
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Boutons d'action */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24, flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              paddingVertical: 12, 
              backgroundColor: '#68A68F', 
              borderRadius: 8,
              alignItems: 'center'
            }}
            onPress={() => router.push({
              pathname: '/pages/edit-recipe',
              params: { recipeId: recipe.id.toString() }
            })}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Modifier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ 
              paddingVertical: 12, 
              paddingHorizontal: 16,
              backgroundColor: '#ff6b6b', 
              borderRadius: 8,
              alignItems: 'center'
            }}
            onPress={() => {
              Alert.alert('Supprimer', 'Êtes-vous sûr de vouloir supprimer cette recette?', [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Supprimer', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await recipesAPI.deleteRecipe(recipe.id);
                      Alert.alert('Succès', 'Recette supprimée');
                      router.back();
                    } catch (error) {
                      Alert.alert('Erreur', 'Impossible de supprimer la recette');
                    }
                  }
                }
              ]);
            }}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
