import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { styles } from '../../styles/recipe.styles';

export default function RecipeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Recettes</Text>
          <Text style={styles.subtitle}>Découvrez vos recettes</Text>
        </View>
      </ScrollView>

      <NavBar />
    </SafeAreaView>
  );
}
