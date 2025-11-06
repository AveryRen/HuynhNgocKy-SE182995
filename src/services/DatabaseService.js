import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_KEY = '@products_data';
const FAVORITES_KEY = '@favorites';

class DatabaseService {
  // Save products data to local storage
  async saveProducts(products) {
    try {
      const jsonValue = JSON.stringify(products);
      await AsyncStorage.setItem(DATA_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  // Get products from local storage
  async getProducts() {
    try {
      const jsonValue = await AsyncStorage.getItem(DATA_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting products:', error);
      return null;
    }
  }

  // Get favorite IDs
  async getFavoriteIds() {
    try {
      const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Add favorite
  async addFavorite(productId) {
    try {
      const favorites = await this.getFavoriteIds();
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        const jsonValue = JSON.stringify(favorites);
        await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
      }
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  // Remove favorite
  async removeFavorite(productId) {
    try {
      const favorites = await this.getFavoriteIds();
      const updatedFavorites = favorites.filter(id => id !== productId);
      const jsonValue = JSON.stringify(updatedFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  // Check if item is favorite
  async isFavorite(productId) {
    try {
      const favorites = await this.getFavoriteIds();
      return favorites.includes(productId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  // Get favorite products
  async getFavoriteProducts() {
    try {
      const favorites = await this.getFavoriteIds();
      const products = await this.getProducts();
      if (!products) return [];
      
      return products.filter(product => favorites.includes(product.id));
    } catch (error) {
      console.error('Error getting favorite products:', error);
      return [];
    }
  }
}

export default new DatabaseService();

