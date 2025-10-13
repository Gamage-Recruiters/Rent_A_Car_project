import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, MapPin, Pencil, LogOut, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
};

type Rental = {
  car: string;
  date: string;
  duration: string;
  status: string;
};

export default function OwnerProfileScreen() {
  const router = useRouter();
  const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

  const [user, setUser] = useState<User | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setImageError(false);

      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        setError('User not logged in.');
        return;
      }

      console.log('Fetching profile data...');

      const [profileResponse, rentalsResponse] = await Promise.all([
        axios.get(`${API_URL}/owner/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        }),
        axios
          .get(`${API_URL}/owner/bookings`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 10000,
          })
          .catch((err) => {
            console.log(
              'Rentals fetch failed, using empty array:',
              err.message
            );
            return { data: { data: [] } }; // Return empty array if rentals fail
          }),
      ]);

      console.log('Profile data received:', profileResponse.data);
      setUser(profileResponse.data.data);
      setRentals(rentalsResponse.data.data || []);
    } catch (err: any) {
      console.error('Profile fetch error:', err);

      if (err.response?.status === 401) {
        await AsyncStorage.clear();
        router.replace('/auth/login');
        return;
      } else if (err.response?.status === 404) {
        setError('Profile not found.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);
  const handleEditProfile = () => {
    router.push('/editProfile/edit-profile');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleImageError = () => {
    console.log('Image failed to load, falling back to placeholder');
    setImageError(true);
  };

  const getImageUrl = () => {
  if (!user?.image || imageError) {
    return 'https://via.placeholder.com/100';
  }

  // CORRECT: Use base URL without /api for images
  const baseUrl = API_URL.replace('/api', '');
  const imageUrl = `${baseUrl}/uploads/ownerProfileImages/${user.image}?t=${Date.now()}`;
  console.log('Loading image from:', imageUrl);
  return imageUrl;
};

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error || 'No user data found'}</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {user.image && !imageError ? (
              <Image
                source={{ uri: getImageUrl() }}
                style={styles.profileImage}
                onError={handleImageError}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <User size={40} color="#666" />
              </View>
            )}

            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleEditProfile}
            >
              <Pencil size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.username}>
            {user.username ? `@${user.username}` : '@username'}
          </Text>

          {/* Debug info - remove in production */}
          {__DEV__ && user.image && (
            <Text style={styles.debugText}>Image: {user.image}</Text>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Mail size={20} color="#007AFF" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          {user.phone ? (
            <View style={styles.infoRow}>
              <Phone size={20} color="#007AFF" />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : (
            <Text style={styles.missingInfo}>No phone number provided</Text>
          )}
          {user.address ? (
            <View style={styles.infoRow}>
              <MapPin size={20} color="#007AFF" />
              <Text style={styles.infoText}>{user.address}</Text>
            </View>
          ) : (
            <Text style={styles.missingInfo}>No address provided</Text>
          )}
        </View>

        {/* Rental History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Rentals</Text>
          {rentals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.noData}>No rentals found</Text>
              <Text style={styles.emptySubtext}>
                Your rental history will appear here
              </Text>
            </View>
          ) : (
            rentals.slice(0, 5).map((rental, index) => (
              <View key={index} style={styles.rentalCard}>
                <View style={styles.rentalInfo}>
                  <Text style={styles.carName}>{rental.car}</Text>
                  <Text style={styles.rentalDetails}>
                    {rental.date} • {rental.duration}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        rental.status === 'Completed'
                          ? '#d1f7c4'
                          : rental.status === 'Active'
                          ? '#c4e1f7'
                          : '#ffe8b3',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          rental.status === 'Completed'
                            ? '#2e8b57'
                            : rental.status === 'Active'
                            ? '#007AFF'
                            : '#ff9500',
                      },
                    ]}
                  >
                    {rental.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6faff' },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6faff',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF20',
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF20',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    color: '#1e1e1e',
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  missingInfo: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  noData: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  rentalCard: {
    backgroundColor: '#f2f8ff',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rentalInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  rentalDetails: {
    fontSize: 13,
    color: '#555',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
