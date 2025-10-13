import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAdjustedUrl = (url: string) => {
  if (Platform.OS === 'android' && url && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

const adjustedApiUrl = getAdjustedUrl(API_URL || '');

console.log('BookingService initialized with API_URL:', API_URL);
console.log('BookingService adjusted URL:', adjustedApiUrl);

export interface BackendBooking {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  vehicle: {
    _id: string;
    vehicleName?: string;
    vehicleLicenseNumber?: string;
    brand: string;
    model: string;
    year: string;
    images?: string[];
    pricePerDay: number;
    pricePerDistance?: number;
    location?: string;
    pickupAddress?: string;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  idDocument: string[];
  drivingLicenseDocument: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  vehicle: string;
  owner: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
}

class BookingService {
  // Get authorization token
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try multiple token keys for compatibility
      const customerToken = await AsyncStorage.getItem('customerToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      return customerToken || accessToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Create a new booking with document upload
  async createBooking(
    bookingData: CreateBookingRequest,
    idImages: { uri: string; type: string; name: string }[],
    licenseImages: { uri: string; type: string; name: string }[]
  ): Promise<BackendBooking> {
    try {
      const token = await this.getAuthToken();
      console.log('BookingService: Token check:', token ? 'Found' : 'Not found - proceeding anyway for testing');

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append booking data
      Object.keys(bookingData).forEach(key => {
        formData.append(key, (bookingData as any)[key]);
      });

      // Append ID document images
      idImages.forEach((image, index) => {
        formData.append('customerIdImage', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      });

      // Append license document images
      licenseImages.forEach((image, index) => {
        formData.append('customerLicenseImage', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      });

      console.log('BookingService: Making request to:', `${adjustedApiUrl}/customer/booking/create`);
      console.log('BookingService: Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.post(
        `${adjustedApiUrl}/customer/booking/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        return response.data.booking;
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Create booking error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create booking'
      );
    }
  }

  // Get current user's bookings
  async getMyBookings(): Promise<BackendBooking[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(
        `${adjustedApiUrl}/customer/booking/my-bookings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        return response.data.bookings;
      } else {
        throw new Error(response.data.message || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Get my bookings error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch bookings'
      );
    }
  }

  // Get a specific booking by ID
  async getBookingById(bookingId: string): Promise<BackendBooking> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(
        `${adjustedApiUrl}/customer/booking/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        return response.data.booking;
      } else {
        throw new Error(response.data.message || 'Failed to fetch booking');
      }
    } catch (error: any) {
      console.error('Get booking by ID error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch booking'
      );
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<BackendBooking> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(
        `${adjustedApiUrl}/customer/booking/cancel/${bookingId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.booking;
      } else {
        throw new Error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to cancel booking'
      );
    }
  }

  // Update a booking
  async updateBooking(
    bookingId: string, 
    updateData: {
      pickupLocation?: string;
      dropoffLocation?: string;
      pickupDate?: string;
      dropoffDate?: string;
      totalAmount?: number;
    }
  ): Promise<BackendBooking> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const updateUrl = `${adjustedApiUrl}/customer/booking/update/${bookingId}`;
      console.log('BookingService: Updating booking at URL:', updateUrl);
      console.log('BookingService: Update data:', updateData);
      console.log('BookingService: Token:', token ? 'Token exists' : 'No token');

      const response = await axios.put(
        updateUrl,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.booking;
      } else {
        throw new Error(response.data.message || 'Failed to update booking');
      }
    } catch (error: any) {
      console.error('Update booking error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update booking'
      );
    }
  }
}

export const bookingService = new BookingService();