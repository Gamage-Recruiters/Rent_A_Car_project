import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/userStore';
import { Heart, Star, MapPin, Car } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const { favorites, fetchFavorites, removeFromFavorites } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, []);

  const checkAuthAndLoadFavorites = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    setToken(accessToken);
    
    if (accessToken) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      await fetchFavorites();
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await removeFromFavorites(favoriteId);
  };

  const handleCarPress = (carId: string) => {
    router.push({
      pathname: '/car-details/[carId]',
      params: { carId },
    });
  };

  const renderFavoriteItem = ({ item }: { item: typeof favorites[0] }) => {
    const car = item.car;
    
    return (
      <Animated.View entering={FadeIn.delay(200)} style={styles.carCard}>
        <TouchableOpacity
          style={styles.carCardContent}
          onPress={() => handleCarPress(car.id)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: car.image }} style={styles.carImage} />
          
          <View style={styles.infoContainer}>
            <View style={styles.carDetails}>
              <Text style={styles.carName} numberOfLines={1}>
                {car.make} {car.model}
              </Text>
              
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{car.rating.toFixed(1)}</Text>
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#8E8E93" />
              <Text style={styles.location} numberOfLines={1}>
                {car.location}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>${car.pricePerDay}</Text>
              <Text style={styles.perDay}>/day</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Heart size={18} color="#FF3B30" fill="#FF3B30" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Not logged in view
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Car size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>Login Required</Text>
          <Text style={styles.emptySubtext}>
            Please login to save and view your favorite cars
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.browseButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Car size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Cars you favorite will appear here.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.browseButtonText}>Browse Cars</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  carCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  carCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  carImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  carDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 6,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
  },
  perDay: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 2,
  },
  removeButton: {
    padding: 8,
    marginRight: -8,
    marginTop: -8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});