import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import ApiService from '../services/ApiService';
import DatabaseService from '../services/DatabaseService';

const DetailScreen = ({route, navigation}) => {
  const {productId} = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(true);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const result = await ApiService.fetchProductById(productId);
      if (result.success) {
        setProduct(result.data);
      } else {
        Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load product details.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await DatabaseService.isFavorite(productId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await DatabaseService.removeFavorite(productId);
        setIsFavorite(false);
      } else {
        await DatabaseService.addFavorite(productId);
        setIsFavorite(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích.');
    }
  };

  useEffect(() => {
    loadProduct();
    checkFavoriteStatus();
  }, [productId]);

  useFocusEffect(
    React.useCallback(() => {
      checkFavoriteStatus();
    }, [productId]),
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Đang tải chi tiết sản phẩm...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={{uri: product.image}}
        style={styles.productImage}
        resizeMode="contain"
      />

      <View style={styles.productInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={loadingFavorite}
            style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {product.rating?.rate || 'N/A'}</Text>
            <Text style={styles.ratingCount}>
              ({product.rating?.count || 0} đánh giá)
            </Text>
          </View>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Danh mục:</Text>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Mô tả:</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã sản phẩm:</Text>
            <Text style={styles.detailValue}>{product.id}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 20,
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
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  productTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 32,
  },
  priceContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  ratingCount: {
    fontSize: 14,
    color: '#999',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default DetailScreen;

