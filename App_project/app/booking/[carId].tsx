import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  Check,
  Camera,
  Upload,
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function BookingScreen() {
  const { carId } = useLocalSearchParams();
  const { allCars, user, addBooking } = useUserStore();
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated in booking screen, redirecting to login");
      router.replace('/auth/login');
    } else {
      console.log("User authenticated:", user);
    }
  }, [user]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [contactName, setContactName] = useState(user?.firstName || user?.lastName 
    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    : '');
  const [contactPhone, setContactPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  // Document upload states
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [licenseFrontImage, setLicenseFrontImage] = useState<string | null>(null);
  const [licenseBackImage, setLicenseBackImage] = useState<string | null>(null);

  const car = allCars.find((c) => c.id === carId);
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

  const calculateTotalPrice = () => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());
  
  // Convert to days and ensure it's at least 1 day
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = Math.max(1, diffDays);
  
  console.log('Rental period days:', days);
  
  let total = days * car.pricePerDay;
  
  if (withDriver && !car.driverIncluded) {
    total += days * 50; // Additional driver cost
  }
  
  console.log('Calculated total price:', total);
  
  return total;
};

  const pickImage = async (
  setter: React.Dispatch<React.SetStateAction<string | null>>, 
  title: string
) => {
  try {
    // Show action sheet to choose camera or gallery
    Alert.alert(
      'Upload Document',
      `Choose how to upload your ${title}`,
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Please allow access to your camera');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setter(result.assets[0].uri);
              console.log(`Captured ${title} image:`, result.assets[0].uri);
            }
          }
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Please allow access to your photo library');
              return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setter(result.assets[0].uri);
              console.log(`Selected ${title} image:`, result.assets[0].uri);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to select image');
  }
};

const calculateRentalDays = () => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());
  
  // Convert to days and ensure it's at least 1 day
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

  const handleBooking = async () => {
    if (
      !startDate ||
      !endDate ||
      !pickupLocation ||
      !contactName ||
      !contactPhone ||
      !idFrontImage ||
      !idBackImage ||
      !licenseFrontImage ||
      !licenseBackImage
    ) {
      Alert.alert('Error', 'Please fill in all required fields and upload all required documents');
      return;
    }

    const totalPrice = calculateTotalPrice();
    if (totalPrice === 0) {
      Alert.alert('Error', 'Please select valid dates for your rental period');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the token from storage
      const token = await AsyncStorage.getItem('customerToken');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        router.push('/auth/login');
        return;
      }

      // Create form data to send files and text data
      const formData = new FormData();
      
      // Add ID images
      formData.append('customerIdImage', {
        uri: idFrontImage,
        name: 'id_front.jpg',
        type: 'image/jpeg'
      } as any);
      
      formData.append('customerIdImage', {
        uri: idBackImage,
        name: 'id_back.jpg',
        type: 'image/jpeg'
      } as any);
      
      // Add License images
      formData.append('customerLicenseImage', {
        uri: licenseFrontImage,
        name: 'license_front.jpg',
        type: 'image/jpeg'
      } as any);
      
      formData.append('customerLicenseImage', {
        uri: licenseBackImage,
        name: 'license_back.jpg',
        type: 'image/jpeg'
      } as any);
      
      // Add other booking details
      formData.append('vehicle', car.id);
      formData.append('owner', car.ownerId);
      formData.append('pickupLocation', pickupLocation);
      formData.append('dropoffLocation', dropoffLocation || pickupLocation);
      formData.append('pickupDate', selectedStartDate.toISOString());
      formData.append('dropoffDate', selectedEndDate.toISOString());
      formData.append('totalAmount', totalPrice.toString());
      
      console.log('Submitting booking with data:', {
        vehicle: car.id,
        pickupLocation,
        dropoffLocation: dropoffLocation || pickupLocation,
        pickupDate: selectedStartDate.toISOString(),
        dropoffDate: selectedEndDate.toISOString(),
        totalAmount: totalPrice
      });
      
      // Make API call
      const response = await axios.post(
        `${API_URL}/customer/booking/create`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Booking response:', response.data);
      
      if (response.data.success) {
        // Create local booking object
        const newBooking = {
          id: response.data.booking._id,
          userId: user!.id,
          carId: car.id,
          ownerId: car.ownerId,
          startDate,
          endDate,
          totalPrice,
          status: 'pending' as const,
          pickupLocation,
          dropoffLocation: dropoffLocation || pickupLocation,
          withDriver,
          createdAt: new Date().toISOString(),
          car,
        };

        // Add to local store
        addBooking(newBooking);

        Alert.alert(
          'Booking Confirmed!',
          'Your booking request has been submitted. You will receive a confirmation shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/profile'),
            },
          ]
        );
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'An error occurred while creating your booking';
                          
      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      // Remove time component for consistent calculations
      const dateWithoutTime = new Date(selectedDate.setHours(0, 0, 0, 0));
      setSelectedStartDate(dateWithoutTime);
      setStartDate(formatDate(dateWithoutTime));

      // If end date is before start date, reset it
      if (selectedEndDate.getTime() <= dateWithoutTime.getTime()) {
        const nextDay = new Date(dateWithoutTime);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedEndDate(nextDay);
        setEndDate(formatDate(nextDay));
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      // Remove time component for consistent calculations
      const dateWithoutTime = new Date(selectedDate.setHours(0, 0, 0, 0));
      setSelectedEndDate(dateWithoutTime);
      setEndDate(formatDate(dateWithoutTime));
    }
  };

  const showStartPicker = () => {
    setShowStartDatePicker(true);
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.title}>Book Now</Text>
        </Animated.View>

        {/* Car Summary */}
        <Animated.View style={styles.carSummary} entering={FadeIn.delay(200)}>
          <Image source={{ uri: car.image }} style={styles.carImage} />
          <View style={styles.carInfo}>
            <Text style={styles.carName}>
              {car.make} {car.model}
            </Text>
            <Text style={styles.carLocation}>{car.location}</Text>
            <Text style={styles.carPrice}>${car.pricePerDay}/day</Text>
          </View>
        </Animated.View>

        {/* Booking Form */}
        <Animated.View
          style={styles.formContainer}
          entering={FadeIn.delay(300)}
        >
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Period</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showStartPicker}
              >
                <Calendar size={20} color="#8E8E93" />
                <Text
                  style={[
                    styles.dateText,
                    startDate ? styles.inputFilled : styles.inputPlaceholder,
                  ]}
                >
                  {startDate || 'Start Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showEndPicker}
              >
                <Calendar size={20} color="#8E8E93" />
                <Text
                  style={[
                    styles.dateText,
                    endDate ? styles.inputFilled : styles.inputPlaceholder,
                  ]}
                >
                  {endDate || 'End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup & Dropoff</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Pickup Location *"
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Dropoff Location (optional)"
                value={dropoffLocation}
                onChangeText={setDropoffLocation}
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Driver Option */}
          {car.withDriver && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Option</Text>
              <TouchableOpacity
                style={styles.driverOption}
                onPress={() => setWithDriver(!withDriver)}
              >
                <View style={styles.driverOptionLeft}>
                  <User size={20} color="#007AFF" />
                  <View style={styles.driverOptionText}>
                    <Text style={styles.driverOptionTitle}>
                      {car.driverIncluded ? 'Driver Included' : 'Add Driver'}
                    </Text>
                    <Text style={styles.driverOptionSubtitle}>
                      {car.driverIncluded
                        ? 'Professional driver included'
                        : '+$50/day for professional driver'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    withDriver && styles.checkboxSelected,
                  ]}
                >
                  {withDriver && <Check size={16} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={contactName}
                onChangeText={setContactName}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Document Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <Text style={styles.documentDescription}>
              Please upload clear images of both sides of your ID card and driver's license
            </Text>
            
            {/* ID Document */}
            <View style={styles.documentSection}>
              <Text style={styles.documentTitle}>ID Card</Text>
              
              <View style={styles.documentRow}>
                <TouchableOpacity 
                  style={[styles.documentUpload, idFrontImage && styles.documentUploaded]}
                  onPress={() => pickImage(setIdFrontImage, 'ID Front')}
                >
                  {idFrontImage ? (
                    <Image source={{ uri: idFrontImage }} style={styles.documentThumbnail} />
                  ) : (
                    <>
                      <Upload size={24} color="#007AFF" />
                      <Text style={styles.documentUploadText}>Front</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.documentUpload, idBackImage && styles.documentUploaded]}
                  onPress={() => pickImage(setIdBackImage, 'ID Back')}
                >
                  {idBackImage ? (
                    <Image source={{ uri: idBackImage }} style={styles.documentThumbnail} />
                  ) : (
                    <>
                      <Upload size={24} color="#007AFF" />
                      <Text style={styles.documentUploadText}>Back</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Driver's License */}
            <View style={styles.documentSection}>
              <Text style={styles.documentTitle}>Driver's License</Text>
              
              <View style={styles.documentRow}>
                <TouchableOpacity 
                  style={[styles.documentUpload, licenseFrontImage && styles.documentUploaded]}
                  onPress={() => pickImage(setLicenseFrontImage, 'License Front')}
                >
                  {licenseFrontImage ? (
                    <Image source={{ uri: licenseFrontImage }} style={styles.documentThumbnail} />
                  ) : (
                    <>
                      <Upload size={24} color="#007AFF" />
                      <Text style={styles.documentUploadText}>Front</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.documentUpload, licenseBackImage && styles.documentUploaded]}
                  onPress={() => pickImage(setLicenseBackImage, 'License Back')}
                >
                  {licenseBackImage ? (
                    <Image source={{ uri: licenseBackImage }} style={styles.documentThumbnail} />
                  ) : (
                    <>
                      <Upload size={24} color="#007AFF" />
                      <Text style={styles.documentUploadText}>Back</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.priceSection}>
  <Text style={styles.sectionTitle}>Price Summary</Text>
  {startDate && endDate && (
    <>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Rental Period</Text>
        <Text style={styles.priceValue}>
          {calculateRentalDays()} {calculateRentalDays() === 1 ? 'day' : 'days'}
        </Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Car Rental</Text>
        <Text style={styles.priceValue}>
          ${car.pricePerDay} × {calculateRentalDays()} = ${car.pricePerDay * calculateRentalDays()}
        </Text>
      </View>
      {withDriver && !car.driverIncluded && (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Driver Service</Text>
          <Text style={styles.priceValue}>
            $50 × {calculateRentalDays()} = ${50 * calculateRentalDays()}
          </Text>
        </View>
      )}
      <View style={styles.priceDivider} />
      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${calculateTotalPrice()}</Text>
      </View>
    </>
  )}
  {(!startDate || !endDate) && (
    <Text style={styles.noDateText}>Please select start and end dates to see total price</Text>
  )}
</View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <Animated.View style={styles.bottomActions} entering={FadeIn.delay(500)}>
        <TouchableOpacity
          style={[styles.bookButton, isLoading && styles.disabledButton]}
          onPress={handleBooking}
          disabled={isLoading}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={[animatedStyle, styles.buttonContent]}>
            <CreditCard size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>
              {isLoading
                ? 'Processing...'
                : `Book for $${calculateTotalPrice()}`}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={selectedStartDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={selectedEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={selectedStartDate}
          onChange={handleEndDateChange}
        />
      )}
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
  inputFilled: {
    color: '#1D1D1F',
  },
  inputPlaceholder: {
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
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
    color: '#007AFF',
  },
  // ... existing styles ...
  
  // New styles for document upload
  documentSection: {
    marginTop: 16,
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  documentUpload: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentUploaded: {
    borderStyle: 'solid',
    borderColor: '#007AFF',
  },
  documentUploadText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginTop: 8,
  },
  documentThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Include all your existing styles here
  carSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  carLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  driverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  driverOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  driverOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  driverOptionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priceSection: {
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  priceValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#007AFF',
  },
  bottomActions: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  noDateText: {
  fontSize: 14,
  fontFamily: 'Inter-Regular',
  color: '#8E8E93',
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: 10,
},
});