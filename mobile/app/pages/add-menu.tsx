import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../../styles/add-menu.styles';

type AddOption = {
  id: string;
  title: string;
  description: string;
  route: string;
};

const addOptions: AddOption[] = [
  {
    id: 'category',
    title: 'Ajouter une catégorie',
    description: 'Créer une nouvelle catégorie de produits',
    route: '/pages/add-category',
  },
  {
    id: 'subcategory',
    title: 'Ajouter une sous-catégorie',
    description: 'Créer une sous-catégorie dans une catégorie existante',
    route: '/pages/add-subcategory',
  },
  {
    id: 'product',
    title: 'Ajouter un produit',
    description: 'Créer un nouveau produit',
    route: '/pages/add-product',
  },
  {
    id: 'batch',
    title: 'Ajouter un lot',
    description: 'Créer un nouveau lot pour un produit existant',
    route: '/pages/add-batch',
  },
];

export default function AddMenuPage() {
  const router = useRouter();

  const handleOptionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Que voulez-vous ajouter ?</Text>
        <Text style={styles.subtitle}>Sélectionnez une option ci-dessous</Text>

        <View style={styles.optionsContainer}>
          {addOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option.route)}
            >
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
