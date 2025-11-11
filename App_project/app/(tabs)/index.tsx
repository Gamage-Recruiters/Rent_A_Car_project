import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  MapPin,
  Calendar,
  Star,
  ChevronRight,
  Car,
  Truck,
  Zap,
  Crown,
  Gift,
  HelpCircle,
  MessageSquare,
  Heart,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import FavoriteButton from '@/components/FavoriteButton';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { allCars, user, initializeStore } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const animatedValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    initializeStore();
    animatedValue.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value,
      transform: [
        {
          translateY: interpolate(animatedValue.value, [0, 1], [50, 0]),
        },
      ],
    };
  });

  const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours >= 0 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 15) return 'afternoon';
    if (hours >= 15 && hours < 19) return 'evening';
    return "day isn't it";
  };

  type UserType = {
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  const getUserDisplayName = (user: UserType | undefined) => {
    if (!user) return '';
    
    // If firstName exists, use it (with lastName if available)
    if (user.firstName) {
      return user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.firstName;
    }
    
    // Fallback to email if no name is available
    const emailName = user.email?.split('@')[0] || 'there';
    // Make email username more presentable
    return emailName
      .replace(/[._]/g, ' ') // Replace dots and underscores with spaces
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
  };

  const time = getTimeOfDay();

  const handleSearch = () => {
    setIsLoading(true);
    router.push({
      pathname: '/search',
      params: {
        query: searchQuery,
        location: selectedLocation,
        date: selectedDate,
      },
    });
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleCarPress = (carId: string) => {
    scaleValue.value = withTiming(0.95, { duration: 100 }, () => {
      scaleValue.value = withSpring(1);
    });

    router.push({
      pathname: '/car-details/[carId]',
      params: { carId },
    });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'car':
        return <Car size={24} color="#007AFF" />;
      case 'truck':
        return <Truck size={24} color="#007AFF" />;
      case 'crown':
        return <Crown size={24} color="#007AFF" />;
      case 'zap':
        return <Zap size={24} color="#007AFF" />;
      default:
        return <Car size={24} color="#007AFF" />;
    }
  };

  const renderFeaturedCar = ({ item }: { item: (typeof allCars)[0] }) => (
    <TouchableOpacity
      style={styles.featuredCarCard}
      onPress={() => handleCarPress(item.id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.featuredCarImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.featuredCarGradient}
      >
        <Text style={styles.featuredCarName}>
          {item.make} {item.model}
        </Text>
        <View style={styles.featuredCarDetails}>
          <View style={styles.featuredCarRating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.featuredCarRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.featuredCarPrice}>${item.pricePerDay}/day</Text>
        </View>
      </LinearGradient>
      {/* Add FavoriteButton */}
    <View style={styles.featuredCarFavoriteButton}>
      <FavoriteButton carId={item.id} />
    </View>
    </TouchableOpacity>
  );

  const renderPopularCar = ({ item }: { item: (typeof allCars)[0] }) => (
    <TouchableOpacity
      style={styles.popularCarCard}
      onPress={() => handleCarPress(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.popularCarImageContainer}>
        <Image source={{ uri: item.image }} style={styles.popularCarImage} />
        {item.rating >= 4.5 && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>
        )}
        {/* Add FavoriteButton */}
        <View style={styles.popularCarFavoriteButton}>
          <FavoriteButton carId={item.id} />
        </View>
      </View>
      <View style={styles.popularCarInfo}>
        <Text style={styles.popularCarName} numberOfLines={1}>
          {item.make} {item.model}
        </Text>
        <View style={styles.popularCarLocationRow}>
          <MapPin size={12} color="#8E8E93" />
          <Text style={styles.popularCarLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.popularCarDetails}>
          <View style={styles.popularCarRating}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.popularCarRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.popularCarPrice}>${item.pricePerDay}/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={[styles.header, animatedStyle]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Good {time},{' '}
              {user ? (
                <Text style={styles.username}>{getUserDisplayName(user)}</Text>
              ) : (
                'there'
              )}!
            </Text>
            <Text style={styles.subtitle}>Find your perfect ride</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerIcon}
            //onPress={() => router.push('/notifications')}
          >
            <Car size={28} color="#007AFF" />
            {/* Notification badge - remove if not needed */}
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()} 
          style={styles.searchBarWrapper}
        >
          <View style={styles.searchBarContainer}>
            <Search size={18} color="#007AFF" />
            <TextInput
              style={styles.searchBarInput}
              placeholder="Search vehicles, brands, models..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
              <Text style={styles.filterButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Promo Banner */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()} 
          style={styles.promoBannerWrapper}
        >
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Premium Car Rental</Text>
              <Text style={styles.promoSubtitle}>
                Ease of doing a car rental safely and reliably. Of course at a low price.
              </Text>
              <TouchableOpacity 
                style={styles.promoButton}
                onPress={() => router.push('/about')}
              >
                <Text style={styles.promoButtonText}>Learn More</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.png' }}
              style={styles.promoImage}
              resizeMode="contain"
            />
          </LinearGradient>
        </Animated.View>

        {/* Featured Cars */}
        <Animated.View 
          entering={FadeInDown.delay(500).springify()} 
          style={[styles.section]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Featured Cars</Text>
              <View style={styles.sectionTitleIndicator} />
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={14} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={allCars.slice(0, 3)}
            renderItem={renderFeaturedCar}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredCarsList}
            keyExtractor={(item) => item.id}
            snapToInterval={width * 0.75 + 16}
            snapToAlignment="start"
            decelerationRate="fast"
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        </Animated.View>

        {/* Popular Cars */}
        <Animated.View 
          entering={FadeInDown.delay(600).springify()} 
          style={[styles.section]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Popular Cars</Text>
              <View style={styles.sectionTitleIndicator} />
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={14} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.popularCarsContainer}>
            {allCars.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.popularCarWrapper}>
                {renderPopularCar({item})}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View 
          entering={FadeInDown.delay(700).springify()} 
          style={[styles.section]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Browse by Category</Text>
              <View style={styles.sectionTitleIndicator} />
            </View>
          </View>
          <View style={styles.categoriesContainer}>
            {[
              { name: 'Sedan', icon: 'car' },
              { name: 'SUV', icon: 'truck' },
              { name: 'Luxury', icon: 'crown' },
              { name: 'Electric', icon: 'zap' }
            ].map((category, index) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryCard,
                  { backgroundColor: index % 2 === 0 ? '#E3F2FD' : '#FFF8E1' }
                ]}
                onPress={() =>
                  router.push({ pathname: '/search', params: { category: category.name } })
                }
              >
                <View style={[
                  styles.categoryIconContainer,
                  { backgroundColor: index % 2 === 0 ? '#BBDEFB' : '#FFECB3' }
                ]}>
                  {getCategoryIcon(category.icon)}
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInDown.delay(800).springify()}
          style={styles.quickActionsWrapper}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.quickActionsContainer}
          >
            <Text style={styles.quickActionsTitle}>Quick Access</Text>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/favorites')}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Heart size={24} color="#007AFF" />
                </View>
                <Text style={styles.quickActionLabel}>My Favorites</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/bookings')}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Calendar size={24} color="#4CAF50" />
                </View>
                <Text style={styles.quickActionLabel}>My Bookings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/reviews')}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Star size={24} color="#FF9800" />
                </View>
                <Text style={styles.quickActionLabel}>Reviews</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => router.push('/contact')}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#F3E5F5' }]}>
                  <MessageSquare size={24} color="#9C27B0" />
                </View>
                <Text style={styles.quickActionLabel}>Enquiry</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  filterButton: {
    backgroundColor: '#F0F0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  promoBannerWrapper: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  promoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContent: {
    flex: 1,
    padding: 20,
  },
  promoTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5E5E5E',
    marginBottom: 16,
    lineHeight: 20,
  },
  promoButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginRight: 4,
  },
  promoImage: {
    width: 140,
    height: 120,
    alignSelf: 'flex-end',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  sectionTitleIndicator: {
    width: 40,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginRight: 4,
  },
  featuredCarsList: {
    paddingRight: 20,
    paddingVertical: 8,
  },
  featuredCarCard: {
    width: width * 0.75,
    height: 220,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  featuredCarImage: {
    width: '100%',
    height: '100%',
  },
  featuredCarGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredCarName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredCarDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredCarRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredCarRatingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  featuredCarPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  popularCarsList: {
    paddingBottom: 20,
  },
  popularCarCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  popularCarImageContainer: {
    position: 'relative',
    height: 120,
  },
  popularCarImage: {
    width: '100%',
    height: '100%',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  popularCarInfo: {
    padding: 12,
  },
  popularCarName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  popularCarLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularCarLocation: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginLeft: 4,
    flex: 1,
  },
  popularCarDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularCarRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  popularCarRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  popularCarPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryCard: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  quickActionButtonPrimary: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginTop: 6,
  },
  quickActionTextPrimary: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  quickActionsWrapper: {
    marginHorizontal: 20,
    marginVertical: 32,
  },
  quickActionsContainer: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  featuredCarFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  
  popularCarFavoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  popularCarsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularCarWrapper: {
    width: '48%',
    marginBottom: 16,
  },
});