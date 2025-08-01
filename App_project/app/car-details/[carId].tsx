import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Fuel, 
  Users, 
  Settings, 
  Calendar,
  Phone,
  Mail,
  Heart,
  Share,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function CarDetailsScreen() {
  const { carId } = useLocalSearchParams();
  const { allCars, user } = useUserStore();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const car = allCars.find(c => c.id === carId);
  const scaleValue = useSharedValue(1);

  if (!car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Car not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleBookNow = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    router.push({
      pathname: '/booking/[carId]',
      params: { carId: car.id },
    });
  };

  const handleContact = (type: 'phone' | 'email') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (type === 'phone') {
      Linking.openURL(`tel:${car.contactPhone}`);
    } else {
      Linking.openURL(`mailto:${car.contactEmail}`);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    // In a real app, you would use react-native-share
    console.log('Share car:', car.make, car.model);
  };

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

  const FeatureItem = ({ icon: Icon, text }: any) => (
    <View style={styles.featureItem}>
      <Icon size={16} color="#007AFF" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleFavorite}>
              <Heart 
                size={24} 
                color={isFavorited ? "#F44336" : "#1D1D1F"}
                fill={isFavorited ? "#F44336" : "none"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share size={24} color="#1D1D1F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Car Image */}
        <Animated.View entering={FadeIn} style={styles.imageContainer}>
          <Image source={{ uri: car.image }} style={styles.carImage} />
        </Animated.View>

        {/* Car Info */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.infoContainer}>
          <View style={styles.carHeader}>
            <View style={styles.carTitleContainer}>
              <Text style={styles.carName}>{car.make} {car.model}</Text>
              <Text style={styles.carYear}>{car.year}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={20} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{car.rating}</Text>
              <Text style={styles.reviewsText}>({car.reviews} reviews)</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#8E8E93" />
            <Text style={styles.locationText}>{car.location}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${car.pricePerDay}</Text>
            <Text style={styles.priceUnit}>/day</Text>
            {car.pricePerKm && (
              <Text style={styles.pricePerKm}>or ${car.pricePerKm}/km</Text>
            )}
          </View>

          {/* Car Specifications */}
          <View style={styles.specsContainer}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Users size={20} color="#007AFF" />
                <Text style={styles.specText}>{car.seats} Seats</Text>
              </View>
              <View style={styles.specItem}>
                <Fuel size={20} color="#007AFF" />
                <Text style={styles.specText}>{car.fuel}</Text>
              </View>
              <View style={styles.specItem}>
                <Settings size={20} color="#007AFF" />
                <Text style={styles.specText}>{car.transmission}</Text>
              </View>
              <View style={styles.specItem}>
                <Calendar size={20} color="#007AFF" />
                <Text style={styles.specText}>
                  {car.available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {car.features.map((feature, index) => (
                <FeatureItem key={index} icon={Star} text={feature} />
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{car.description}</Text>
          </View>

          {/* Driver Option */}
          <View style={styles.driverContainer}>
            <Text style={styles.sectionTitle}>Driver Option</Text>
            <View style={styles.driverInfo}>
              <Text style={styles.driverText}>
                {car.driverIncluded 
                  ? 'Driver included in the price' 
                  : car.withDriver 
                    ? 'Driver available (additional cost)' 
                    : 'Self-drive only'
                }
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          {user && (
            <View style={styles.contactContainer}>
              <Text style={styles.sectionTitle}>Contact Owner</Text>
              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact('phone')}
                >
                  <Phone size={18} color="#007AFF" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact('email')}
                >
                  <Mail size={18} color="#007AFF" />
                  <Text style={styles.contactButtonText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View 
        entering={FadeIn.delay(400)} 
        style={styles.bottomActions}
      >
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={animatedStyle}>
            <Text style={styles.bookButtonText}>
              {user ? 'Book Now' : 'Login to Book'}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: width,
    height: 300,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  carTitleContainer: {
    flex: 1,
  },
  carName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  carYear: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
  },
  priceUnit: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginLeft: 4,
  },
  pricePerKm: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  specsContainer: {
    marginBottom: 24,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  specText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  driverContainer: {
    marginBottom: 24,
  },
  driverInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  driverText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  contactContainer: {
    marginBottom: 24,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    marginLeft: 8,
  },
  bottomActions: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});