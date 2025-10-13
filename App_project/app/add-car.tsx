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
  Image,
  Platform,
  ActivityIndicator,
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/userStore';

// NOTE: ensure EXPO_PUBLIC_API_URL is available in your env or fallback
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.191:8000/api';
const REGISTER_ENDPOINT = `${API_BASE}/owner/vehicle/register`;

export default function AddCarScreen() {
  const { user } = useUserStore();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [pricePerKm, setPricePerKm] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [seats, setSeats] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [driverIncluded, setDriverIncluded] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [images, setImages] = useState<
    Array<{ uri: string; name: string; type: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const scaleValue = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => (scaleValue.value = withSpring(0.95));
  const handlePressOut = () => (scaleValue.value = withSpring(1));


  // ✅ Add features
  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };


  // ✅ Pick multiple images
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Access to gallery is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset: any, idx: number) => ({
        uri: asset.uri,
        name:
          asset.fileName ||
          (asset.uri ? asset.uri.split('/').pop() : `image_${Date.now()}_${idx}.jpg`),
        type: 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...selected]);
    }
  };

  const validateFields = () => {
    if (!make || !model || !year || !pricePerDay || !location || !fuel || !transmission || !seats) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return false;
    }
    return true;
  };

  // ✅ Submit vehicle
  const handleSubmit = async () => {
    if (!validateFields()) return;
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('ownerAccessToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in as an owner first.');
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('vehicleName', `${make} ${model}`);
      formData.append(
        'vehicleLicenseNumber',
        `${(make + model + Date.now()).slice(0, 20)}`
      );
      formData.append('brand', make);
      formData.append('model', model);
      formData.append('year', year.toString());
      formData.append('vehicleType', 'car');
      formData.append('description', description);
      formData.append('noSeats', seats.toString());
      formData.append('fuelType', fuel);
      formData.append('transmission', transmission);
      formData.append('mileage', '');
      formData.append('isDriverAvailable', withDriver ? 'true' : 'false');
      formData.append('pricePerDay', pricePerDay.toString());
      formData.append(
        'pricePerDistance',
        pricePerKm ? pricePerKm.toString() : '0'
      );
      formData.append('location', location);
      formData.append('phoneNumber', contactPhone);
      formData.append('email', contactEmail);
      formData.append('pickupAddress', pickupAddress || location);

      if (features.length > 0)
        formData.append('features', JSON.stringify(features));

      images.forEach((img) => {
        formData.append('vehicleImages', {
          uri:
            Platform.OS === 'ios' && !img.uri.startsWith('file://')
              ? `file://${img.uri}`
              : img.uri,
          name: img.name,
          type: img.type,
        } as any);
      });

      // axios post
       const response = await axios.post(REGISTER_ENDPOINT, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', response.data.message || 'Vehicle added successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') },
      ]);
    } catch (error: any) {
      console.error('Vehicle register error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add vehicle.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
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

          {/* Images & Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Images</Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <ImageIcon size={20} color="#007AFF" />
                <Text style={{ color: '#007AFF', marginLeft: 8 }}>Pick Images</Text>
              </TouchableOpacity>

              <Text style={{ color: '#8E8E93' }}>{images.length} selected</Text>
            </View>

            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
              {images.map((img, idx) => (
                <View key={idx} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
                  <Image source={{ uri: img.uri }} style={{ width: 90, height: 70, borderRadius: 8 }} />
                  <TouchableOpacity
                    onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: '#FF3B30',
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>×</Text>
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

            <View style={styles.inputContainer}>
              <MapPin size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Pickup Address"
                value={pickupAddress}
                onChangeText={setPickupAddress}
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
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Car</Text>
            )}
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
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
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
