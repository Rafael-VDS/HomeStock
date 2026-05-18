import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/NavBar';
import { categoriesAPI, productsAPI, Subcategory, Product } from '../../services/api';
import { styles } from '../../styles/subcategories.styles';
import { URL } from '../../config/config';

interface SubcategoryWithProducts extends Subcategory {
    products?: Product[];
    isExpanded?: boolean;
    isLoading?: boolean;
}

export default function SubcategoriesScreen() {
    const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
    const [subcategories, setSubcategories] = useState<SubcategoryWithProducts[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryWithProducts | null>(null);
    const [editName, setEditName] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

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
            
            // Ne garder que les sous-catégories ayant au moins un produit
            const filtered = subcategoriesWithProducts.filter(sub => (sub.products?.length ?? 0) > 0);
            setSubcategories(filtered);
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

    const openEditModal = (subcategory: SubcategoryWithProducts) => {
        setEditingSubcategory(subcategory);
        setEditName(subcategory.name);
    };

    const saveSubcategory = async () => {
        if (!editName.trim()) {
            Alert.alert('Erreur', 'Entrez un nom');
            return;
        }

        if (!editingSubcategory) return;

        try {
            setSaveLoading(true);
            await categoriesAPI.updateSubcategory(editingSubcategory.id, {
                name: editName,
            });
            
            Alert.alert('Succès', 'Sous-catégorie modifiée');
            setEditingSubcategory(null);
            loadSubcategories();
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de modifier la sous-catégorie');
        } finally {
            setSaveLoading(false);
        }
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
                                    <View style={{ position: 'relative' }}>
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
                                        <TouchableOpacity
                                            style={{
                                                position: 'absolute',
                                                right: 50,
                                                top: 0,
                                                bottom: 0,
                                                justifyContent: 'center',
                                                paddingRight: 12,
                                            }}
                                            onPress={() => openEditModal(subcategory)}
                                        >
                                            <Ionicons name="pencil" size={18} color="#4A90E2" />
                                        </TouchableOpacity>
                                    </View>
                                    
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

            <Modal
                visible={editingSubcategory !== null}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setEditingSubcategory(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
                    <ScrollView style={{ flex: 1, padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity
                                onPress={() => setEditingSubcategory(null)}
                                style={{ marginRight: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
                                Modifier la sous-catégorie
                            </Text>
                        </View>

                        {/* Nom */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                                Nom de la sous-catégorie
                            </Text>
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: 12,
                                    fontSize: 16,
                                    color: '#333',
                                }}
                                placeholder="Entrez le nom"
                                value={editName}
                                onChangeText={setEditName}
                            />
                        </View>

                        {/* Bouton save */}
                        <TouchableOpacity
                            onPress={saveSubcategory}
                            disabled={saveLoading}
                            style={{
                                backgroundColor: saveLoading ? '#ccc' : '#68A68F',
                                padding: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 16,
                            }}
                        >
                            {saveLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                                    Enregistrer
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
