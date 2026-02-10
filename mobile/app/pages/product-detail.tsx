import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/NavBar';
import { productsAPI, ProductDetail, URL } from '../../services/api';
import { styles } from '../../styles/product-detail.styles';

export default function ProductDetailScreen() {
    const { productId } = useLocalSearchParams<{ productId: string }>();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const id = parseInt(productId as string);
            const fetchedProduct = await productsAPI.getProductById(id);
            setProduct(fetchedProduct);
        } catch (error) {
            console.error('Erreur lors du chargement du produit:', error);
            Alert.alert('Erreur', 'Impossible de charger le produit');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Non spécifiée';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const getBatchColor = (batch: any) => {
        if (!batch.expirationDate) return '#0ABED2'; // Bleu - pas de date
        
        const days = batch.daysUntilExpiration ?? 0;
        
        if (days < 0) return '#F44336'; // Rouge - périmé
        if (days <= 2) return '#FF9800'; // Orange - 0 à 2 jours
        if (days <= 7) return '#CDDC39'; // Jaune-vert - 3 à 7 jours
        return '#00BD0D'; // Vert - > 7 jours
    };

    const getBatchStatusText = (batch: any) => {
        if (!batch.expirationDate) return 'J + 0';
        if (batch.isExpired) return `J - ${Math.abs(batch.daysUntilExpiration || 0)}`;
        return `J + ${batch.daysUntilExpiration || 0}`;
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails du produit</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A90E2" />
                    </View>
                ) : !product ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Produit introuvable</Text>
                    </View>
                ) : (
                    <View style={styles.productContainer}>
                        {/* Image et informations principales */}
                        <View style={styles.productHeader}>
                            <Image
                                source={{ uri: `${URL}${product.picture}` }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            <View style={styles.productMainInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.categoryInfo}>
                                    {product.subcategory.categoryName} › {product.subcategory.name}
                                </Text>
                                {product.mass && (
                                    <Text style={styles.productAttribute}>
                                        <Ionicons name="scale-outline" size={14} color="#666" /> {product.mass}g
                                    </Text>
                                )}
                                {product.liquid && (
                                    <Text style={styles.productAttribute}>
                                        <Ionicons name="water-outline" size={14} color="#666" /> {product.liquid}ml
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Stock */}
                        <View style={styles.stockSection}>
                            <View style={styles.stockHeader}>
                                <Ionicons name="cube-outline" size={20} color="#4A90E2" />
                                <Text style={styles.stockTitle}>Stock disponible</Text>
                            </View>
                            <Text style={styles.stockCount}>
                                {product.stockCount} {product.stockCount > 1 ? 'unités' : 'unité'}
                            </Text>
                            {product.needsToBuy && (
                                <View style={styles.toBuyAlert}>
                                    <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
                                    <Text style={styles.toBuyText}>Stock faible - À racheter</Text>
                                </View>
                            )}
                        </View>

                        {/* Liste des batches */}
                        <View style={styles.batchesSection}>
                            <View style={styles.batchesHeader}>
                                <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
                                <Text style={styles.batchesTitle}>Lots en stock</Text>
                            </View>

                            {product.productBatches && product.productBatches.length > 0 ? (
                                <View style={styles.batchesList}>
                                    {product.productBatches.map((batch, index) => (
                                        <View 
                                            key={batch.id} 
                                            style={[
                                                styles.batchCard,
                                                { borderLeftColor: getBatchColor(batch) }
                                            ]}
                                        >
                                            <View style={styles.batchHeader}>
                                                <Text style={styles.batchNumber}>Lot #{index + 1}</Text>
                                                <View 
                                                    style={[
                                                        styles.batchStatusBadge,
                                                        { backgroundColor: getBatchColor(batch) }
                                                    ]}
                                                >
                                                    <Text style={styles.batchStatusText}>
                                                        {getBatchStatusText(batch)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.batchDetails}>
                                                <Ionicons name="calendar" size={16} color="#666" />
                                                <Text style={styles.batchDate}>
                                                    Expire le : {formatDate(batch.expirationDate)}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noBatchesText}>Aucun lot en stock</Text>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
            <NavBar />
        </SafeAreaView>
    );
}
