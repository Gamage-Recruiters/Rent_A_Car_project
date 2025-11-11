import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Car, Calendar, DollarSign, Eye, CreditCard as Edit, Trash2, MapPin, Fuel } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ;

// Define proper TypeScript interfaces for the API response
interface OwnerVehicle {
  _id: string;
  brand: string;
  model: string;
  year: string;
  images: string[];
  pricePerDay: number;
  pricePerDistance?: number;
  location: string;
  isAvailable: boolean;
  fuelType: string;
  transmission: string;
  noSeats: number;
  description?: string;
  isDriverAvailable: boolean;
  phoneNumber: string;
  email: string;
  pickupAddress: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
}

interface OwnerBooking {
  _id: string;
  vehicle: {
    _id: string;
    brand: string;
    model: string;
  };
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid';
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
}

export default function DashboardScreen() {
  const { user, userType } = useUserStore();
  const [selectedTab, setSelectedTab] = useState('vehicles');
  const [ownerVehicles, setOwnerVehicles] = useState<OwnerVehicle[]>([]);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch owner's vehicles from API
  const fetchOwnerVehicles = async () => {
    try {
      const token = await AsyncStorage.getItem('ownerAccessToken') || await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      console.log('Fetching vehicles from:', `${API_BASE}/owner/vehicle/all`);
      
      const response = await axios.get(`${API_BASE}/owner/vehicle/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Owner vehicles response:', JSON.stringify(response.data, null, 2));

      // Check if data exists in response
      if (response.data && response.data.data) {
        const vehicles: OwnerVehicle[] = response.data.data || [];
        console.log(`Found ${vehicles.length} vehicles`);
        setOwnerVehicles(vehicles);
      } else {
        console.log('No vehicles data found in response');
        setOwnerVehicles([]);
      }
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', 'Failed to load vehicles');
    }
  };

  // Fetch owner's bookings
const fetchOwnerBookings = async () => {
 

  try {
    const token =
      (await AsyncStorage.getItem('ownerAccessToken')) ||
      (await AsyncStorage.getItem('accessToken'));

    

    if (!token) {
      Alert.alert('Error', 'Please login again');
      return;
    }

    const response = await axios.get(`${API_BASE}/owner/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    

if (response.data && response.data.bookings) {
  const ownerBookings: OwnerBooking[] = response.data.bookings || [];
  
  setBookings(ownerBookings);
} else {
  console.log(" No bookings found in response");
}
  } catch (error: any) {
    console.error(' Error fetching bookings:', error);
  }
};



  // Load data on component mount
  useEffect(() => {
    console.log(" Dashboard mounted - loading data");
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    await Promise.all([fetchOwnerVehicles(), fetchOwnerBookings()]);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddCar = () => {
    router.push('/add-car');
  };

  const handleEditCar = (vehicleId: string) => {
    router.push({ pathname: '/edit-car', params: { vehicleId } });
  };

  const handleDeleteCar = async (vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('ownerAccessToken') || await AsyncStorage.getItem('accessToken');
              
              await axios.delete(`${API_BASE}/owner/vehicle/${vehicleId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // Remove vehicle from local state
              setOwnerVehicles(prev => prev.filter(vehicle => vehicle._id !== vehicleId));
              Alert.alert('Success', 'Vehicle deleted successfully');
            } catch (error: any) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'Failed to delete vehicle');
            }
          }
        },
      ]
    );
  };

  const handleToggleAvailability = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const token = await AsyncStorage.getItem('ownerAccessToken') || await AsyncStorage.getItem('accessToken');
      
      const response = await axios.patch(
        `${API_BASE}/owner/vehicle/${vehicleId}/availability`,
        { available: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update local state
        setOwnerVehicles(prev => 
          prev.map(vehicle => 
            vehicle._id === vehicleId 
              ? { ...vehicle, isAvailable: !currentStatus }
              : vehicle
          )
        );
      }
    } catch (error: any) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, construct full URL
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE.replace('/api', '')}${imagePath}`;
    }
    
    // If it's just a filename, construct the path
    return `${API_BASE.replace('/api', '')}/uploads/vehicles/${imagePath}`;
  };

  const renderVehicleItem = ({ item }: { item: OwnerVehicle }) => {
    console.log('Rendering vehicle:', item.brand, item.model, 'Images:', item.images);
    
    const imageUrl = item.images && item.images.length > 0 
      ? getImageUrl(item.images[0]) 
      : null;

    return (
      <Animated.View entering={FadeIn.delay(100)} style={styles.vehicleCard}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.vehicleImage} 
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.vehicleImagePlaceholder}>
            <Car size={40} color="#8E8E93" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.vehicleName}>{item.brand} {item.model}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.availabilityBadge,
                { backgroundColor: item.isAvailable ? '#E8F5E8' : '#FFE8E8' }
              ]}>
                <Text style={[
                  styles.availabilityText,
                  { color: item.isAvailable ? '#4CAF50' : '#F44336' }
                ]}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </View>
              <View style={[
                styles.approvalBadge,
                { backgroundColor: item.isApproved ? '#E8F5E8' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.approvalText,
                  { color: item.isApproved ? '#4CAF50' : '#FF9800' }
                ]}>
                  {item.isApproved ? 'Approved' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.vehicleDetails}>
            <View style={styles.detailItem}>
              <MapPin size={14} color="#8E8E93" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <DollarSign size={14} color="#8E8E93" />
              <Text style={styles.detailText}>${item.pricePerDay}/day</Text>
            </View>
            <View style={styles.detailItem}>
              <Fuel size={14} color="#8E8E93" />
              <Text style={styles.detailText}>{item.fuelType}</Text>
            </View>
          </View>
          
          <View style={styles.vehicleActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleAvailability(item._id, item.isAvailable)}
            >
              <Eye size={16} color="#007AFF" />
              <Text style={styles.actionButtonText}>
                {item.isAvailable ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCar(item._id)}
            >
              <Edit size={16} color="#007AFF" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCar(item._id)}
            >
              <Trash2 size={16} color="#F44336" />
              <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderBookingItem = ({ item }: { item: OwnerBooking }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingCarName}>{item.vehicle.brand} {item.vehicle.model}</Text>
        <View style={[
          styles.bookingStatusBadge,
          { backgroundColor: getStatusColor(item.bookingStatus) }
        ]}>
          <Text style={styles.bookingStatusText}>{item.bookingStatus}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingDate}>
          {new Date(item.pickupDate).toLocaleDateString()} - {new Date(item.dropoffDate).toLocaleDateString()}
        </Text>
        <Text style={styles.bookingPrice}>${item.totalAmount}</Text>
      </View>
      
      <Text style={styles.customerInfo}>
        Customer: {item.customer?.name || 'Unknown'}
      </Text>
    </Animated.View>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#E8F5E8';
      case 'pending': return '#FFF3E0';
      case 'cancelled': return '#FFE8E8';
      case 'completed': return '#E3F2FD';
      default: return '#F0F0F0';
    }
  };

  const TabButton = ({ title, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (userType !== 'owner') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notOwnerContainer}>
          <Car size={60} color="#8E8E93" />
          <Text style={styles.notOwnerTitle}>Car Owner Dashboard</Text>
          <Text style={styles.notOwnerSubtitle}>
            This section is only available for car owners
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subtitle}>Manage your car rental business</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCar}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Animated.View style={styles.statsContainer} entering={FadeIn}>
        <View style={styles.statCard}>
          <Car size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{ownerVehicles.length}</Text>
          <Text style={styles.statLabel}>Vehicles</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            ${ownerVehicles.reduce((total, vehicle) => total + (vehicle.pricePerDay || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Daily Potential</Text>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title={`Vehicles (${ownerVehicles.length})`}
          isActive={selectedTab === 'vehicles'}
          onPress={() => setSelectedTab('vehicles')}
        />
        <TabButton
          title={`Bookings (${bookings.length})`}
          isActive={selectedTab === 'bookings'}
          onPress={() => setSelectedTab('bookings')}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'vehicles' && (
          <View style={styles.tabContent}>
            {ownerVehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Car size={60} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No vehicles added yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start by adding your first vehicle to rent
                </Text>
                <TouchableOpacity style={styles.addFirstButton} onPress={handleAddCar}>
                  <Text style={styles.addFirstButtonText}>Add Your First Vehicle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={ownerVehicles}
                renderItem={renderVehicleItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#007AFF']}
                    tintColor={'#007AFF'}
                  />
                }
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}

        {selectedTab === 'bookings' && (
          <View style={styles.tabContent}>
            {bookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={60} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No bookings yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your bookings will appear here
                </Text>
              </View>
            ) : (
              <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#007AFF']}
                    tintColor={'#007AFF'}
                  />
                }
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  notOwnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notOwnerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  notOwnerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  tabContent: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: 200,
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleHeader: {
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  approvalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approvalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  vehicleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingCarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  bookingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  customerInfo: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});