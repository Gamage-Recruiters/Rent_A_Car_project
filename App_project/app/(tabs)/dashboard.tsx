import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Car, Calendar, DollarSign, Eye, CreditCard as Edit, Trash2, Star, MapPin, Users, Fuel } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

export default function DashboardScreen() {
  const { user, userType, cars, bookings, updateCar } = useUserStore();
  const [selectedTab, setSelectedTab] = useState('overview');

  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const handleAddCar = () => {
    router.push('/add-car');
  };

  const handleEditCar = (carId: string) => {
    router.push({ pathname: '/edit-car', params: { carId } });
  };

  const handleDeleteCar = (carId: string) => {
    Alert.alert(
      'Delete Car',
      'Are you sure you want to delete this car?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd make an API call here
            console.log('Deleting car:', carId);
          }
        },
      ]
    );
  };

  const handleToggleAvailability = (carId: string, currentStatus: boolean) => {
    updateCar(carId, { available: !currentStatus });
  };

  const renderCarItem = ({ item }: { item: typeof cars[0] }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.carCard}>
      <Image source={{ uri: item.image }} style={styles.carImage} />
      <View style={styles.carInfo}>
        <View style={styles.carHeader}>
          <Text style={styles.carName}>{item.make} {item.model}</Text>
          <View style={[
            styles.availabilityBadge,
            { backgroundColor: item.available ? '#E8F5E8' : '#FFE8E8' }
          ]}>
            <Text style={[
              styles.availabilityText,
              { color: item.available ? '#4CAF50' : '#F44336' }
            ]}>
              {item.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        
        <View style={styles.carDetails}>
          <View style={styles.detailItem}>
            <MapPin size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <DollarSign size={14} color="#8E8E93" />
            <Text style={styles.detailText}>${item.pricePerDay}/day</Text>
          </View>
          <View style={styles.detailItem}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.detailText}>{item.rating}</Text>
          </View>
        </View>
        
        <View style={styles.carActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleAvailability(item.id, item.available)}
          >
            <Eye size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>
              {item.available ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCar(item.id)}
          >
            <Edit size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCar(item.id)}
          >
            <Trash2 size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderBookingItem = ({ item }: { item: typeof bookings[0] }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingCarName}>{item.car.make} {item.car.model}</Text>
        <View style={[
          styles.bookingStatusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.bookingStatusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingDate}>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </Text>
        <Text style={styles.bookingPrice}>${item.totalPrice}</Text>
      </View>
      
      <TouchableOpacity style={styles.bookingAction}>
        <Text style={styles.bookingActionText}>View Details</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
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
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={animatedStyle}>
            <Plus size={24} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Animated.View style={styles.statsContainer} entering={FadeIn}>
        <View style={styles.statCard}>
          <Car size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{cars.length}</Text>
          <Text style={styles.statLabel}>Cars</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={24} color="#FF9800" />
          <Text style={styles.statNumber}>$2,450</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Overview"
          isActive={selectedTab === 'overview'}
          onPress={() => setSelectedTab('overview')}
        />
        <TabButton
          title="Cars"
          isActive={selectedTab === 'cars'}
          onPress={() => setSelectedTab('cars')}
        />
        <TabButton
          title="Bookings"
          isActive={selectedTab === 'bookings'}
          onPress={() => setSelectedTab('bookings')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>
                Your BMW X3 was booked for $145/day
              </Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>
                Toyota Camry booking confirmed
              </Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
        )}

        {selectedTab === 'cars' && (
          <View style={styles.carsContainer}>
            <FlatList
              data={cars}
              renderItem={renderCarItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.carsList}
            />
          </View>
        )}

        {selectedTab === 'bookings' && (
          <View style={styles.bookingsContainer}>
            <FlatList
              data={bookings}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bookingsList}
            />
          </View>
        )}
      </ScrollView>
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
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  notOwnerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  overviewContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  carsContainer: {
    paddingBottom: 20,
  },
  carsList: {
    paddingBottom: 20,
  },
  carCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  carImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  carInfo: {
    padding: 16,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  carDetails: {
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
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 4,
  },
  carActions: {
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
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginLeft: 4,
  },
  bookingsContainer: {
    paddingBottom: 20,
  },
  bookingsList: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingCarName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  bookingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  bookingPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
  },
  bookingAction: {
    alignSelf: 'flex-start',
  },
  bookingActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
});