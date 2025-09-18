import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Car,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Fuel,
  Settings,
  Image as ImageIcon,
  Plus,
  X,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

export default function AddCarScreen() {
  const { user, addCar } = useUserStore();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [pricePerKm, setPricePerKm] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [seats, setSeats] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [withDriver, setWithDriver] = useState(false);
  const [driverIncluded, setDriverIncluded] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scaleValue = useSharedValue(1);

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const handleSubmit = async () => {
    if (!make || !model || !year || !pricePerDay || !location || !fuel || !transmission || !seats) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newCar = {
        id: Date.now().toString(),
        ownerId: user!.id,
        make,
        model,
        year: parseInt(year),
        image: imageUrl || 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        pricePerDay: parseFloat(pricePerDay),
        pricePerKm: pricePerKm ? parseFloat(pricePerKm) : undefined,
        location,
        available: true,
        unavailableDates: [],
        features,
        withDriver,
        driverIncluded,
        rating: 4.5,
        reviews: 0,
        fuel,
        transmission,
        seats: parseInt(seats),
        description,
        contactPhone,
        contactEmail,
      };

      addCar(newCar);
      setIsLoading(false);

      Alert.alert(
        'Success!',
        'Your car has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/dashboard'),
          },
        ]
      );
    }, 1000);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Car</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={styles.formContainer} entering={FadeIn.delay(200)}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputContainer}>
              <Car size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Make (e.g., Toyota) *"
                value={make}
                onChangeText={setMake}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Car size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Model (e.g., Camry) *"
                value={model}
                onChangeText={setModel}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Calendar size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Year (e.g., 2023) *"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <ImageIcon size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>

            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Price per day *"
                value={pricePerDay}
                onChangeText={setPricePerDay}
                keyboardType="numeric"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Price per km (optional)"
                value={pricePerKm}
                onChangeText={setPricePerKm}
                keyboardType="numeric"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Location & Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Description</Text>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Location *"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>

            <View style={styles.inputContainer}>
              <Fuel size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Fuel Type (e.g., Gasoline) *"
                value={fuel}
                onChangeText={setFuel}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Settings size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Transmission (e.g., Automatic) *"
                value={transmission}
                onChangeText={setTransmission}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Users size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Number of seats *"
                value={seats}
                onChangeText={setSeats}
                keyboardType="numeric"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Driver Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Options</Text>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available with driver</Text>
              <Switch
                value={withDriver}
                onValueChange={setWithDriver}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {withDriver && (
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Driver included in price</Text>
                <Switch
                  value={driverIncluded}
                  onValueChange={setDriverIncluded}
                  trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>

            <View style={styles.featureInputContainer}>
              <TextInput
                style={styles.featureInput}
                placeholder="Add feature (e.g., AC, GPS)"
                value={newFeature}
                onChangeText={setNewFeature}
                placeholderTextColor="#8E8E93"
              />
              <TouchableOpacity style={styles.addFeatureButton} onPress={handleAddFeature}>
                <Plus size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFeature(feature)}>
                    <X size={16} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contact Phone"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contact Email"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View style={styles.bottomActions} entering={FadeIn.delay(400)}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={animatedStyle}>
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Adding Car...' : 'Add Car'}
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
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  featureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  addFeatureButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginRight: 6,
  },
  bottomActions: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});