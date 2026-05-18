import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI, ProductDetail } from '../../services/api';
import { styles } from '../../styles/product-detail.styles';
import { URL } from '../../config/config';

export default function ProductDetailScreen() {
    const { productId } = useLocalSearchParams<{ productId: string }>();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
    const [editName, setEditName] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

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

    const openEditModal = (prod: ProductDetail) => {
        setEditingProduct(prod);
        setEditName(prod.name);
    };

    const saveProduct = async () => {
        if (!editName.trim()) {
            Alert.alert('Erreur', 'Entrez un nom');
            return;
        }

        if (!editingProduct) return;

        try {
            setSaveLoading(true);
            await productsAPI.updateProduct(editingProduct.id, {
                name: editName,
            });
            
            Alert.alert('Succès', 'Produit modifié');
            setEditingProduct(null);
            loadProduct();
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de modifier le produit');
        } finally {
            setSaveLoading(false);
        }
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
                    {product && (
                        <TouchableOpacity onPress={() => openEditModal(product)} style={{ padding: 12 }}>
                            <Ionicons name="pencil" size={24} color="#333" />
                        </TouchableOpacity>
                    )}
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

            <Modal
                visible={editingProduct !== null}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setEditingProduct(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
                    <ScrollView style={{ flex: 1, padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity
                                onPress={() => setEditingProduct(null)}
                                style={{ marginRight: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
                                Modifier le produit
                            </Text>
                        </View>

                        {/* Nom */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                                Nom du produit
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
                            onPress={saveProduct}
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
