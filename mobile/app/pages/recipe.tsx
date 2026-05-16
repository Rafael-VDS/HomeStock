import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { recipesAPI, Recipe, URL } from '../../services/api';
import { styles } from '../../styles/recipe.styles';

export default function RecipeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeId, setHomeId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      
      if (!selectedHomeId) {
        Alert.alert('Erreur', 'Aucune maison sélectionnée');
        router.replace('/pages/select-home');
        return;
      }

      const id = parseInt(selectedHomeId);
      setHomeId(id);
      
      const fetchedRecipes = await recipesAPI.getRecipesByHome(id);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      Alert.alert('Erreur', 'Impossible de charger les recettes');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: '/pages/recipe-detail',
      params: {
        recipeId: recipe.id.toString(),
      },
    });
  };

  if (loading) {
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
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Recettes</Text>
          <Text style={styles.subtitle}>Vos recettes favorites</Text>
        </View>

        {recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune recette pour le moment</Text>
            <Text style={styles.emptyText}>Créez votre première recette!</Text>
          </View>
        ) : (
          <View style={styles.recipesContainer}>
            {recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => handleRecipePress(recipe)}
              >
                <Image
                  source={{ 
                    uri: recipe.picture ? `${URL}${recipe.picture}` : 'https://via.placeholder.com/200'
                  }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeServings}>
                    {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
