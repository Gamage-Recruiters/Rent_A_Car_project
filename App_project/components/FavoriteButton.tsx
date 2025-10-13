import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteButtonProps {
  carId: string;
  size?: number;
  style?: any;
}

export default function FavoriteButton({ carId, size = 24, style }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { checkIfFavorited, addToFavorites, removeFromFavorites } = useUserStore();

  useEffect(() => {
    checkFavoriteStatus();
  }, [carId]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await checkIfFavorited(carId);
      setIsFavorite(result.isFavorited);
      setFavoriteId(result.favoriteId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    
    if (!token) {
      Alert.alert(
        'Authentication Required',
        'Please login to add this car to your favorites.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (isFavorite && favoriteId) {
        // Remove from favorites
        success = await removeFromFavorites(favoriteId);
        if (success) {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } else {
        // Add to favorites
        success = await addToFavorites(carId);
        if (success) {
          // Refresh favorite status to get the new favoriteId
          await checkFavoriteStatus();
        }
      }
      
      if (!success) {
        Alert.alert(
          'Error',
          isFavorite
            ? 'Failed to remove from favorites. Please try again.'
            : 'Failed to add to favorites. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={toggleFavorite}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FF3B30" />
      ) : (
        <Heart
          size={size}
          color={isFavorite ? '#FF3B30' : '#FFFFFF'}
          fill={isFavorite ? '#FF3B30' : 'transparent'}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});