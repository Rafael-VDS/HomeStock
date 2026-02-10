import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/NavBar';
import { categoriesAPI, productsAPI, Subcategory, Product, URL } from '../../services/api';
import { styles } from '../../styles/subcategories.styles';

interface SubcategoryWithProducts extends Subcategory {
    products?: Product[];
    isExpanded?: boolean;
    isLoading?: boolean;
}

export default function SubcategoriesScreen() {
    const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
    const [subcategories, setSubcategories] = useState<SubcategoryWithProducts[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (categoryId) {
            loadSubcategories();
        }
    }, [categoryId]);

    const loadSubcategories = async () => {
        try {
            setLoading(true);
            const id = parseInt(categoryId as string);
            const fetchedSubcategories = await categoriesAPI.getSubcategoriesByCategory(id);
            
            // Précharger les produits de toutes les sous-catégories
            const subcategoriesWithProducts = await Promise.all(
                fetchedSubcategories.map(async (sub) => {
                    try {
                        const products = await productsAPI.getProductsBySubcategory(sub.id);
                        return { ...sub, isExpanded: false, products };
                    } catch (error) {
                        console.error(`Erreur chargement produits sous-catégorie ${sub.id}:`, error);
                        return { ...sub, isExpanded: false, products: [] };
                    }
                })
            );
            
            setSubcategories(subcategoriesWithProducts);
        } catch (error) {
            console.error('Erreur lors du chargement des sous-catégories:', error);
            Alert.alert('Erreur', 'Impossible de charger les sous-catégories');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubcategory = (subcategoryId: number) => {
        const subcategoryIndex = subcategories.findIndex(sub => sub.id === subcategoryId);
        if (subcategoryIndex === -1) return;

        const subcategory = subcategories[subcategoryIndex];
        const updatedSubcategories = [...subcategories];
        
        // Basculer l'état expanded
        updatedSubcategories[subcategoryIndex] = {
            ...subcategory,
            isExpanded: !subcategory.isExpanded,
        };
        
        setSubcategories(updatedSubcategories);
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{categoryName || 'Sous-catégories'}</Text>
                        <Text style={styles.subtitle}>Sélectionnez une sous-catégorie</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A90E2" />
                    </View>
                ) : subcategories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune sous-catégorie dans cette catégorie</Text>
                    </View>
                ) : (
                    <View style={styles.subcategoriesContainer}>
                        <Text style={styles.subcategoriesCount}>
                            {subcategories.length} {subcategories.length > 1 ? 'sous-catégories' : 'sous-catégorie'}
                        </Text>
                        <View style={styles.subcategoriesList}>
                            {subcategories.map((subcategory) => (
                                <View key={subcategory.id} style={styles.subcategoryWrapper}>
                                    <TouchableOpacity
                                        style={styles.subcategoryCard}
                                        onPress={() => toggleSubcategory(subcategory.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.subcategoryContent}>
                                            <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                                            {subcategory.isLoading ? (
                                                <ActivityIndicator size="small" color="#4A90E2" />
                                            ) : (
                                                <Ionicons 
                                                    name={subcategory.isExpanded ? "chevron-up" : "chevron-down"} 
                                                    size={20} 
                                                    color="#999" 
                                                />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    
                                    {subcategory.isExpanded && subcategory.products && (
                                        <View style={styles.productsContainer}>
                                            {subcategory.products.length === 0 ? (
                                                <Text style={styles.emptyProductsText}>Aucun produit</Text>
                                            ) : (
                                                subcategory.products.map((product) => (
                                                    <TouchableOpacity
                                                        key={product.id}
                                                        style={styles.productCard}
                                                        onPress={() => router.push({
                                                            pathname: '/pages/product-detail',
                                                            params: { productId: product.id.toString() },
                                                        })}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Image
                                                            source={{ uri: `${URL}${product.picture}` }}
                                                            style={styles.productImage}
                                                            resizeMode="cover"
                                                        />
                                                        <View style={styles.productInfo}>
                                                            <Text style={styles.productName}>{product.name}</Text>
                                                            <View style={styles.productDetails}>
                                                                <Text style={styles.productStock}>
                                                                    Stock: {product.stockCount}
                                                                </Text>
                                                                {product.needsToBuy && (
                                                                    <View style={styles.toBuyBadge}>
                                                                        <Text style={styles.toBuyText}>À acheter</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
            <NavBar />
        </SafeAreaView>
    );
}
