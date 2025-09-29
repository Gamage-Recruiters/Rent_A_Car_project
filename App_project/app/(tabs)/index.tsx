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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  MapPin,
  Calendar,
  Star,
  ChevronRight,
  Car,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { allCars, user, initializeStore } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

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
    return user.email?.split('@')[0] || 'there';
  };

  const time = getTimeOfDay();

  const handleSearch = () => {
    router.push({
      pathname: '/search',
      params: {
        query: searchQuery,
        location: selectedLocation,
        date: selectedDate,
      },
    });
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
        <View style={styles.featuredCarInfo}>
          <Text style={styles.featuredCarName}>
            {item.make} {item.model}
          </Text>
          <View style={styles.featuredCarRating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.featuredCarRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.featuredCarPrice}>${item.pricePerDay}/day</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPopularCar = ({ item }: { item: (typeof allCars)[0] }) => (
    <TouchableOpacity
      style={styles.popularCarCard}
      onPress={() => handleCarPress(item.id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.popularCarImage} />
      <View style={styles.popularCarInfo}>
        <Text style={styles.popularCarName}>
          {item.make} {item.model}
        </Text>
        <Text style={styles.popularCarLocation}>{item.location}</Text>
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
        <Animated.View style={[styles.header, animatedStyle]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Good {time},{' '}
              {user ? (
                <Text style={styles.username}>{getUserDisplayName(user)}</Text>
              ) : (
                'there'
              )}
            </Text>
            <Text style={styles.subtitle}>Find your perfect ride</Text>
          </View>
          <View style={styles.headerIcon}>
            <Car size={32} color="#007AFF" />
          </View>
        </Animated.View>

        {/* Search Section */}
        <View style={styles.searchBarContainer}>
          <Search size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search vehicles"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>The Best Platform for Car Rental</Text>
          <Text style={styles.promoSubtitle}>
            Ease of doing a car rental safely and reliably. Of course at a low price.
          </Text>
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Rental Car</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.png' }}
            style={styles.promoImage}
            resizeMode="contain"
          />
        </View>

        {/* Featured Cars */}
        <Animated.View style={[styles.section, animatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Cars</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={allCars.slice(0, 3)}
            renderItem={renderFeaturedCar}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredCarsList}
            keyExtractor={(item) => item.id}
          />
        </Animated.View>

        {/* Popular Cars */}
        <Animated.View style={[styles.section, animatedStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Cars</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={allCars.slice(0, 4)}
            renderItem={renderPopularCar}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.popularCarsList}
            keyExtractor={(item) => item.id}
          />
        </Animated.View>

        {/* Categories */}
        <Animated.View style={[styles.section, animatedStyle]}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesContainer}>
            {['Sedan', 'SUV', 'Luxury', 'Electric'].map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryCard}
                onPress={() =>
                  router.push({ pathname: '/search', params: { category } })
                }
              >
                <Text style={styles.categoryText}>{category}</Text>
                <ChevronRight size={16} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
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
    fontSize: 24, 
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginTop: 5
  },
  username: {
    fontSize: 20, 
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
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  filterInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  featuredCarsList: {
    paddingRight: 20,
  },
  featuredCarCard: {
    width: width * 0.7,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  featuredCarInfo: {
    alignItems: 'flex-start',
  },
  featuredCarName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredCarRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  },
  popularCarImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  popularCarInfo: {
    padding: 12,
  },
  popularCarName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  popularCarLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 8,
  },
  popularCarDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularCarRating: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  promoBanner: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#007AFF10',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  promoTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5E5E5E',
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  promoImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 120,
    height: 60,
  },

});
