import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AddCategoryModal from './modals/AddCategoryModal';
import AddSubcategoryModal from './modals/AddSubcategoryModal';
import AddProductModal from './modals/AddProductModal';
import AddBatchModal from './modals/AddBatchModal';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const navItems = [
    { name: 'Stock', icon: 'archive-outline', route: '/pages/stock' },
    { name: 'Achats', icon: 'cart-outline', route: '/pages/cart' },
    { name: 'add', icon: 'add', route: null },
    { name: 'Recettes', icon: 'receipt-outline', route: '/pages/recipe' },
    { name: 'Compte', icon: 'person-outline', route: '/pages/profile' },
  ];

  const addOptions = [
    { title: 'Ajouter une catégorie', action: () => { setShowAddModal(false); setShowCategoryModal(true); } },
    { title: 'Ajouter une sous-catégorie', action: () => { setShowAddModal(false); setShowSubcategoryModal(true); } },
    { title: 'Ajouter un produit', action: () => { setShowAddModal(false); setShowProductModal(true); } },
    { title: 'Ajouter un lot', action: () => { setShowAddModal(false); setShowBatchModal(true); } },
  ];

  const handlePress = (item: any) => {
    if (item.name === 'add') {
      setShowAddModal(true);
      return;
    }
    if (item.route) {
      router.replace(item.route);
    }
  };

  return (
    <>
      <AddCategoryModal 
        visible={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)}
      />
      <AddSubcategoryModal 
        visible={showSubcategoryModal} 
        onClose={() => setShowSubcategoryModal(false)}
      />
      <AddProductModal 
        visible={showProductModal} 
        onClose={() => setShowProductModal(false)}
      />
      <AddBatchModal 
        visible={showBatchModal} 
        onClose={() => setShowBatchModal(false)}
      />

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.addOptionButton} onPress={addOptions[0].action}>
              <Text style={styles.addOptionText}>{addOptions[0].title}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addOptionButton} onPress={addOptions[1].action}>
              <Text style={styles.addOptionText}>{addOptions[1].title}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addOptionButton} onPress={addOptions[2].action}>
              <Text style={styles.addOptionText}>{addOptions[2].title}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addOptionButton} onPress={addOptions[3].action}>
              <Text style={styles.addOptionText}>{addOptions[3].title}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButtonCircle} onPress={() => setShowAddModal(false)}>
              <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.container}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.route;
          const isAddButton = item.name === 'add';
          
          if (isAddButton) {
            return (
              <TouchableOpacity
                key={index}
                style={styles.addButtonContainer}
                onPress={() => handlePress(item)}
              >
                <View style={styles.addButton}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => handlePress(item)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={isActive ? '#68A68F' : '#8E8E93'} 
              />
              <Text style={[styles.navText, isActive && styles.activeText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activeText: {
    color: '#68A68F',
    fontWeight: '600',
  },
  activeNavItem: {
    backgroundColor: '#68A68F15',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#68A68F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 16,
  },
  addOptionButton: {
    width: '100%',
    backgroundColor: '#68A68F',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#68A68F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ rotate: '45deg' }],
  },
});
