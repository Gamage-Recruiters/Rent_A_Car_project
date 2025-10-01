import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  Filter,
  Edit3,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

export default function BookingsScreen() {
  const { bookings, isLoadingBookings, bookingsError, fetchMyBookings, cancelBooking } = useUserStore();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch bookings when component mounts
    fetchMyBookings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleEditBooking = (booking: typeof bookings[0]) => {
    // Navigate to booking form with edit parameters
    router.push({
      pathname: '/booking/[carId]' as any,
      params: { 
        carId: booking.carId,
        editMode: 'true',
        bookingId: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        totalPrice: booking.totalPrice.toString()
      }
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedFilter === 'all') return true;
    return booking.status === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#8E8E93';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'confirmed': return '#E8F5E8';
      case 'pending': return '#FFF3E0';
      case 'cancelled': return '#FFE8E8';
      case 'completed': return '#E3F2FD';
      default: return '#F0F0F0';
    }
  };

  const FilterButton = ({ title, value, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }: { item: typeof bookings[0] }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image source={{ uri: item.car.image }} style={styles.carImage} />
        <View style={styles.bookingInfo}>
          <Text style={styles.carName}>{item.car.make} {item.car.model}</Text>
          <View style={styles.bookingDate}>
            <Calendar size={14} color="#8E8E93" />
            <Text style={styles.dateText}>
              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.bookingLocation}>
            <MapPin size={14} color="#8E8E93" />
            <Text style={styles.locationText}>{item.pickupLocation}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusBackground(item.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Price:</Text>
          <Text style={styles.detailValue}>${item.totalPrice}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>With Driver:</Text>
          <Text style={styles.detailValue}>{item.withDriver ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Status:</Text>
          <Text style={[
            styles.detailValue,
            { color: item.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booking ID:</Text>
          <Text style={styles.detailValue}>#{item.id}</Text>
        </View>
      </View>

      <View style={styles.bookingActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={16} color="#007AFF" />
            <Text style={styles.actionButtonText}>Contact</Text>
          </TouchableOpacity>
          
          {item.status === 'pending' && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditBooking(item)}
            >
              <Edit3 size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'completed' && item.paymentStatus === 'paid' && (
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => router.push({
                pathname: '/reviews',
                params: {
                  bookingId: item.id,
                  vehicleId: item.carId,
                  carName: `${item.car.make} ${item.car.model}`,
                  addReview: 'true'
                }
              })}
            >
              <Star size={16} color="#FFD700" />
              <Text style={styles.reviewButtonText}>Add Review</Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'completed' && item.paymentStatus === 'pending' && (
            <View style={styles.paymentPendingButton}>
              <Text style={styles.paymentPendingText}>Complete Payment to Review</Text>
            </View>
          )}
        </View>
        
        <View style={styles.rightActions}>
          {(item.status === 'pending' || item.status === 'confirmed') && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          {(item.status === 'cancelled' || item.status === 'completed') && (
            <TouchableOpacity style={styles.primaryActionButton}>
              <Text style={styles.primaryActionButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
      </Animated.View>

      {/* Filters */}
      <Animated.View style={styles.filtersContainer} entering={FadeIn.delay(200)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="All"
            value="all"
            isActive={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
          <FilterButton
            title="Pending"
            value="pending"
            isActive={selectedFilter === 'pending'}
            onPress={() => setSelectedFilter('pending')}
          />
          <FilterButton
            title="Confirmed"
            value="confirmed"
            isActive={selectedFilter === 'confirmed'}
            onPress={() => setSelectedFilter('confirmed')}
          />
          <FilterButton
            title="Completed"
            value="completed"
            isActive={selectedFilter === 'completed'}
            onPress={() => setSelectedFilter('completed')}
          />
          <FilterButton
            title="Cancelled"
            value="cancelled"
            isActive={selectedFilter === 'cancelled'}
            onPress={() => setSelectedFilter('cancelled')}
          />
        </ScrollView>
      </Animated.View>

      {/* Bookings List */}
      <View style={styles.content}>
        {isLoadingBookings ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : bookingsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Loading Bookings</Text>
            <Text style={styles.errorMessage}>{bookingsError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBookings.length === 0 ? (
          <Animated.View style={styles.emptyState} entering={FadeIn.delay(300)}>
            <Calendar size={60} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? "You haven't made any bookings yet"
                : `No ${selectedFilter} bookings found`
              }
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.exploreButtonText}>Explore Cars</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookingsList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  bookingsList: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  carImage: {
    width: 60,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  bookingDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 4,
  },
  bookingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  primaryActionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  primaryActionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginLeft: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  reviewButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#B8860B',
    marginLeft: 4,
  },
  paymentPendingButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  paymentPendingText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#E65100',
    textAlign: 'center',
  },
});