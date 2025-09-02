import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Fuel,
  Users,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

export default function SearchScreen() {
  const { allCars } = useUserStore();
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState((params.query as string) || '');
  const [selectedLocation, setSelectedLocation] = useState((params.location as string) || '');
  const [selectedCategory, setSelectedCategory] = useState((params.category as string) || '');
  const [availability, setAvailability] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCars, setFilteredCars] = useState(allCars);

  const filterScale = useSharedValue(0);

  useEffect(() => {
    filterCars();
  }, [searchQuery, selectedLocation, selectedCategory, availability, priceRange]);

  const filterCars = () => {
    let filtered = allCars;

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
      filtered = filtered.filter(car => {
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

    const min = parseFloat(priceRange.min);
    const max = parseFloat(priceRange.max);

    if (!isNaN(min)) {
      filtered = filtered.filter(car => car.pricePerDay >= min);
    }

    if (!isNaN(max)) {
      filtered = filtered.filter(car => car.pricePerDay <= max);
    }

    if (availability.toLowerCase() === 'available') {
      filtered = filtered.filter(car => car.available === true);
    } else if (availability.toLowerCase() === 'unavailable') {
      filtered = filtered.filter(car => car.available === false);
    }

    setFilteredCars(filtered);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    filterScale.value = showFilters ? withSpring(0) : withSpring(1);
  };

  const handleCarPress = (carId: string) => {
    router.push({
      pathname: '/car-details',
      params: { carId },
    });
  };

  const filterAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filterScale.value * 300,
      opacity: filterScale.value,
    };
  });

  const renderCarCard = ({ item }: { item: typeof allCars[0] }) => (
    <Animated.View entering={FadeIn.delay(100)} style={styles.carCard}>
      <TouchableOpacity onPress={() => handleCarPress(item.id)} activeOpacity={0.9}>
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
              <Text style={[
                styles.availabilityText,
                !item.available && styles.unavailableText
              ]}>
                {item.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Cars</Text>
        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Filter size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

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

      <Animated.View style={[styles.filtersContainer, filterAnimatedStyle]}>
        <TextInput
          style={styles.filterInput}
          placeholder="Enter Location"
          value={selectedLocation}
          onChangeText={setSelectedLocation}
          placeholderTextColor="#8E8E93"
        />

        <TextInput
          style={styles.filterInput}
          placeholder="Vehicle Type (sedan, suv, luxury, electric)"
          value={selectedCategory}
          onChangeText={setSelectedCategory}
          placeholderTextColor="#8E8E93"
        />

        <TextInput
          style={styles.filterInput}
          placeholder="Availability (All / Available / Unavailable)"
          value={availability}
          onChangeText={setAvailability}
          placeholderTextColor="#8E8E93"
        />

        <View style={styles.priceInputs}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min Price"
            keyboardType="numeric"
            value={priceRange.min}
            onChangeText={(val) => setPriceRange({ ...priceRange, min: val })}
          />
          <TextInput
            style={styles.priceInput}
            placeholder="Max Price"
            keyboardType="numeric"
            value={priceRange.max}
            onChangeText={(val) => setPriceRange({ ...priceRange, max: val })}
          />
        </View>
      </Animated.View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredCars.length} cars found</Text>
        <FlatList
          data={filteredCars}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.carsList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
  searchContainer: { paddingHorizontal: 20, marginTop: 10 },
  searchBar: {
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 12,
    overflow: 'hidden',
  },
  filterInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D1D1F',
    marginBottom: 10,
  },
  priceInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D1D1F',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
  },
  carsList: { paddingBottom: 30 },
  carCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  carImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  carInfo: { padding: 16 },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginLeft: 4,
  },
  carDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '600',
    color: '#4CAF50',
  },
  unavailableText: {
    color: '#FF3B30',
  },
});
