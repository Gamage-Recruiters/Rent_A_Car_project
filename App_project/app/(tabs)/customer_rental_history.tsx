import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../stores/userStore';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = API_URL?.replace(/\/api$/, "");
const { width } = Dimensions.get('window');

interface BookingData {
  _id: string;
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  pickupLocation: string;
  dropoffLocation: string;
  idDocument: string[];
  drivingLicenseDocument: string[];
  createdAt?: string;
  updatedAt?: string;
  vehicle?: {
    _id?: string;
    vehicleName?: string;
    vehicleLicenseNumber?: string;
    brand?: string;
    model?: string;
    year?: number;
    images?: string[];
    pricePerDay?: number;
    vehicleType?: string;
    fuelType?: string;
    transmission?: string;
    isDriverAvailable?: boolean;
    pickupAddress?: string;
  };
  owner?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

const TABS = ['All Bookings', 'Active', 'Completed', 'Cancelled'];
const PAYMENT_FILTERS = ['All Payments', 'Paid', 'Pending'];
const DATE_FILTERS = ['All Time', 'Last Week', 'Last Month', 'Last Year'];

export default function CustomerRentalHistoryScreen() {
  const [selectedTab, setSelectedTab] = useState('All Bookings');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  const fetchRentalHistory = async () => {
    try {
      setError(null);
      if (!user || !user.id) {
        Alert.alert('Error', 'Please login to view your rental history');
        return;
      }

      console.log('Fetching rental history from:', `${API_URL}/customer/rental-history`);
      
      const response = await axios.get(`${API_URL}/customer/rental-history`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Rental history response:', response.data);

      if (response.data && response.data.success) {
        const historyData = response.data.data || [];
        console.log(`Found ${historyData.length} rental records`);
        if (historyData.length > 0) {
          console.log('First booking structure:', JSON.stringify(historyData[0], null, 2));
          console.log('First booking pickup date:', historyData[0]?.pickupDate);
          console.log('First booking total amount:', historyData[0]?.totalAmount);
          console.log('First booking status:', historyData[0]?.bookingStatus);
        }
        setBookings(historyData);
      } else {
        console.error('API returned success: false');
        setError('Failed to fetch rental history - API returned success: false');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching rental history:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          Alert.alert('Error', 'Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          setError('Rental history endpoint not found.');
          Alert.alert('Error', 'Rental history endpoint not found');
        } else {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch rental history';
          setError(errorMessage);
          Alert.alert('Error', errorMessage);
        }
      } else {
        setError('Network error occurred');
        Alert.alert('Error', 'Network error occurred');
      }
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRentalHistory();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRentalHistory();
  };

  const constructImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    console.log('Original image path:', imagePath);
    
    if (imagePath.startsWith('http')) {
      console.log('Using full URL:', imagePath);
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      const fullUrl = `${BASE_URL}${imagePath}`;
      console.log('Constructed URL from /uploads:', fullUrl);
      return fullUrl;
    }
    
    if (imagePath.includes('uploads/')) {
      const fullUrl = `${BASE_URL}/${imagePath}`;
      console.log('Constructed URL with uploads:', fullUrl);
      return fullUrl;
    }
    
    const fallbackUrl = `${BASE_URL}/uploads/vehicles/${imagePath}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed': return '#007AFF';
      case 'completed': return '#28A745';
      case 'cancelled': return '#DC3545';
      case 'pending': return '#FF9500';
      default: return '#6C757D';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'paid': return '#28A745';
      case 'pending': return '#FF9500';
      default: return '#6C757D';
    }
  };

  const calculateDuration = (pickup?: string, dropoff?: string) => {
    if (!pickup || !dropoff) return 0;
    const pickupDate = new Date(pickup);
    const dropoffDate = new Date(dropoff);
    const diffTime = Math.abs(dropoffDate.getTime() - pickupDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusCounts = () => {
    const active = bookings.filter(booking => {
      const status = booking.bookingStatus || '';
      return status && (
        status.toLowerCase() === 'active' || 
        status.toLowerCase() === 'confirmed'
      );
    }).length;
    const completed = bookings.filter(booking => {
      const status = booking.bookingStatus || '';
      return status && status.toLowerCase() === 'completed';
    }).length;
    const cancelled = bookings.filter(booking => {
      const status = booking.bookingStatus || '';
      return status && status.toLowerCase() === 'cancelled';
    }).length;
    const total = bookings.length;

    return { active, completed, cancelled, total };
  };

  const filteredBookings = (() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const searchLower = searchTerm.toLowerCase();
        return (
          booking.vehicle?.vehicleName?.toLowerCase().includes(searchLower) ||
          booking.vehicle?.brand?.toLowerCase().includes(searchLower) ||
          booking.vehicle?.model?.toLowerCase().includes(searchLower) ||
          booking.pickupLocation?.toLowerCase().includes(searchLower) ||
          booking.dropoffLocation?.toLowerCase().includes(searchLower) ||
          booking.owner?.firstName?.toLowerCase().includes(searchLower) ||
          booking.owner?.lastName?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by status tab
    if (selectedTab !== 'All Bookings') {
      filtered = filtered.filter(booking => {
        const status = booking.bookingStatus || '';
        if (selectedTab === 'Active') {
          return status.toLowerCase() === 'active' || status.toLowerCase() === 'confirmed';
        }
        return status.toLowerCase() === selectedTab.toLowerCase();
      });
    }

    // Filter by payment status
    if (paymentFilter !== 'All Payments') {
      filtered = filtered.filter(booking => {
        const paymentStatus = booking.paymentStatus || '';
        return paymentStatus.toLowerCase() === paymentFilter.toLowerCase();
      });
    }

    // Filter by date range
    if (dateFilter !== 'All Time') {
      const now = new Date();
      filtered = filtered.filter(booking => {
        if (!booking.createdAt) return false;
        const bookingDate = new Date(booking.createdAt);
        const diffTime = now.getTime() - bookingDate.getTime();
        
        switch (dateFilter) {
          case 'Last Week':
            return diffTime <= 7 * 24 * 60 * 60 * 1000;
          case 'Last Month':
            return diffTime <= 30 * 24 * 60 * 60 * 1000;
          case 'Last Year':
            return diffTime <= 365 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    }

    return filtered;
  })();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2471F2" />
          <Text style={styles.loadingText}>Loading your booking history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC3545" />
          <Text style={styles.errorTitle}>Error Loading Rental History</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRentalHistory}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Booking History</Text>
          <Text style={styles.headerSubtitle}>
            Your complete rental transaction history
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rentals..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#8E8E93"
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={20} color="#2471F2" />
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Payment Status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                {PAYMENT_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      paymentFilter === filter && styles.activeFilterChip
                    ]}
                    onPress={() => setPaymentFilter(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      paymentFilter === filter && styles.activeFilterChipText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Date Range:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                {DATE_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      dateFilter === filter && styles.activeFilterChip
                    ]}
                    onPress={() => setDateFilter(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      dateFilter === filter && styles.activeFilterChipText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statusCounts.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statusCounts.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statusCounts.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statusCounts.cancelled}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
        </View>

        {/* Booking History */}
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#9CA3AF" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Booking History</Text>
            <Text style={styles.emptyText}>
              You haven't made any bookings yet. Start exploring and book your first ride!
            </Text>
          </View>
        ) : (
          <View>
            {filteredBookings.map((item) => (
              <View key={item._id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Image
                    source={{ 
                      uri: constructImageUrl(item.vehicle?.images?.[0] || '') || 'https://via.placeholder.com/150'
                    }}
                    style={styles.vehicleImage}
                    resizeMode="cover"
                  />
                  <View style={styles.bookingInfo}>
                    <Text style={styles.vehicleName}>
                      {item.vehicle?.brand || 'Unknown'} {item.vehicle?.model || 'Vehicle'}
                    </Text>
                    <Text style={styles.vehicleDetails}>
                      {item.vehicle?.year || 'N/A'} • {item.vehicle?.transmission || 'Auto'}
                    </Text>
                    <Text style={styles.bookingId}>
                      #{item._id?.slice(-8) || 'N/A'}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.bookingStatus || 'pending') }
                  ]}>
                    <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                      {item.bookingStatus || 'pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Pickup Date:</Text>
                    <Text style={styles.detailValue}>
                      {item.pickupDate ? formatDate(item.pickupDate) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Return Date:</Text>
                    <Text style={styles.detailValue}>
                      {item.dropoffDate ? formatDate(item.dropoffDate) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>
                      {calculateDuration(item.pickupDate, item.dropoffDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Status:</Text>
                    <View style={[
                      styles.paymentBadge,
                      { backgroundColor: getPaymentStatusColor(item.paymentStatus || 'pending') }
                    ]}>
                      <Text style={[styles.paymentText, { color: '#FFFFFF' }]}>
                        {item.paymentStatus || 'pending'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>
                      ${item.totalAmount || '0'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2471F2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#2471F2',
    borderColor: '#2471F2',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
  },
  bookingInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  bookingId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    padding: 16,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 