import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Star, MapPin, Fuel, Users, Settings2 } from 'lucide-react-native';
import { Car, useUserStore } from '@/stores/userStore';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native-paper';

export default function SearchScreen() {
  const { fetchAllVehicles, getVehicleLocations } = useUserStore();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.query as string) || '');
  const [selectedLocation, setSelectedLocation] = useState((params.location as string) || '');
  const [selectedCategory, setSelectedCategory] = useState((params.category as string) || '');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  const filterScale = useSharedValue(0);

  useEffect(() => {
    loadVehicles();
    loadLocations();
  }, [])

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const cars = await fetchAllVehicles();
      setFilteredCars(cars);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const locationsList = await getVehicleLocations();
      setLocations(locationsList);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedLocation, selectedCategory, priceRange]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let results = [];
      
      if (searchQuery) {
        results = await searchVehicles(searchQuery);
      } else {
        results = await fetchAllVehicles();
      }
      
      // Apply additional client-side filters
      if (selectedLocation) {
        results = results.filter((car: Car) =>
          car.location.toLowerCase().includes(selectedLocation.toLowerCase())
        );
      }
      
      if (selectedCategory) {
        results = results.filter((car: Car) => {
          const category = selectedCategory.toLowerCase();
          switch (category) {
            case 'sedan':
              return car.make.toLowerCase().includes('toyota') || car.make.toLowerCase().includes('honda');
            case 'suv':
              return car.model.toLowerCase().includes('suv') || car.model.toLowerCase().includes('crossover');
            case 'luxury':
              return car.make.toLowerCase().includes('bmw') || car.make.toLowerCase().includes('mercedes') ||
                car.pricePerDay > 100;
            case 'electric':
              return car.fuel?.toLowerCase().includes('electric');
            default:
              return true;
          }
        });
      }
      
      if (priceRange.min > 0 || priceRange.max < 500) {
        results = results.filter(car =>
          car.pricePerDay >= priceRange.min && car.pricePerDay <= priceRange.max
        );
      }
      
      setFilteredCars(results);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = filteredCars;

    if (searchQuery) {
      filtered = filtered.filter(car =>
        car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(car =>
        car.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((car) => {
        switch (selectedCategory.toLowerCase()) {
          case 'sedan':
            return car.make.toLowerCase().includes('toyota') || car.make.toLowerCase().includes('honda');
          case 'suv':
            return car.model.toLowerCase().includes('cr-v') || car.model.toLowerCase().includes('x3');
          case 'luxury':
            return car.make.toLowerCase().includes('bmw') || car.pricePerDay > 100;
          case 'electric':
            return car.fuel === 'Electric';
          default:
            return true;
        }
      });
    }

    filtered = filtered.filter(car =>
      car.pricePerDay >= priceRange.min && car.pricePerDay <= priceRange.max
    );

    setFilteredCars(filtered);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    filterScale.value = showFilters ? withSpring(0) : withSpring(1);
  };

  const handleCarPress = (carId: string) => {
    router.push({
      pathname: '/car-details/[carId]',
      params: { carId },
    });
  };

  const filterAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filterScale.value * 120,
      opacity: filterScale.value,
    };
  });

  const renderCarCard = ({ item }: { item: typeof filteredCars[0] }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.carCard}>
      <TouchableOpacity
        onPress={() => handleCarPress(item.id)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.carImage} />
        <View style={styles.carInfo}>
          <View style={styles.carHeader}>
            <Text style={styles.carName}>{item.make} {item.model}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          
          <View style={styles.carDetails}>
            <View style={styles.detailItem}>
              <MapPin size={14} color="#8E8E93" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Fuel size={14} color="#8E8E93" />
              <Text style={styles.detailText}>{item.fuel}</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={14} color="#8E8E93" />
              <Text style={styles.detailText}>{item.seats} seats</Text>
            </View>
          </View>
          
          <View style={styles.carFooter}>
            <Text style={styles.carPrice}>${item.pricePerDay}/day</Text>
            <View style={styles.availabilityBadge}>
              <Text style={styles.availabilityText}>Available</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Cars</Text>
        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Filter size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Filters */}
      <Animated.View style={[styles.filtersContainer, filterAnimatedStyle]}>
        <View style={styles.filterRow}>
          <TextInput
            style={styles.filterInput}
            placeholder="Location"
            value={selectedLocation}
            onChangeText={setSelectedLocation}
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Category"
            value={selectedCategory}
            onChangeText={setSelectedCategory}
            placeholderTextColor="#8E8E93"
          />
        </View>
        <View style={styles.priceRangeContainer}>
          <Text style={styles.priceRangeLabel}>Price Range: ${priceRange.min} - ${priceRange.max}</Text>
        </View>
      </Animated.View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {loading ? 'Searching...' : `${filteredCars.length} cars found`}
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={filteredCars}
            renderItem={renderCarCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.carsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cars found</Text>
              </View>
            }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  priceRangeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priceRangeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  resultsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginBottom: 16,
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
    marginBottom: 8,
  },
  carName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  carDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
  },
  availabilityBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
});