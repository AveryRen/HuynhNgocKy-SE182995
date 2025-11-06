import axios from 'axios';
import DatabaseService from './DatabaseService';

const API_BASE_URL = 'https://fakestoreapi.com';

class ApiService {
  /**
   * Fetch all products from FakeStoreAPI
   * Endpoint: GET https://fakestoreapi.com/products
   * Returns: Array of products with id, title, price, description, category, image, rating
   */
  async fetchProducts() {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        timeout: 10000, // 10 seconds timeout
      });
      const products = response.data;
      
      // Save to local database for offline use
      await DatabaseService.saveProducts(products);
      
      return {success: true, data: products};
    } catch (error) {
      // Try to get cached data when offline or API fails
      const cachedProducts = await DatabaseService.getProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        return {success: true, data: cachedProducts, fromCache: true};
      }
      
      return {success: false, error: error.message};
    }
  }

  /**
   * Fetch single product by ID from FakeStoreAPI
   * Endpoint: GET https://fakestoreapi.com/products/:id
   * @param {number} id - Product ID
   */
  async fetchProductById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
        timeout: 10000,
      });
      return {success: true, data: response.data};
    } catch (error) {
      // Try to get from cache
      const cachedProducts = await DatabaseService.getProducts();
      if (cachedProducts) {
        const product = cachedProducts.find(p => p.id === id);
        if (product) {
          return {success: true, data: product, fromCache: true};
        }
      }
      
      return {success: false, error: error.message};
    }
  }

  /**
   * Fetch products by category from FakeStoreAPI
   * Endpoint: GET https://fakestoreapi.com/products/category/:category
   * @param {string} category - Category name
   */
  async fetchProductsByCategory(category) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/category/${category}`,
        {
          timeout: 10000,
        },
      );
      return {success: true, data: response.data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  }

  /**
   * Get all available categories from FakeStoreAPI
   * Endpoint: GET https://fakestoreapi.com/products/categories
   */
  async fetchCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        timeout: 10000,
      });
      return {success: true, data: response.data};
    } catch (error) {
      // Fallback: extract categories from cached products
      const cachedProducts = await DatabaseService.getProducts();
      if (cachedProducts) {
        const categories = this.getCategories(cachedProducts);
        return {success: true, data: categories, fromCache: true};
      }
      return {success: false, error: error.message};
    }
  }

  /**
   * Extract unique categories from products array
   * @param {Array} products - Array of products
   * @returns {Array} - Sorted array of unique categories
   */
  getCategories(products) {
    if (!products || products.length === 0) return [];
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  }
}

export default new ApiService();

