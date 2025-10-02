import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { bookingService, BackendBooking } from '../services/bookingService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL?.replace(/\/api$/, "");

const getAdjustedUrl = (url: string) => {
  if (Platform.OS === 'android' && url && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  type: 'user' | 'owner';
  createdAt: string;
  profileImage?: string;
  photo?: string;
  googleId?: string;
  dateOfBirth?: string;
  driversLicense?: string;
  emergencyContact?: string;
  address?: string;
  isNewsletterSubscribed?: boolean;
  newsletterSubscribedAt?: string;
  newsletterUnsubscribedAt?: string;
  userRole?: string;
  avatar?: string;
}

export interface Car {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  image: string;
  pricePerDay: number;
  pricePerKm?: number;
  location: string;
  available: boolean;
  unavailableDates: string[];
  features: string[];
  withDriver: boolean;
  driverIncluded: boolean;
  rating: number;
  reviews: number;
  fuel?: string;
  transmission: string;
  seats: number;
  description: string;
  contactPhone: string;
  contactEmail: string;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid';
  pickupLocation: string;
  dropoffLocation: string;
  withDriver: boolean;
  createdAt: string;
  car: Car;
}

// Mock data for demonstration - moved before store creation
const mockCars: Car[] = [
  {
    id: '1',
    ownerId: 'owner1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    pricePerDay: 85,
    pricePerKm: 0.5,
    location: 'Downtown',
    available: true,
    unavailableDates: [],
    features: ['AC', 'GPS', 'Bluetooth', 'USB'],
    withDriver: true,
    driverIncluded: false,
    rating: 4.8,
    reviews: 124,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    seats: 5,
    description: 'Comfortable and reliable sedan perfect for city driving and longer trips.',
    contactPhone: '+1-555-0123',
    contactEmail: 'owner1@example.com',
  },
  {
    id: '2',
    ownerId: 'owner2',
    make: 'Honda',
    model: 'CR-V',
    year: 2022,
    image: 'https://images.pexels.com/photos/35967/mini-cooper-auto-model-vehicle.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    pricePerDay: 95,
    pricePerKm: 0.6,
    location: 'Airport',
    available: true,
    unavailableDates: ['2024-01-15', '2024-01-16'],
    features: ['AC', 'GPS', 'Backup Camera', 'Heated Seats'],
    withDriver: true,
    driverIncluded: true,
    rating: 4.9,
    reviews: 89,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    seats: 5,
    description: 'Spacious SUV with all-wheel drive, perfect for family trips and outdoor adventures.',
    contactPhone: '+1-555-0456',
    contactEmail: 'owner2@example.com',
  },
  {
    id: '3',
    ownerId: 'owner3',
    make: 'BMW',
    model: 'X3',
    year: 2024,
    image: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    pricePerDay: 145,
    pricePerKm: 1.0,
    location: 'City Center',
    available: true,
    unavailableDates: [],
    features: ['AC', 'GPS', 'Leather Seats', 'Sunroof', 'Premium Audio'],
    withDriver: true,
    driverIncluded: false,
    rating: 4.7,
    reviews: 56,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    seats: 5,
    description: 'Luxury SUV with premium features and exceptional performance.',
    contactPhone: '+1-555-0789',
    contactEmail: 'owner3@example.com',
  },
  {
    id: '4',
    ownerId: 'owner4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    image: 'https://images.pexels.com/photos/1805053/pexels-photo-1805053.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    pricePerDay: 120,
    pricePerKm: 0.3,
    location: 'Tech District',
    available: true,
    unavailableDates: ['2024-01-20', '2024-01-21'],
    features: ['Autopilot', 'Supercharging', 'Premium Interior', 'Over-the-air updates'],
    withDriver: false,
    driverIncluded: false,
    rating: 4.9,
    reviews: 78,
    fuel: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    description: 'Electric sedan with cutting-edge technology and impressive range.',
    contactPhone: '+1-555-0321',
    contactEmail: 'owner4@example.com',
  },
];

interface UserStore {
  user: User | null;
  userType: 'user' | 'owner' | null;
  cars: Car[];
  bookings: Booking[];
  allCars: Car[];
  isLoadingBookings: boolean;
  bookingsError: string | null;
  setUser: (user: User | null) => void;
  setUserType: (type: 'user' | 'owner' | null) => void;
  setCars: (cars: Car[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setAllCars: (cars: Car[]) => void;
  addCar: (car: Car) => void;
  updateCar: (carId: string, updates: Partial<Car>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: {
    pickupLocation?: string;
    dropoffLocation?: string;
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
  }) => Promise<Booking>;
  logout: () => void;
  fetchAllVehicles: () => Promise<Car[]>;
  fetchMyBookings: () => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<void>;
  initializeStore: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userType: null,
  cars: [],
  bookings: [],
  allCars: [],
  isLoadingBookings: false,
  bookingsError: null,
  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
      // If user is a customer, fetch their bookings
      const { userType, fetchMyBookings } = get();
      if (userType === 'user') {
        fetchMyBookings();
      }
    } else {
      AsyncStorage.removeItem('user');
    }
  },
  setUserType: (type) => {
    set({ userType: type });
    if (type) {
      AsyncStorage.setItem('userType', type);
    } else {
      AsyncStorage.removeItem('userType');
    }
  },
  setCars: (cars) => set({ cars }),
  setBookings: (bookings) => set({ bookings }),
  setAllCars: (cars) => set({ allCars: cars }),
  addCar: (car) => {
    const { cars } = get();
    set({ cars: [...cars, car] });
  },
  updateCar: (carId, updates) => {
    const { cars } = get();
    set({ 
      cars: cars.map(car => car.id === carId ? { ...car, ...updates } : car)
    });
  },
  addBooking: (booking) => {
    const { bookings } = get();
    set({ bookings: [...bookings, booking] });
  },
  updateBooking: async (bookingId: string, updates: {
    pickupLocation?: string;
    dropoffLocation?: string;
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
  }) => {
    try {
      // Map frontend updates to backend format
      const backendUpdates: any = {};
      if (updates.pickupLocation) backendUpdates.pickupLocation = updates.pickupLocation;
      if (updates.dropoffLocation) backendUpdates.dropoffLocation = updates.dropoffLocation;
      if (updates.startDate) backendUpdates.pickupDate = updates.startDate;
      if (updates.endDate) backendUpdates.dropoffDate = updates.endDate;
      if (updates.totalPrice) backendUpdates.totalAmount = updates.totalPrice;

      console.log('=== USERSTORE UPDATE DEBUG ===');
      console.log('Frontend updates received:', updates);
      console.log('Backend updates mapped:', backendUpdates);
      console.log('================================');

      const updatedBackendBooking = await bookingService.updateBooking(bookingId, backendUpdates);
      console.log('Backend response:', updatedBackendBooking);
      
      const updatedBooking = mapBackendBookingToFrontend(updatedBackendBooking);
      console.log('Mapped frontend booking:', updatedBooking);
      
      const { bookings } = get();
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      );
      set({ bookings: updatedBookings });
      
      return updatedBooking;
    } catch (error: any) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },
  logout: () => {
    set({ user: null, userType: null, cars: [], bookings: [] });
    AsyncStorage.multiRemove(['user', 'userType']);
  },

  fetchAllVehicles: async () => {
    try {
      const response = await axios.get(`${API_URL}/customer/vehicle`);
      if (response.data && response.data.success) {
        const vehicles = response.data.data.map(mapVehicleToCar);
        set({ allCars: vehicles });
        return vehicles;
      }
      return [];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  },

  fetchMyBookings: async () => {
    try {
      set({ isLoadingBookings: true, bookingsError: null });
      const backendBookings = await bookingService.getMyBookings();
      
      // Filter and map bookings, handling corrupted data
      const mappedBookings: Booking[] = [];
      let skippedCount = 0;
      
      backendBookings.forEach((backendBooking, index) => {
        try {
          if (backendBooking && backendBooking._id) {
            const mappedBooking = mapBackendBookingToFrontend(backendBooking);
            mappedBookings.push(mappedBooking);
          } else {
            console.warn(`⚠️  Skipping null booking at index ${index}`);
            skippedCount++;
          }
        } catch (mappingError: any) {
          // Clean logging without stack traces for known data issues
          console.warn(`⚠️  Skipped booking ${backendBooking?._id || 'unknown'}: ${mappingError.message}`);
          skippedCount++;
          // Continue processing other bookings instead of failing completely
        }
      });
      
      if (skippedCount > 0) {
        console.log(`📊 Booking fetch result: ${mappedBookings.length} valid, ${skippedCount} skipped (corrupted data)`);
      } else {
        console.log(`✅ Successfully loaded ${mappedBookings.length} bookings`);
      }
      set({ bookings: mappedBookings, isLoadingBookings: false });
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      set({ 
        bookingsError: error.message || 'Failed to fetch bookings', 
        isLoadingBookings: false 
      });
    }
  },

  fetchBookingById: async (bookingId: string) => {
    try {
      const backendBooking = await bookingService.getBookingById(bookingId);
      
      if (!backendBooking || !backendBooking._id) {
        console.error('Invalid booking data received for ID:', bookingId);
        return null;
      }
      
      const mappedBooking = mapBackendBookingToFrontend(backendBooking);
      
      // Update the booking in the local bookings array if it exists
      const { bookings } = get();
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? mappedBooking : booking
      );
      set({ bookings: updatedBookings });
      
      return mappedBooking;
    } catch (error: any) {
      console.error('Error fetching booking by ID:', error);
      console.error('Booking ID that caused error:', bookingId);
      return null;
    }
  },

  cancelBooking: async (bookingId: string) => {
    try {
      const updatedBackendBooking = await bookingService.cancelBooking(bookingId);
      const updatedBooking = mapBackendBookingToFrontend(updatedBackendBooking);
      
      const { bookings } = get();
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      );
      set({ bookings: updatedBookings });
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  fetchVehicleById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/customer/vehicle/${id}`);
      if (response.data && response.data.success) {
        const car = mapVehicleToCar(response.data.data);
        // Update the car in allCars if it exists
        const { allCars } = get();
        const updatedCars = allCars.map(c => c.id === car.id ? car : c);
        set({ allCars: updatedCars });
        return car;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching vehicle with ID ${id}:`, error);
      return null;
    }
  },

  searchVehicles: async (query: string) => {
    try {
      const response = await axios.get(`${API_URL}/customer/vehicle/search?query=${encodeURIComponent(query)}`);
      if (response.data && response.data.success) {
        const vehicles = response.data.data.map(mapVehicleToCar);
        return vehicles;
      }
      return [];
    } catch (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
  },

  getVehicleLocations: async () => {
    try {
      const response = await axios.get(`${API_URL}/customer/vehicle/locations`);
      if (response.data) {
        return response.data; // Array of location strings
      }
      return [];
    } catch (error) {
      console.error('Error fetching vehicle locations:', error);
      return [];
    }
  },

  registerUser: async (userData: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
  userType: 'user' | 'owner';
}) => {
  try {
    const endpoint = userData.userType === 'owner' 
      ? `/auth/owner/register`
      : `/auth/customer/register`;
      
    const postData = {
      firstName: userData.firstName,
      lastName: userData.lastName || '',
      email: userData.email,
      phone: userData.phone,
      phoneNumber: userData.phone,
      password: userData.password
    };
    
    const response = await axios.post(`${API_URL}${endpoint}`, postData);
    
    if (response.data) {
      if (userData.userType === 'owner' && response.data.owner && response.data.accessToken) {
        // Owner registration successful with tokens
        const { accessToken, refreshToken, owner } = response.data;
        
        // Store tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        
        // Store user data
        const user: User = {
          id: owner.id,
          email: owner.email,
          firstName: owner.firstName,
          lastName: owner.lastName || '',
          phone: owner.phone,
          type: 'owner',
          userRole: 'owner',
          createdAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userType', 'owner');
        
        // Update store state
        set({ user, userType: 'owner' });
        
        return { success: true, requiresApproval: true };
      } 
      else if (userData.userType === 'user' && response.data.userRole === 'customer') {
        // Customer registration successful with token
        if (response.data.token) {
          await AsyncStorage.setItem('customerToken', response.data.token);
          
          // Store user data
          const user: User = {
            id: response.data.userId,
            email: userData.email,
            firstName: response.data.firstName || userData.firstName,
            lastName: response.data.lastName || userData.lastName || '',
            phone: userData.phone,
            type: 'user',
            userRole: 'customer',
            createdAt: new Date().toISOString()
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('userType', 'user');
          
          // Update store state
          set({ user, userType: 'user' });
        }
        
        return { success: true, requiresApproval: false };
      }
    }
    
    return { success: false, message: 'Registration failed' };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed';
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    
    return { success: false, message: errorMessage };
  }
},

  initializeStore: async () => {
    try {
      const [userData, userTypeData] = await AsyncStorage.multiGet(['user', 'userType']);
      
      console.log("Loaded user data from storage:", userData[1]);
      
      if (userData[1]) {
        const parsedUser = JSON.parse(userData[1]);
        console.log("Parsed user data:", parsedUser);
        set({ user: parsedUser });
      }
      
      if (userTypeData[1]) {
        console.log("User type from storage:", userTypeData[1]);
        set({ userType: userTypeData[1] as 'user' | 'owner' });
      }
      
      // Fetch vehicles when app initializes
      const store = get();
      await store.fetchAllVehicles();
      
      // Fetch bookings if user is logged in and is a customer
      if (userData[1] && userTypeData[1] === 'user') {
        await store.fetchMyBookings();
      }
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },
}));

function mapBackendBookingToFrontend(backendBooking: BackendBooking): Booking {
  const BASE_URL = API_URL?.replace(/\/api$/, "");
  const adjustedBaseUrl = getAdjustedUrl(BASE_URL || '');
  
  // Add null checks for all required nested objects
  if (!backendBooking) {
    throw new Error('Backend booking is null or undefined');
  }

  if (!backendBooking.vehicle) {
    console.warn(`⚠️  Skipping booking ${backendBooking._id}: Vehicle data is missing (likely deleted)`);
    throw new Error('Vehicle data is missing from booking');
  }

  if (!backendBooking.owner) {
    console.warn(`⚠️  Skipping booking ${backendBooking._id}: Owner data is missing (likely deleted)`);
    throw new Error('Owner data is missing from booking');
  }

  if (!backendBooking.customer) {
    console.warn(`⚠️  Skipping booking ${backendBooking._id}: Customer data is missing`);
    throw new Error('Customer data is missing from booking');
  }
  
  // Map the car data from the vehicle in the booking
  const car: Car = {
    id: backendBooking.vehicle._id || 'unknown',
    ownerId: backendBooking.owner._id || 'unknown',
    make: backendBooking.vehicle.brand || 'Unknown',
    model: backendBooking.vehicle.model || 'Unknown',
    year: parseInt(backendBooking.vehicle.year) || new Date().getFullYear(),
    image: backendBooking.vehicle.images && backendBooking.vehicle.images.length > 0
      ? `${adjustedBaseUrl}/uploads/vehicles/${backendBooking.vehicle.images[0]}`
      : 'https://via.placeholder.com/400x300?text=No+Image',
    pricePerDay: backendBooking.vehicle.pricePerDay || 0,
    pricePerKm: backendBooking.vehicle.pricePerDistance || 0,
    location: backendBooking.vehicle.location || backendBooking.vehicle.pickupAddress || 'Unknown',
    available: true,
    unavailableDates: [],
    features: ['AC', 'GPS', 'Bluetooth'],
    withDriver: false,
    driverIncluded: false,
    rating: 0,
    reviews: 0,
    fuel: '',
    transmission: 'Automatic',
    seats: 5,
    description: 'No description provided',
    contactPhone: backendBooking.owner.phoneNumber || '',
    contactEmail: backendBooking.owner.email || '',
  };

  return {
    id: backendBooking._id || 'unknown',
    userId: backendBooking.customer._id || 'unknown',
    carId: backendBooking.vehicle._id || 'unknown',
    ownerId: backendBooking.owner._id || 'unknown',
    startDate: backendBooking.pickupDate || '',
    endDate: backendBooking.dropoffDate || '',
    totalPrice: backendBooking.totalAmount || 0,
    status: backendBooking.bookingStatus as 'pending' | 'confirmed' | 'cancelled' | 'completed' || 'pending',
    paymentStatus: backendBooking.paymentStatus as 'pending' | 'paid' || 'pending',
    pickupLocation: backendBooking.pickupLocation || '',
    dropoffLocation: backendBooking.dropoffLocation || '',
    withDriver: false, // This info is not in the backend booking, might need to get it from vehicle
    createdAt: backendBooking.createdAt || new Date().toISOString(),
    car: car,
  };
}

function mapVehicleToCar(vehicle: any): Car {
  let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
  
  if (vehicle.images && vehicle.images.length > 0) {
    // Check if the image path is already a full URL
    if (vehicle.images[0].startsWith('http')) {
      imageUrl = vehicle.images[0];
    } else {
      // Fix: Don't add /uploads/vehicles/ if it's already in the path
      const adjustedBaseUrl = getAdjustedUrl(BASE_URL || '');
      
      // Check if the image path already contains the upload directory
      if (vehicle.images[0].startsWith('uploads/vehicles/') || 
          vehicle.images[0].startsWith('/uploads/vehicles/')) {
        // Just use the path as is with the base URL
        imageUrl = `${adjustedBaseUrl}${vehicle.images[0].startsWith('/') ? '' : '/'}${vehicle.images[0]}`;
      } else {
        // Add the uploads path if it's not already there
        imageUrl = `${adjustedBaseUrl}/uploads/vehicles/${vehicle.images[0]}`;
      }
    }
  }
  
  console.log('Fixed Image URL:', imageUrl);
  return {
    id: vehicle._id || vehicle.id,
    ownerId: vehicle.owner || 'unknown',
    make: vehicle.brand,
    model: vehicle.model,
    year: parseInt(vehicle.year) || new Date().getFullYear(),
    image: imageUrl,
    // Rest of your mapping remains the same
    pricePerDay: vehicle.pricePerDay,
    pricePerKm: vehicle.pricePerDistance,
    location: vehicle.location || vehicle.pickupAddress,
    available: vehicle.isAvailable,
    unavailableDates: vehicle.unavailableDates 
      ? vehicle.unavailableDates.map((date: any) => date.startDate.split('T')[0]) 
      : [],
    features: ['AC', 'GPS', 'Bluetooth'],
    withDriver: vehicle.isDriverAvailable,
    driverIncluded: false,
    rating: vehicle.rating || 0,
    reviews: vehicle.reviewCount || 0,
    fuel: vehicle.fuelType,
    transmission: vehicle.transmission,
    seats: vehicle.noSeats,
    description: vehicle.description || 'No description provided',
    contactPhone: vehicle.phoneNumber?.toString() || '',
    contactEmail: vehicle.email || '',
  };
}