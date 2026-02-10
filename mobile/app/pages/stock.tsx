import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import NavBar from '../../components/NavBar';
import { categoriesAPI, Category, URL } from '../../services/api';
import { styles } from '../../styles/stock.styles';

export default function StockScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [homeId, setHomeId] = useState<number | null>(null);

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
            setCategories(fetchedCategories);
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
                                <TouchableOpacity
                                    key={category.id}
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
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
            <NavBar />
        </SafeAreaView>
    );
}
