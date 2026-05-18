import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { categoriesAPI, productsAPI, Category } from '../../services/api';
import { URL } from '../../config/config';
import { styles } from '../../styles/stock.styles';

export default function StockScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [homeId, setHomeId] = useState<number | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editName, setEditName] = useState('');
    const [editImageUri, setEditImageUri] = useState<string | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
            
            if (!selectedHomeId) {
                Alert.alert('Erreur', 'Aucun foyer sélectionné');
                router.replace('/pages/select-home');
                return;
            }

            const id = parseInt(selectedHomeId);
            setHomeId(id);
            
            const fetchedCategories = await categoriesAPI.getCategoriesByHome(id);

            // Ne garder que les catégories ayant au moins une sous-catégorie avec des produits
            const categoriesWithProducts = await Promise.all(
                fetchedCategories.map(async (category) => {
                    try {
                        const subcategories = await categoriesAPI.getSubcategoriesByCategory(category.id);
                        const subcatResults = await Promise.all(
                            subcategories.map(async (sub) => {
                                try {
                                    const products = await productsAPI.getProductsBySubcategory(sub.id);
                                    return products.length > 0;
                                } catch {
                                    return false;
                                }
                            })
                        );
                        return subcatResults.some(Boolean) ? category : null;
                    } catch {
                        return null;
                    }
                })
            );

            setCategories(categoriesWithProducts.filter((c): c is Category => c !== null));
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
            Alert.alert('Erreur', 'Impossible de charger les catégories');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category: Category) => {
        router.push({
            pathname: '/pages/subcategories',
            params: {
                categoryId: category.id.toString(),
                categoryName: category.name,
            },
        });
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditImageUri(null);
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
            setEditImageUri(result.assets[0].uri);
        }
    };

    const saveCategory = async () => {
        if (!editName.trim()) {
            Alert.alert('Erreur', 'Entrez un nom');
            return;
        }

        if (!editingCategory) return;

        try {
            setSaveLoading(true);
            const formData = new FormData();
            formData.append('name', editName);

            if (editImageUri) {
                // Convertir l'URI en blob
                const response = await fetch(editImageUri);
                const blob = await response.blob();
                const filename = editImageUri.split('/').pop() || 'image.jpg';
                formData.append('picture', blob, filename);
            }

            await categoriesAPI.updateCategory(editingCategory.id, formData);
            
            Alert.alert('Succès', 'Catégorie modifiée');
            setEditingCategory(null);
            loadCategories();
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de modifier la catégorie');
        } finally {
            setSaveLoading(false);
        }
    };

    const isSvg = (imagePath: string) => {
        return imagePath.toLowerCase().endsWith('.svg');
    };

    const CategoryImage = ({ imageUrl }: { imageUrl: string }) => {
        const fullUrl = `${URL}${imageUrl}`;
        
        if (isSvg(imageUrl)) {
            return (
                <SvgUri
                    uri={fullUrl}
                    width="100%"
                    height="100%"
                />
            );
        }
        
        return (
            <Image
                source={{ uri: fullUrl }}
                style={styles.categoryImage}
                resizeMode="cover"
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Stock</Text>
                    <Text style={styles.subtitle}>Gérez votre inventaire</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A90E2" />
                    </View>
                ) : categories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune catégorie dans ce foyer</Text>
                    </View>
                ) : (
                    <View style={styles.categoriesContainer}>
                        <Text style={styles.categoriesCount}>
                            {categories.length} {categories.length > 1 ? 'catégories' : 'catégorie'}
                        </Text>
                        <View style={styles.categoriesGrid}>
                            {categories.map((category) => (
                                <View key={category.id} style={{ position: 'relative' }}>
                                    <TouchableOpacity
                                        style={styles.categoryCard}
                                        onPress={() => handleCategoryPress(category)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.categoryImageContainer}>
                                            <CategoryImage imageUrl={category.picture} />
                                            <View style={styles.categoryImageOverlay} />
                                        </View>
                                        <View style={styles.categoryNameContainer}>
                                            <Text style={styles.categoryName} numberOfLines={2}>
                                                {category.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            padding: 8,
                                            borderRadius: 20,
                                        }}
                                        onPress={() => openEditModal(category)}
                                    >
                                        <Ionicons name="pencil" size={18} color="#333" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={editingCategory !== null}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setEditingCategory(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
                    <ScrollView style={{ flex: 1, padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity
                                onPress={() => setEditingCategory(null)}
                                style={{ marginRight: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
                                Modifier la catégorie
                            </Text>
                        </View>

                        {/* Nom */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                                Nom de la catégorie
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

                        {/* Image */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                                Image
                            </Text>
                            <TouchableOpacity
                                onPress={pickImage}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 150,
                                    backgroundColor: '#f5f5f5',
                                }}
                            >
                                {editImageUri ? (
                                    <Image
                                        source={{ uri: editImageUri }}
                                        style={{ width: '100%', height: 150 }}
                                        resizeMode="cover"
                                    />
                                ) : editingCategory?.picture ? (
                                    <Image
                                        source={{ uri: `${URL}${editingCategory.picture}` }}
                                        style={{ width: '100%', height: 150 }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Ionicons name="image-outline" size={40} color="#999" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Bouton save */}
                        <TouchableOpacity
                            onPress={saveCategory}
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
