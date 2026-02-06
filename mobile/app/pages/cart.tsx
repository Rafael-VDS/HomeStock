import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { styles } from '../../styles/cart.styles';

export default function CartScreen() {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Achats</Text>
          <Text style={styles.subtitle}>Gérez vos listes de courses</Text>
        </View>
      </ScrollView>

      <NavBar />
    </SafeAreaView>
  );
}
