import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Star,
  User,
  Calendar,
  Plus,
  Send,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  carName: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'John Smith',
    rating: 5,
    comment: 'Excellent service! The car was clean and well-maintained. The owner was very responsive and helpful.',
    date: '2024-01-15',
    carName: 'Toyota Camry',
  },
  {
    id: '2',
    userName: 'Sarah Johnson',
    rating: 4,
    comment: 'Great experience overall. The car performed well during our trip. Would definitely rent again.',
    date: '2024-01-10',
    carName: 'Honda CR-V',
  },
  {
    id: '3',
    userName: 'Mike Wilson',
    rating: 5,
    comment: 'Amazing luxury car! Perfect for our special occasion. The owner was professional and accommodating.',
    date: '2024-01-05',
    carName: 'BMW X3',
  },
];

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    carName: '',
  });

  const scaleValue = useSharedValue(1);

  const handleAddReview = () => {
    if (!newReview.comment.trim() || !newReview.carName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userName: 'You',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      carName: newReview.carName,
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: '', carName: '' });
    setShowAddReview(false);
    Alert.alert('Success', 'Your review has been added!');
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
          onPress={() => setShowAddReview(!showAddReview)}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Review Form */}
      {showAddReview && (
        <Animated.View style={styles.addReviewContainer} entering={FadeIn}>
          <Text style={styles.addReviewTitle}>Add Your Review</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Car name"
              value={newReview.carName}
              onChangeText={(text) => setNewReview({ ...newReview, carName: text })}
              placeholderTextColor="#8E8E93"
            />
          </View>

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
            style={styles.submitButton}
            onPress={handleAddReview}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View style={[styles.submitButtonContent, animatedStyle]}>
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Reviews List */}
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Total Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.starsContainer}>
              {renderStars(Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length))}
            </View>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>

        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reviewsList}
        />
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
});