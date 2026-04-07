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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { cartAPI, productsAPI, Cart, URL } from '../../services/api';
import { styles } from '../../styles/panier.styles';

// Une ligne virtuelle = 1 unité physique d'un cartProduct
interface CartLine {
  lineId: string;        // `${cartProductId}-${index}`
  cartProductId: number;
  productId: number;
  productName: string;
  productPicture: string;
  subcategoryName: string;
  checked: boolean;
  expirationDate: string; // "DD/MM/YYYY" ou ""
}

function cartToLines(cart: Cart): CartLine[] {
  const lines: CartLine[] = [];
  for (const p of cart.products) {
    for (let i = 0; i < p.quantity; i++) {
      lines.push({
        lineId: `${p.id}-${i}`,
        cartProductId: p.id,
        productId: p.productId,
        productName: p.productName,
        productPicture: p.productPicture,
        subcategoryName: p.subcategoryName,
        checked: false,
        expirationDate: '',
      });
    }
  }
  return lines;
}

function parseDate(str: string): string | undefined {
  // Attend "DD/MM/YYYY"
  const parts = str.split('/');
  if (parts.length !== 3) return undefined;
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return undefined;
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export default function PanierScreen() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [homeId, setHomeId] = useState<number | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const selectedHomeId = await AsyncStorage.getItem('selectedHomeId');
      if (!selectedHomeId) { Alert.alert('Erreur', 'Aucun foyer sélectionné'); return; }
      const id = parseInt(selectedHomeId);
      setHomeId(id);
      const data = await cartAPI.getCart(id);
      setLines(cartToLines(data));
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      Alert.alert('Erreur', 'Impossible de charger le panier');
    } finally {
      setLoading(false);
    }
  };

  const toggleLine = (lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, checked: !l.checked } : l))
    );
  };

  const setDate = (lineId: string, value: string) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, expirationDate: value } : l))
    );
  };

  const deselectAll = () => {
    setLines((prev) => prev.map((l) => ({ ...l, checked: false })));
  };

  const handleBuy = async () => {
    if (!homeId) return;
    const checked = lines.filter((l) => l.checked);
    if (checked.length === 0) return;

    // Valider les dates
    for (const line of checked) {
      if (line.expirationDate && !parseDate(line.expirationDate)) {
        Alert.alert('Date invalide', `Date invalide pour "${line.productName}". Format attendu : JJ/MM/AAAA`);
        return;
      }
    }

    setActionLoading(true);
    try {
      // Créer un batch par ligne cochée
      await Promise.all(
        checked.map((line) =>
          productsAPI.createBatch({
            productId: line.productId,
            homeId,
            ...(line.expirationDate ? { expirationDate: parseDate(line.expirationDate) } : {}),
          })
        )
      );

      // Décrémenter les cartProducts concernés
      const countByCartProduct: Record<number, number> = {};
      for (const line of checked) {
        countByCartProduct[line.cartProductId] = (countByCartProduct[line.cartProductId] || 0) + 1;
      }

      // Pour chaque cartProduct touché, trouver la quantité totale actuelle dans les lignes
      const totalByCartProduct: Record<number, number> = {};
      for (const line of lines) {
        totalByCartProduct[line.cartProductId] = (totalByCartProduct[line.cartProductId] || 0) + 1;
      }

      let updatedCart: any = null;
      for (const [cpIdStr, boughtCount] of Object.entries(countByCartProduct)) {
        const cpId = parseInt(cpIdStr);
        const remaining = (totalByCartProduct[cpId] || 0) - boughtCount;
        if (remaining <= 0) {
          updatedCart = await cartAPI.removeProduct(homeId, cpId);
        } else {
          updatedCart = await cartAPI.updateProduct(homeId, cpId, { quantity: remaining });
        }
      }

      // Recharger
      const freshCart = await cartAPI.getCart(homeId);
      setLines(cartToLines(freshCart));
      Alert.alert('Succès', `${checked.length} lot${checked.length > 1 ? 's' : ''} ajouté${checked.length > 1 ? 's' : ''} au stock !`);
    } catch (error) {
      console.error('Erreur achat:', error);
      Alert.alert('Erreur', 'Impossible d\'effectuer l\'achat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!homeId) return;
    const checked = lines.filter((l) => l.checked);
    if (checked.length === 0) return;

    Alert.alert(
      'Supprimer',
      `Supprimer ${checked.length} article${checked.length > 1 ? 's' : ''} du panier ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const countByCartProduct: Record<number, number> = {};
              for (const line of checked) {
                countByCartProduct[line.cartProductId] = (countByCartProduct[line.cartProductId] || 0) + 1;
              }
              const totalByCartProduct: Record<number, number> = {};
              for (const line of lines) {
                totalByCartProduct[line.cartProductId] = (totalByCartProduct[line.cartProductId] || 0) + 1;
              }
              for (const [cpIdStr, delCount] of Object.entries(countByCartProduct)) {
                const cpId = parseInt(cpIdStr);
                const remaining = (totalByCartProduct[cpId] || 0) - delCount;
                if (remaining <= 0) {
                  await cartAPI.removeProduct(homeId, cpId);
                } else {
                  await cartAPI.updateProduct(homeId, cpId, { quantity: remaining });
                }
              }
              const freshCart = await cartAPI.getCart(homeId);
              setLines(cartToLines(freshCart));
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer les articles');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const checkedCount = lines.filter((l) => l.checked).length;

  return (
    <SafeAreaView style={styles.container} edges={[]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Panier</Text>
          <Text style={styles.subtitle}>
            {lines.length === 0 ? 'Vide' : `${lines.length} article${lines.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        {checkedCount > 0 && (
          <TouchableOpacity style={styles.deselectButton} onPress={deselectAll}>
            <Ionicons name="close-circle-outline" size={16} color="#888" />
            <Text style={styles.deselectButtonText}>Désélectionner</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#68A68F" />
          </View>
        ) : lines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Votre panier est vide</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.goShopText}>Aller aux achats</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {lines.map((line) => (
              <View
                key={line.lineId}
                style={[styles.productRow, line.checked && styles.productRowChecked]}
              >
                {/* Image */}
                <Image
                  source={{ uri: `${URL}${line.productPicture}` }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                {/* Info + date */}
                <View style={styles.productInfo}>
                  <Text
                    style={[styles.productName, line.checked && styles.productNameChecked]}
                    numberOfLines={2}
                  >
                    {line.productName}
                  </Text>
                  <Text style={styles.subcategoryName}>{line.subcategoryName}</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor="#bbb"
                    value={line.expirationDate}
                    onChangeText={(v) => setDate(line.lineId, v)}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                {/* Checkbox */}
                <TouchableOpacity
                  style={[styles.checkbox, line.checked && styles.checkboxChecked]}
                  onPress={() => toggleLine(line.lineId)}
                >
                  {line.checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action bar */}
      {checkedCount > 0 && (
        <View style={styles.actionBar}>
          {actionLoading ? (
            <ActivityIndicator size="large" color="#68A68F" />
          ) : (
            <>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                <Ionicons name="bag-check-outline" size={18} color="#fff" />
                <Text style={styles.buyButtonText}>
                  Acheter ({checkedCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.deleteButtonText}>
                  Supprimer ({checkedCount})
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
