import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, MapPin, Pencil, LogOut, Calendar, CarFront, User as UserIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';
import { useUserStore } from '../../stores/userStore';
import Animated, { FadeIn } from 'react-native-reanimated';

type ProfileData = {
  photo?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  quickStats?: {
    totalBookings?: number;
    upcomingTrips?: number;
    totalSpent?: number;
  };
};

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = useUserStore(state => state.logout);
  
  // Normalize API base URL with sensible defaults and Android emulator support
  const rawApi = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
  const adjustedApi = (() => {
    if (Platform.OS === 'android' && rawApi.includes('localhost')) {
      return rawApi.replace('localhost', '10.0.2.2');
    }
    return rawApi;
  })().replace(/\/+$/, '');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const url = `${adjustedApi}/customer/profile/with-stats`;
      console.log('Fetching customer profile from:', url);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      if (response.data.success) {
        console.log('Profile data:', response.data.data);
        setProfileData(response.data.data);
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      let errorMessage = 'An error occurred while fetching your profile';
      
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.message || errorMessage;
        
        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          // Clear the actual token key we store
          await AsyncStorage.removeItem('accessToken');
          router.push('/auth/login');
          return;
        }
        // If we got a 404, try the alternate common port automatically (5000 <-> 8000)
        if (err.response.status === 404) {
          try {
            const tried = adjustedApi;
            const alt = tried.includes(':5000')
              ? tried.replace(':5000', ':8000')
              : tried.includes(':8000')
              ? tried.replace(':8000', ':5000')
              : tried; // if neither, keep same

            if (alt !== tried) {
              const altUrl = `${alt}/customer/profile/with-stats`;
              console.log('Retrying customer profile at alternate URL:', altUrl);
              const token2 = await AsyncStorage.getItem('accessToken');
              const res2 = await axios.get(altUrl, {
                headers: { Authorization: `Bearer ${token2}` },
                timeout: 8000,
              });
              if (res2.data?.success) {
                setProfileData(res2.data.data);
                setError(null);
                return; // success via fallback
              }
            }
          } catch (altErr: any) {
            console.warn('Alternate URL attempt failed:', (altErr && (altErr as any).message) || String(altErr));
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleEditProfile = () => {
    router.push('/editProfile/edit-userProfile');
  };

  const handleViewBookings = () => {
    router.push('/bookings');
  };

  const handleViewFavorites = () => {
    router.push('/favorites');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          try {
            // Clear token from AsyncStorage
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userType');
            
            // Reset store state
            logout();
            
            // Navigate to login
            router.replace('/auth/login');
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        } 
      },
    ]);
  };

  const getImageUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${adjustedApi.replace(/\/api$/, '')}${photoPath}`;
  };

  const getInitials = (firstName: string | undefined, lastName: string | undefined) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <View style={styles.avatarWrapper}>
        {profileData?.photo ? (
          <Image 
            source={{ uri: getImageUrl(profileData.photo) || '' }} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
            <Text style={styles.profileImageText}>
              {getInitials(profileData?.firstName, profileData?.lastName)}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
          <Pencil size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.name}>
        {profileData?.firstName} {profileData?.lastName}
      </Text>
      <Text style={styles.username}>
        {profileData?.email}
      </Text>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsContainer}>
      <Animated.View entering={FadeIn.delay(200)} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <CarFront size={20} color="#007AFF" />
        </View>
        <Text style={styles.statValue}>{profileData?.quickStats?.totalBookings || 0}</Text>
        <Text style={styles.statLabel}>Bookings</Text>
      </Animated.View>
      
      <Animated.View entering={FadeIn.delay(300)} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Calendar size={20} color="#4CAF50" />
        </View>
        <Text style={styles.statValue}>{profileData?.quickStats?.upcomingTrips || 0}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </Animated.View>
      
      <Animated.View entering={FadeIn.delay(400)} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <UserIcon size={20} color="#FF9500" />
        </View>
        <Text style={styles.statValue}>${profileData?.quickStats?.totalSpent || 0}</Text>
        <Text style={styles.statLabel}>Spent</Text>
      </Animated.View>
    </View>
  );

  const renderContactInfo = () => (
    <Animated.View entering={FadeIn.delay(500)} style={styles.card}>
      <Text style={styles.cardTitle}>Contact Info</Text>
      <View style={styles.infoItem}>
        <Mail size={18} color="#007AFF" />
        <Text style={styles.infoText}>{profileData?.email || 'Not provided'}</Text>
      </View>
      <View style={styles.infoItem}>
        <Phone size={18} color="#007AFF" />
        <Text style={styles.infoText}>{profileData?.phoneNumber || 'Not provided'}</Text>
      </View>
      <View style={styles.infoItem}>
        <MapPin size={18} color="#007AFF" />
        <Text style={styles.infoText}>{profileData?.address || 'Not provided'}</Text>
      </View>
    </Animated.View>
  );

  const renderActions = () => (
    <Animated.View entering={FadeIn.delay(600)} style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
        <Text style={styles.actionButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleViewBookings}>
        <Text style={styles.actionButtonText}>View Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleViewFavorites}>
        <Text style={styles.actionButtonText}>My Favorites</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={16} color="#fff" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProfileContent = () => (
    <>
      {renderHeader()}
      {renderProfileSection()}
      {renderStatsSection()}
      {renderContactInfo()}
      {renderActions()}
    </>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={[{ key: 'profile' }]}
        renderItem={() => renderProfileContent()}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1c1c1e',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
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
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    color: '#1e1e1e',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1c1c1e',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});