import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ArrowLeft, 
  Star,
  User,
  Calendar,
  Plus,
  Send,
  Loader,
  Car,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { reviewService, BackendReview } from '../services/reviewService';
import { useUserStore } from '../stores/userStore';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  carName: string;
  vehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: string;
    image?: string;
  };
}

// Helper function to convert backend review to frontend format
const mapBackendReviewToReview = (backendReview: BackendReview): Review => {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || '';
  
  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) return undefined;
    const imagePath = images[0];
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${BASE_URL}${imagePath}`;
    return `${BASE_URL}/uploads/vehicles/${imagePath}`;
  };

  const getUserAvatarUrl = (photo?: string) => {
    if (!photo) return undefined;
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/uploads')) return `${BASE_URL}${photo}`;
    return `${BASE_URL}/uploads/customerProfiles/${photo}`;
  };

  return {
    id: backendReview._id,
    userName: `${backendReview.customer.firstName} ${backendReview.customer.lastName}`,
    userAvatar: getUserAvatarUrl(backendReview.customer.photo),
    rating: backendReview.rating,
    comment: backendReview.comment,
    date: backendReview.createdAt.split('T')[0],
    carName: backendReview.vehicle?.vehicleName || `${backendReview.vehicle?.brand} ${backendReview.vehicle?.model}`,
    vehicle: backendReview.vehicle ? {
      id: backendReview.vehicle._id,
      name: backendReview.vehicle.vehicleName,
      brand: backendReview.vehicle.brand,
      model: backendReview.vehicle.model,
      year: backendReview.vehicle.year,
      image: getImageUrl(backendReview.vehicle.images),
    } : undefined,
  };
};

export default function ReviewsScreen() {
  const { user } = useUserStore();
  const params = useLocalSearchParams();
  
  // Check if we're coming from a booking completion
  const isBookingReview = params.addReview === 'true';
  const bookingId = params.bookingId as string;
  const vehicleId = params.vehicleId as string;
  const carName = params.carName as string;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddReview, setShowAddReview] = useState(isBookingReview);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    carName: carName || '',
    vehicleId: vehicleId || '',
    bookingId: bookingId || '',
  });

  const scaleValue = useSharedValue(1);

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const backendReviews = await reviewService.getAllReviews();
      const mappedReviews = backendReviews.map(mapBackendReviewToReview);
      setReviews(mappedReviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Retry function for failed requests
  const handleRetry = () => {
    fetchReviews();
  };

  const handleAddReview = async () => {
    if (!newReview.comment.trim() || !newReview.vehicleId.trim()) {
      Alert.alert('Error', 'Please fill in all fields and select a vehicle');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to add a review');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get the stored token
      const token = await AsyncStorage.getItem('customerToken');
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      const reviewData = {
        vehicle: newReview.vehicleId,
        rating: newReview.rating,
        comment: newReview.comment,
        ...(newReview.bookingId && { booking: newReview.bookingId }),
      };

      // Use booking-specific review API if we have a booking ID
      const createdReview = newReview.bookingId 
        ? await reviewService.createBookingReview(newReview.bookingId, reviewData, token)
        : await reviewService.createReview(reviewData, token);
        
      const mappedReview = mapBackendReviewToReview(createdReview);

      setReviews([mappedReview, ...reviews]);
      setNewReview({ rating: 5, comment: '', carName: '', vehicleId: '', bookingId: '' });
      setShowAddReview(false);
      Alert.alert('Success', 'Your review has been added!');
      
      // If this was a booking review, navigate back to bookings
      if (newReview.bookingId) {
        setTimeout(() => {
          router.push('/bookings');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error adding review:', error);
      Alert.alert('Error', error.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setNewReview({ ...newReview, rating: star })}
          >
            <Star
              size={size}
              color={star <= rating ? "#FFD700" : "#E0E0E0"}
              fill={star <= rating ? "#FFD700" : "none"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <User size={20} color="#007AFF" />
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <View style={styles.reviewMeta}>
              <Calendar size={12} color="#8E8E93" />
              <Text style={styles.reviewDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>{item.rating}.0</Text>
        </View>
      </View>
      
      <Text style={styles.carName}>{item.carName}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </Animated.View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            if (!user) {
              Alert.alert('Login Required', 'Please log in to add a review', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/auth/login') }
              ]);
              return;
            }
            setShowAddReview(!showAddReview);
          }}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Review Form */}
      {showAddReview && (
        <Animated.View style={styles.addReviewContainer} entering={FadeIn}>
          <Text style={styles.addReviewTitle}>Add Your Review</Text>
          
          {user ? (
            <>
              {isBookingReview && bookingId ? (
                <>
                  <View style={styles.bookingContext}>
                    <Car size={20} color="#007AFF" />
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingTitle}>Reviewing Your Rental</Text>
                      <Text style={styles.bookingSubtitle}>
                        {carName || 'Recent rental vehicle'}
                      </Text>
                      <Text style={styles.bookingId}>Booking ID: #{bookingId}</Text>
                    </View>
                  </View>
                  <Text style={styles.helpText}>
                    Share your experience with this completed rental
                  </Text>
                </>
              ) : (
                <Text style={styles.helpText}>
                  Share your experience with a vehicle you've rented
                </Text>
              )}
              
              {!isBookingReview && (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Vehicle ID (required)"
                      value={newReview.vehicleId}
                      onChangeText={(text) => setNewReview({ ...newReview, vehicleId: text })}
                      placeholderTextColor="#8E8E93"
                    />
                    <Text style={styles.fieldHint}>
                      Enter the ID of the vehicle you want to review
                    </Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Car name (optional)"
                      value={newReview.carName}
                      onChangeText={(text) => setNewReview({ ...newReview, carName: text })}
                      placeholderTextColor="#8E8E93"
                    />
                  </View>
                </>
              )}

              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                {renderStars(newReview.rating, 24, true)}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write your review..."
                  value={newReview.comment}
                  onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#8E8E93"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleAddReview}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={submitting}
              >
                <Animated.View style={[styles.submitButtonContent, animatedStyle]}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Send size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.submitButtonText}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.authPrompt}>
              <Text style={styles.authPromptText}>
                Please log in to add a review
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={styles.loginButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}

      {/* Reviews List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading reviews...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Unable to load reviews</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{reviews.length}</Text>
                <Text style={styles.statLabel}>Total Reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </Text>
                <Text style={styles.statLabel}>Average Rating</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.starsContainer}>
                  {renderStars(reviews.length > 0 
                    ? Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                    : 0
                  )}
                </View>
                <Text style={styles.statLabel}>Overall</Text>
              </View>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No reviews yet</Text>
                <Text style={styles.emptyMessage}>
                  Be the first to share your experience!
                </Text>
              </View>
            ) : (
              <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.reviewsList}
              />
            )}
          </>
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
    justifyContent: 'space-between',
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addReviewContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addReviewTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 4,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
  },
  carName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  authPrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  authPromptText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  bookingContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  bookingDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  bookingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
});