import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 colonnes avec marges

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recipesContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: cardWidth,
    height: cardWidth,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: '60%',
    backgroundColor: '#e0e0e0',
  },
  recipeInfo: {
    height: '40%',
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  recipeServings: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  // Detail page styles
  detailHeader: {
    backgroundColor: '#68A68F',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detailImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#556B6B',
    lineHeight: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  ingredientsList: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  ingredientItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ingredientQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  multipliableTag: {
    fontSize: 11,
    color: '#68A68F',
    marginTop: 4,
    fontStyle: 'italic',
  },
  stepsList: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  stepItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#68A68F',
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    borderRadius: 8,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#68A68F',
    marginBottom: 4,
  },
  stepContent: {
    fontSize: 13,
    color: '#556B6B',
    lineHeight: 18,
  },
});
