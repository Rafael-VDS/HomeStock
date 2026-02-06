import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { styles } from '../../styles/stock.styles';

export default function StockScreen() {
    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Stock</Text>
                    <Text style={styles.subtitle}>Gérez votre inventaire</Text>
                </View>
            </ScrollView>
            <NavBar />
        </SafeAreaView>
    );
}
