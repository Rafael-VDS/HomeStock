import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  categoriesAPI,
  productsAPI,
  cartAPI,
  Category,
  Subcategory,
  Product
} from '../../services/api';
import { styles } from '../../styles/cart.styles';
import { URL } from '../../config/config';

interface SubcategoryWithProducts extends Subcategory {
  products: Product[];
  isExpanded: boolean;
}

interface CategoryWithSubcategories extends Category {
  subcategories: SubcategoryWithProducts[];
  isExpanded: boolean;
}

export default function CartScreen() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [homeId, setHomeId] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<Record<number, boolean>>({});
  const [cartTotal, setCartTotal] = useState<number>(0);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      if (!selectedHomeId) {
        Alert.alert('Erreur', 'Aucun foyer sélectionné');
        return;
      }
      const homeId = parseInt(selectedHomeId);
      setHomeId(homeId);

      const [fetchedCategories, cart] = await Promise.all([
        categoriesAPI.getCategoriesByHome(homeId),
        cartAPI.getCart(homeId),
      ]);
      setCartTotal(cart.totalItems);

      const fetchedCategoriesResolved = fetchedCategories;

      const categoriesWithData: CategoryWithSubcategories[] = await Promise.all(
        fetchedCategoriesResolved.map(async (category) => {
          const subcategories = await categoriesAPI.getSubcategoriesByCategory(category.id);
          const subcategoriesWithProducts: SubcategoryWithProducts[] = await Promise.all(
            subcategories.map(async (sub) => {
              try {
                const products = await productsAPI.getProductsBySubcategory(sub.id);
                return { ...sub, products, isExpanded: false };
              } catch {
                return { ...sub, products: [], isExpanded: false };
              }
            })
          );
          return { ...category, subcategories: subcategoriesWithProducts, isExpanded: false };
        })
      );

      // Garder uniquement les catégories ayant au moins un produit
      const filtered = categoriesWithData.filter((cat) =>
        cat.subcategories.some((sub) => sub.products.length > 0)
      );

      setCategories(filtered);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    );
  };

  const toggleSubcategory = (categoryId: number, subcategoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === subcategoryId ? { ...sub, isExpanded: !sub.isExpanded } : sub
              ),
            }
          : cat
      )
    );
  };

  const incrementQty = (productId: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const decrementQty = (productId: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      const updated = { ...prev, [productId]: current - 1 };
      if (updated[productId] === 0) delete updated[productId];
      return updated;
    });
  };

  const addToCart = async (productId: number) => {
    const qty = quantities[productId] || 0;
    if (qty <= 0) {
      Alert.alert('Quantité', 'Veuillez sélectionner une quantité avant d\'ajouter au panier');
      return;
    }
    if (!homeId) return;

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      const updatedCart = await cartAPI.addProduct(homeId, productId, qty);
      setCartTotal(updatedCart.totalItems);
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Achats</Text>
            <Text style={styles.subtitle}>Sélectionnez les produits à acheter</Text>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/pages/panier')}>
            <Ionicons name="cart" size={30} color="#68A68F" />
            {cartTotal > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartTotal}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#68A68F" />
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun produit enregistré dans ce foyer</Text>
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryWrapper}>

                {/* Catégorie */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Ionicons
                    name={category.isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>

                {/* Sous-catégories */}
                {category.isExpanded && (
                  <View style={styles.subcategoriesContainer}>
                    {category.subcategories
                      .filter((sub) => sub.products.length > 0)
                      .map((subcategory) => (
                        <View key={subcategory.id} style={styles.subcategoryWrapper}>

                          {/* Sous-catégorie */}
                          <TouchableOpacity
                            style={styles.subcategoryCard}
                            onPress={() => toggleSubcategory(category.id, subcategory.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                            <Ionicons
                              name={subcategory.isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={16}
                              color="#bbb"
                            />
                          </TouchableOpacity>

                          {/* Produits */}
                          {subcategory.isExpanded && (
                            <View style={styles.productsContainer}>
                              {subcategory.products.map((product) => (
                                <View key={product.id} style={styles.productRow}>
                                  <Image
                                    source={{ uri: `${URL}${product.picture}` }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                      {product.name}
                                    </Text>
                                    <Text style={styles.productStock}>
                                      En stock : {product.stockCount}
                                    </Text>
                                  </View>
                                  <View style={styles.qtySelector}>
                                    <TouchableOpacity
                                      style={styles.cartAddButton}
                                      onPress={() => addToCart(product.id)}
                                      disabled={addingToCart[product.id]}
                                    >
                                      {addingToCart[product.id] ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                      ) : (
                                        <Ionicons name="cart" size={18} color="#fff" />
                                      )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.qtyButton}
                                      onPress={() => decrementQty(product.id)}
                                    >
                                      <Ionicons name="remove" size={18} color="#fff" />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyValue}>
                                      {quantities[product.id] || 0}
                                    </Text>
                                    <TouchableOpacity
                                      style={styles.qtyButton}
                                      onPress={() => incrementQty(product.id)}
                                    >
                                      <Ionicons name="add" size={18} color="#fff" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
