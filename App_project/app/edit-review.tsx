import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Save, Car } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reviewService } from '../services/reviewService';

export default function EditReviewScreen() {
  const params = useLocalSearchParams();
  const reviewId = params.reviewId as string;
  const initialRating = parseInt(params.rating as string) || 5;
  const initialComment = params.comment as string || '';
  const carName = params.carName as string || '';
  const vehicleId = params.vehicleId as string || '';

  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleValue = useSharedValue(1);

  const renderStars = (currentRating: number, interactive: boolean = true) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => {
              if (interactive) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRating(star);
              }
            }}
            style={styles.starButton}
          >
            <Star
              size={36}
              color={star <= currentRating ? "#FFD700" : "#E0E0E0"}
              fill={star <= currentRating ? "#FFD700" : "none"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSave = async () => {
    console.log('🔄 Starting save process...');
    console.log('📝 Current comment:', comment);
    console.log('⭐ Current rating:', rating);
    console.log('📄 Initial comment:', initialComment);
    console.log('⭐ Initial rating:', initialRating);
    console.log('🆔 Review ID:', reviewId);

    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment for your review');
      return;
    }

    if (comment.trim() === initialComment && rating === initialRating) {
      Alert.alert('No Changes', 'No changes were made to your review');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const token = await AsyncStorage.getItem('customerToken');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      console.log('📡 Making API call to update review...');
      const result = await reviewService.updateReview(
        reviewId,
        {
          rating: rating,
          comment: comment.trim(),
        },
        token
      );

      console.log('✅ API call successful:', result);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your review has been updated!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error updating review:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (comment.trim() !== initialComment || rating !== initialRating) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive', 
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <ArrowLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Review</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Info */}
        <Animated.View style={styles.vehicleCard} entering={FadeIn.delay(100)}>
          <View style={styles.vehicleInfo}>
            <Car size={24} color="#007AFF" />
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleTitle}>Reviewing</Text>
              <Text style={styles.vehicleName}>{carName}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Rating Section */}
        <Animated.View style={styles.section} entering={FadeIn.delay(200)}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <Text style={styles.sectionSubtitle}>
            How would you rate your experience?
          </Text>
          {renderStars(rating, true)}
          <Text style={styles.ratingText}>{rating} out of 5 stars</Text>
        </Animated.View>

        {/* Comment Section */}
        <Animated.View style={styles.section} entering={FadeIn.delay(300)}>
          <View style={styles.commentHeader}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <Text style={styles.characterCount}>
              {comment.length}/500
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Share your experience with other customers
          </Text>
          <TextInput
            style={[
              styles.commentInput,
              comment.length > 450 && styles.commentInputWarning
            ]}
            value={comment}
            onChangeText={(text) => setComment(text.slice(0, 500))}
            placeholder="Write your detailed review here..."
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View style={styles.bottomContainer} entering={FadeIn.delay(400)}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSave}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isSubmitting}
          activeOpacity={0.9}
        >
          <Animated.View style={[styles.saveButtonContent, animatedStyle]}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  vehicleCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleDetails: {
    marginLeft: 12,
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 2,
  },
  vehicleName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    textAlign: 'center',
    marginTop: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  characterCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  commentInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  commentInputWarning: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF9F0',
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
    shadowOpacity: 0,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});