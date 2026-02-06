import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Stock', icon: 'archive-outline', route: '/pages/home' },
    { name: 'Achats', icon: 'cart-outline', route: '/pages/achats' },
    { name: 'add', icon: 'add', route: null },
    { name: 'Recettes', icon: 'receipt-outline', route: '/pages/recettes' },
    { name: 'Compte', icon: 'person-outline', route: '/pages/profile' },
  ];

  const handlePress = (item: any) => {
    if (item.name === 'add') {
      console.log('Ajouter...');
      return;
    }
    if (item.route) {
      router.replace(item.route);
    }
  };

  return (
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
});
