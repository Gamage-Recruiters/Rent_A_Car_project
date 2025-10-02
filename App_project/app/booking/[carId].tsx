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
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function BookingScreen() {
  const params = useLocalSearchParams();
  const { carId, editMode, bookingId, startDate: editStartDate, endDate: editEndDate, 
          pickupLocation: editPickupLocation, dropoffLocation: editDropoffLocation, 
          totalPrice: editTotalPrice } = params;
  const { allCars, user, addBooking, updateBooking, fetchBookingById } = useUserStore();
  
  // All useState hooks must be at the top level, before any early returns
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
  });
  const [selectedEndDate, setSelectedEndDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0, 0);
    return tomorrow;
  });

  // Picker-specific date values to ensure proper synchronization
  const [pickerStartDate, setPickerStartDate] = useState(selectedStartDate);
  const [pickerEndDate, setPickerEndDate] = useState(selectedEndDate);

  // Document upload states
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [licenseFrontImage, setLicenseFrontImage] = useState<string | null>(null);
  const [licenseBackImage, setLicenseBackImage] = useState<string | null>(null);

  // All useSharedValue and animation hooks
  const scaleValue = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  // Check if user is logged in (moved to conditional render below to avoid hook issues)

  // Fetch fresh booking data when in edit mode
  useEffect(() => {
    const fetchBookingData = async () => {
      if (editMode === 'true' && bookingId) {
        setIsLoadingBooking(true);
        console.log('Fetching fresh booking data for ID:', bookingId);
        
        try {
          const freshBooking = await fetchBookingById(bookingId as string);
          if (freshBooking) {
            console.log('Fresh booking data:', freshBooking);
            setCurrentBooking(freshBooking);
            
            // Populate form with fresh data
            const startDateOnly = freshBooking.startDate.split('T')[0]; // Extract YYYY-MM-DD
            const endDateOnly = freshBooking.endDate.split('T')[0]; // Extract YYYY-MM-DD
            
            setStartDate(startDateOnly);
            setEndDate(endDateOnly);
            setPickupLocation(freshBooking.pickupLocation || '');
            setDropoffLocation(freshBooking.dropoffLocation || '');
            
            // Set date picker values - use local date constructor with noon time to avoid timezone issues
            const [startYear, startMonth, startDay] = startDateOnly.split('-').map(Number);
            const [endYear, endMonth, endDay] = endDateOnly.split('-').map(Number);
            
            const startDateObj = new Date(startYear, startMonth - 1, startDay, 12, 0, 0); // Month is 0-indexed, noon time
            const endDateObj = new Date(endYear, endMonth - 1, endDay, 12, 0, 0); // Month is 0-indexed, noon time
            
            console.log('Parsed start date:', startDateOnly, '→', startDateObj);
            console.log('Parsed end date:', endDateOnly, '→', endDateObj);
            
            if (!isNaN(startDateObj.getTime())) {
              setSelectedStartDate(startDateObj);
              console.log('Set selectedStartDate to:', startDateObj);
            }
            if (!isNaN(endDateObj.getTime())) {
              setSelectedEndDate(endDateObj);
              console.log('Set selectedEndDate to:', endDateObj);
            }
            
            // Set with driver option if available in booking data
            if (freshBooking.withDriver !== undefined) {
              setWithDriver(freshBooking.withDriver);
            }
          }
        } catch (error) {
          console.error('Error fetching booking data:', error);
          // Fallback to route parameters if fresh data fetch fails
          if (editStartDate && editEndDate) {
            setStartDate(editStartDate as string);
            setEndDate(editEndDate as string);
            setPickupLocation(editPickupLocation as string || '');
            setDropoffLocation(editDropoffLocation as string || '');
            
            const startDateObj = new Date(editStartDate as string);
            const endDateObj = new Date(editEndDate as string);
            
            if (!isNaN(startDateObj.getTime())) {
              setSelectedStartDate(startDateObj);
            }
            if (!isNaN(endDateObj.getTime())) {
              setSelectedEndDate(endDateObj);
            }
          }
        } finally {
          setIsLoadingBooking(false);
        }
      }
    };

    fetchBookingData();
  }, [editMode, bookingId, fetchBookingById]);

  // Update contact info when user object changes
  useEffect(() => {
    if (user) {
      // Update contact name
      const fullName = user.firstName || user.lastName 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : user.name || '';
      setContactName(fullName);

      // Update contact phone
      const phoneValue = user.phone || user.phoneNumber || '';
      setContactPhone(phoneValue);

      // Update contact email
      setContactEmail(user.email || '');
    }
  }, [user]);

  // Initialize contact info on first load
  useEffect(() => {
    if (user && !contactName && !contactPhone && !contactEmail) {
      const fullName = user.firstName || user.lastName 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : user.name || '';
      setContactName(fullName);
      setContactPhone(user.phone || user.phoneNumber || '');
      setContactEmail(user.email || '');
    }
  }, [user, contactName, contactPhone, contactEmail]);

  // Initialize date strings for new bookings (non-edit mode)
  useEffect(() => {
    if (editMode !== 'true' && !startDate && !endDate) {
      const formattedStartDate = formatDate(selectedStartDate);
      const formattedEndDate = formatDate(selectedEndDate);
      setStartDate(formattedStartDate);
      setEndDate(formattedEndDate);
      console.log('Initialized dates for new booking:', formattedStartDate, 'to', formattedEndDate);
    }
  }, [editMode, startDate, endDate, selectedStartDate, selectedEndDate]);

  // Handle authentication redirect
  if (!user) {
    console.log("User not authenticated in booking screen, redirecting to login");
    router.replace('/auth/login');
    return null; // Return null while redirecting
  }

  console.log("User authenticated:", user);

  const car = allCars.find((c) => c.id === carId);

  if (!car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Car not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading while fetching booking data in edit mode
  if (editMode === 'true' && isLoadingBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading booking details...</Text>
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
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your camera');
                return;
              }
              
              // Use the namespace import style and ImagePicker.MediaTypeOptions
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: "images" as any,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: false,
                exif: false
              });
              
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                if (imageUri) {
                  const compressed = await compressImage(imageUri);
                  setter(compressed);
                  console.log(`Captured and compressed ${title} image`);
                }
              }
            } catch (error) {
              console.error('Camera error:', error);
              Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
            }
          }
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photo library');
                return;
              }
              
              // Use the namespace import style and ImagePicker.MediaTypeOptions
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images" as any,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: false,
                exif: false
              });
              
              if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                if (imageUri) {
                  const compressed = await compressImage(imageUri);
                  setter(compressed);
                  console.log(`Selected and compressed ${title} image`);
                }
              }
            } catch (error) {
              console.error('Gallery error:', error);
              Alert.alert('Gallery Error', 'Failed to select image. Please try again.');
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

const compressImage = async (uri: string): Promise<string> => {
  try {
    console.log('Starting image compression');
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize to reasonable dimensions
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Medium compression
    );
    console.log('Image compressed successfully');
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original if compression fails
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
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      router.push('/auth/login');
      return;
    }

    console.log('=== STARTING BOOKING PROCESS ===');
    console.log('API URL:', API_URL);
    console.log('Token exists:', !!accessToken);

    // Create FormData
    const formData = new FormData();
    const timestamp = Date.now();

    // Add booking details FIRST
    formData.append('vehicle', car.id);
    formData.append('owner', car.ownerId);
    formData.append('pickupLocation', pickupLocation);
    formData.append('dropoffLocation', dropoffLocation || pickupLocation);
    formData.append('pickupDate', selectedStartDate.toISOString());
    formData.append('dropoffDate', selectedEndDate.toISOString());
    formData.append('totalAmount', totalPrice.toString());

    console.log('FormData text fields added');

    // Add images with proper structure
    if (idFrontImage) {
      formData.append('customerIdImage', {
        uri: idFrontImage,
        type: 'image/jpeg',
        name: `id_front_${timestamp}.jpg`
      } as any);
      console.log('ID Front image added');
    }

    if (idBackImage) {
      formData.append('customerIdImage', {
        uri: idBackImage,
        type: 'image/jpeg',
        name: `id_back_${timestamp}.jpg`
      } as any);
      console.log('ID Back image added');
    }

    if (licenseFrontImage) {
      formData.append('customerLicenseImage', {
        uri: licenseFrontImage,
        type: 'image/jpeg',
        name: `license_front_${timestamp}.jpg`
      } as any);
      console.log('License Front image added');
    }

    if (licenseBackImage) {
      formData.append('customerLicenseImage', {
        uri: licenseBackImage,
        type: 'image/jpeg',
        name: `license_back_${timestamp}.jpg`
      } as any);
      console.log('License Back image added');
    }

    console.log('All images added to FormData');

    // Test connectivity first
    try {
      console.log('Testing server connectivity...');
      const testResponse = await fetch(`${API_URL}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!testResponse.ok) {
        throw new Error(`Connectivity test failed: ${testResponse.status}`);
      }
      
      console.log('Server connectivity test passed');
    } catch (connectError) {
      console.error('Connectivity test failed:', connectError);
      Alert.alert('Connection Error', 'Cannot connect to server. Please check your network and try again.');
      setIsLoading(false);
      return;
    }

    // Make the booking request
    console.log('Making booking request...');
    const response = await fetch(`${API_URL}/customer/booking/create`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Booking response:', responseData);

    if (responseData.success) {
      // Create local booking object
      const newBooking = {
        id: responseData.booking._id,
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
        'Your booking request has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/profile'),
          },
        ]
      );
    } else {
      throw new Error(responseData.message || 'Failed to create booking');
    }
    
  } catch (error: any) {
    console.error('Booking error:', error);
    
    let errorMessage = 'Failed to create booking. Please try again.';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert('Booking Failed', errorMessage);
  } finally {
    setIsLoading(false);
  }
};

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
    const formatted = `${year}-${month}-${day}`;
    
    console.log('formatDate input:', date.toString());
    console.log('formatDate components: year =', year, 'month =', month, 'day =', day);
    console.log('formatDate output:', formatted);
    
    return formatted;
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      console.log('=== START DATE SELECTION DETAILED DEBUG ===');
      console.log('Event type:', event?.type);
      console.log('Original selectedDate from picker:', selectedDate);
      console.log('selectedDate.toString():', selectedDate.toString());
      console.log('selectedDate.toISOString():', selectedDate.toISOString());
      console.log('selectedDate.toLocaleDateString():', selectedDate.toLocaleDateString());
      console.log('Raw date components:');
      console.log('  - getFullYear():', selectedDate.getFullYear());
      console.log('  - getMonth():', selectedDate.getMonth(), '(0-indexed, so add 1)');
      console.log('  - getDate():', selectedDate.getDate());
      console.log('  - getDay():', selectedDate.getDay(), '(day of week, 0=Sunday)');
      console.log('  - getTime():', selectedDate.getTime());
      console.log('  - getTimezoneOffset():', selectedDate.getTimezoneOffset(), 'minutes');
      
      // Create a new date object at noon to avoid timezone issues
      // Using noon (12:00) instead of midnight to avoid DST boundary issues
      const dateWithoutTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      
      console.log('Created dateWithoutTime:', dateWithoutTime);
      console.log('dateWithoutTime.toString():', dateWithoutTime.toString());
      console.log('dateWithoutTime components:');
      console.log('  - getFullYear():', dateWithoutTime.getFullYear());
      console.log('  - getMonth():', dateWithoutTime.getMonth());
      console.log('  - getDate():', dateWithoutTime.getDate());
      console.log('Formatted string:', formatDate(dateWithoutTime));
      console.log('==========================================');
      
      // For edit mode, validate but don't auto-adjust
      if (editMode === 'true' && selectedEndDate && dateWithoutTime.getTime() >= selectedEndDate.getTime()) {
        Alert.alert(
          'Invalid Date Selection',
          'Start date must be before the end date. Please adjust your dates accordingly.',
          [{ text: 'OK' }]
        );
        // Still update the start date, let user adjust end date manually
      }
      
      setSelectedStartDate(dateWithoutTime);
      setPickerStartDate(dateWithoutTime);
      setStartDate(formatDate(dateWithoutTime));

      // Only auto-adjust end date for new bookings, not when editing
      if (editMode !== 'true' && selectedEndDate.getTime() <= dateWithoutTime.getTime()) {
        const nextDay = new Date(dateWithoutTime);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedEndDate(nextDay);
        setPickerEndDate(nextDay);
        setEndDate(formatDate(nextDay));
        console.log('Auto-adjusted end date to:', formatDate(nextDay));
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      console.log('=== END DATE SELECTION DETAILED DEBUG ===');
      console.log('Event type:', event?.type);
      console.log('Original selectedDate from picker:', selectedDate);
      console.log('selectedDate.toString():', selectedDate.toString());
      console.log('selectedDate.toISOString():', selectedDate.toISOString());
      console.log('selectedDate.toLocaleDateString():', selectedDate.toLocaleDateString());
      console.log('Raw date components:');
      console.log('  - getFullYear():', selectedDate.getFullYear());
      console.log('  - getMonth():', selectedDate.getMonth(), '(0-indexed, so add 1)');
      console.log('  - getDate():', selectedDate.getDate());
      console.log('  - getDay():', selectedDate.getDay(), '(day of week, 0=Sunday)');
      console.log('  - getTime():', selectedDate.getTime());
      console.log('  - getTimezoneOffset():', selectedDate.getTimezoneOffset(), 'minutes');
      
      // Create a new date object at noon to avoid timezone issues
      // Using noon (12:00) instead of midnight to avoid DST boundary issues
      const dateWithoutTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      
      console.log('Created dateWithoutTime:', dateWithoutTime);
      console.log('dateWithoutTime.toString():', dateWithoutTime.toString());
      console.log('dateWithoutTime components:');
      console.log('  - getFullYear():', dateWithoutTime.getFullYear());
      console.log('  - getMonth():', dateWithoutTime.getMonth());
      console.log('  - getDate():', dateWithoutTime.getDate());
      console.log('Formatted string:', formatDate(dateWithoutTime));
      console.log('========================================');
      
      // Validate that end date is after start date
      if (selectedStartDate && dateWithoutTime.getTime() <= selectedStartDate.getTime()) {
        Alert.alert(
          'Invalid Date Selection',
          'End date must be after the start date. Please select a valid end date.',
          [{ text: 'OK' }]
        );
        return; // Don't update the date if it's invalid
      }
      
      setSelectedEndDate(dateWithoutTime);
      setPickerEndDate(dateWithoutTime);
      setEndDate(formatDate(dateWithoutTime));
    }
  };

  const showStartPicker = () => {
    console.log('=== OPENING START DATE PICKER ===');
    console.log('Current startDate string:', startDate);
    console.log('Current selectedStartDate object:', selectedStartDate.toString());
    console.log('selectedStartDate components:', selectedStartDate.getFullYear(), selectedStartDate.getMonth() + 1, selectedStartDate.getDate());
    
    // Sync picker date with the current startDate string
    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      const syncedDate = new Date(year, month - 1, day, 12, 0, 0);
      
      console.log('Syncing start date picker:');
      console.log('  - Parsed from string:', startDate, '→', year, month, day);
      console.log('  - Created Date object:', syncedDate.toString());
      console.log('  - Date components:', syncedDate.getFullYear(), syncedDate.getMonth() + 1, syncedDate.getDate());
      
      // Update both the main state and picker-specific state
      setSelectedStartDate(syncedDate);
      setPickerStartDate(syncedDate);
      
      console.log('  - Updated pickerStartDate to:', syncedDate.toString());
    } else {
      console.log('No startDate string to sync, using current selectedStartDate');
      setPickerStartDate(selectedStartDate);
    }
    
    // Show picker immediately - no timeout needed with dedicated picker state
    setShowStartDatePicker(true);
    console.log('===================================');
  };

  const showEndPicker = () => {
    console.log('=== OPENING END DATE PICKER ===');
    console.log('Current endDate string:', endDate);
    console.log('Current selectedEndDate object:', selectedEndDate.toString());
    console.log('selectedEndDate components:', selectedEndDate.getFullYear(), selectedEndDate.getMonth() + 1, selectedEndDate.getDate());
    
    // Sync picker date with the current endDate string
    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      const syncedDate = new Date(year, month - 1, day, 12, 0, 0);
      
      console.log('Syncing end date picker:');
      console.log('  - Parsed from string:', endDate, '→', year, month, day);
      console.log('  - Created Date object:', syncedDate.toString());
      console.log('  - Date components:', syncedDate.getFullYear(), syncedDate.getMonth() + 1, syncedDate.getDate());
      
      // Update both the main state and picker-specific state
      setSelectedEndDate(syncedDate);
      setPickerEndDate(syncedDate);
      
      console.log('  - Updated pickerEndDate to:', syncedDate.toString());
    } else {
      console.log('No endDate string to sync, using current selectedEndDate');
      setPickerEndDate(selectedEndDate);
    }
    
    // Show picker immediately - no timeout needed with dedicated picker state
    setShowEndDatePicker(true);
    console.log('=================================');
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
          <Text style={styles.title}>
            {editMode === 'true' ? 'Edit Booking' : 'Book Now'}
          </Text>
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
                  {startDate ? `From ${startDate}` : 'From - Start Date'}
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
                  {endDate ? `To ${endDate}` : 'To - End Date'}
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
                placeholder="From - Pickup Location *"
                value={pickupLocation ? `From ${pickupLocation}` : ''}
                onChangeText={(text) => {
                  // Remove "From " prefix if it exists when user types
                  const cleanText = text.startsWith('From ') ? text.substring(5) : text;
                  setPickupLocation(cleanText);
                }}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                placeholder="To - Dropoff Location (optional)"
                value={dropoffLocation ? `To ${dropoffLocation}` : ''}
                onChangeText={(text) => {
                  // Remove "To " prefix if it exists when user types
                  const cleanText = text.startsWith('To ') ? text.substring(3) : text;
                  setDropoffLocation(cleanText);
                }}
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

          {/* Document Upload - Only show for new bookings */}
          {editMode !== 'true' && (
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
          )}

          {/* Edit Mode Notice */}
          {editMode === 'true' && (
            <View style={styles.section}>
              <View style={styles.editNotice}>
                <Text style={styles.editNoticeText}>
                  📝 You're editing an existing booking. Documents are already on file.
                </Text>
              </View>
            </View>
          )}

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
                : editMode === 'true' 
                  ? `Update Booking - $${calculateTotalPrice()}`
                  : `Book for $${calculateTotalPrice()}`}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <>
          {console.log('Showing START DateTimePicker with pickerStartDate:', pickerStartDate.toString())}
          {console.log('START picker date components:', pickerStartDate.getFullYear(), pickerStartDate.getMonth() + 1, pickerStartDate.getDate())}
          <DateTimePicker
            key={`start-picker-${pickerStartDate.getTime()}`}
            testID="startDatePicker"
            value={pickerStartDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={editMode === 'true' ? undefined : (() => {
              const today = new Date();
              return new Date(today.getFullYear(), today.getMonth(), today.getDate());
            })()}
            onChange={handleStartDateChange}
          />
        </>
      )}

      {showEndDatePicker && (
        <>
          {console.log('Showing END DateTimePicker with pickerEndDate:', pickerEndDate.toString())}
          {console.log('END picker date components:', pickerEndDate.getFullYear(), pickerEndDate.getMonth() + 1, pickerEndDate.getDate())}
          <DateTimePicker
            key={`end-picker-${pickerEndDate.getTime()}`}
            testID="endDatePicker"
            value={pickerEndDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={selectedStartDate}
            onChange={handleEndDateChange}
          />
        </>
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
  editNotice: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  editNoticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    textAlign: 'center',
  },
});