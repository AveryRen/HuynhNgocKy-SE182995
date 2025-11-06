import axios from 'axios';
import DatabaseService from './DatabaseService';

const API_BASE_URL = 'https://fakestoreapi.com';

class ApiService {
  async fetchProducts() {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        timeout: 10000, // 10 seconds timeout
      });
      const products = response.data;
      
      await DatabaseService.saveProducts(products);
      
      return {success: true, data: products};
    } catch (error) {
      const cachedProducts = await DatabaseService.getProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        return {success: true, data: cachedProducts, fromCache: true};
      }
      
      return {success: false, error: error.message};
    }
  }

  async fetchProductById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
        timeout: 10000,
      });
      return {success: true, data: response.data};
    } catch (error) {
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

  async fetchCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        timeout: 10000,
      });
      return {success: true, data: response.data};
    } catch (error) {
      const cachedProducts = await DatabaseService.getProducts();
      if (cachedProducts) {
        const categories = this.getCategories(cachedProducts);
        return {success: true, data: categories, fromCache: true};
      }
      return {success: false, error: error.message};
    }
  }

  getCategories(products) {
    if (!products || products.length === 0) return [];
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  }
}

export default new ApiService();

