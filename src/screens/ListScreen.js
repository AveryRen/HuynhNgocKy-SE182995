import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import ApiService from '../services/ApiService';
import DatabaseService from '../services/DatabaseService';

const ListScreen = ({navigation}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await ApiService.fetchProducts();

      if (result.success && result.data && result.data.length > 0) {
        // Success with data
        setProducts(result.data);
        setFilteredProducts(result.data);
        const uniqueCategories = ApiService.getCategories(result.data);
        setCategories(uniqueCategories);
        setError(null);
      } else if (result.success && (!result.data || result.data.length === 0)) {
        // Success but no data (empty cache)
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
        // Check if we have cached data
        const cachedProducts = await DatabaseService.getProducts();
        if (!cachedProducts || cachedProducts.length === 0) {
          setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối của bạn.');
        }
      } else {
        // Failed - check cache before showing error
        const cachedProducts = await DatabaseService.getProducts();
        if (cachedProducts && cachedProducts.length > 0) {
          // Use cached data even if API failed
          setProducts(cachedProducts);
          setFilteredProducts(cachedProducts);
          const uniqueCategories = ApiService.getCategories(cachedProducts);
          setCategories(uniqueCategories);
          setError(null);
        } else {
          // No cache and API failed - show error
          setProducts([]);
          setFilteredProducts([]);
          setCategories([]);
          setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối của bạn.');
        }
      }
    } catch (err) {
      // Check cache before showing error
      const cachedProducts = await DatabaseService.getProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        setProducts(cachedProducts);
        setFilteredProducts(cachedProducts);
        const uniqueCategories = ApiService.getCategories(cachedProducts);
        setCategories(uniqueCategories);
        setError(null);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối của bạn.');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused (but don't show loading for refresh)
      if (!isInitialLoad) {
        loadData(false);
      }
    }, [isInitialLoad]),
  );

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleCategorySelect = category => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const renderProductItem = ({item}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Detail', {productId: item.id})}>
      <Image
        source={{uri: item.image}}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (error && products.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>📡</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          Đảm bảo bạn có kết nối internet và thử lại.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Filter - Horizontal Scroll */}
      {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            data={['Tất cả', ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const isSelected = item === 'Tất cả' 
                ? !selectedCategory 
                : item === selectedCategory;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategorySelect(item === 'Tất cả' ? null : item)}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}>
                    {item === 'Tất cả' ? 'Tất cả' : item}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.categoryList}
          />
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ListScreen;

