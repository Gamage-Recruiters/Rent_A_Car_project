import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getAdjustedUrl = (url: string) => {
  if (Platform.OS === 'android' && url && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

const adjustedApiUrl = getAdjustedUrl(API_URL || '');

export interface BackendReview {
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
    vehicleName: string;
    vehicleLicenseNumber: string;
    brand: string;
    model: string;
    year: string;
    images?: string[];
    vehicleType?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  vehicle: string;
  rating: number;
  comment: string;
  booking?: string; // Optional booking ID for booking-specific reviews
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

class ReviewService {
  // Create a new review
  async createReview(reviewData: CreateReviewRequest, token: string): Promise<BackendReview> {
    try {
      const response = await axios.post(
        `${adjustedApiUrl}/customer/review`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create review');
      }
    } catch (error: any) {
      console.error('Create review error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create review'
      );
    }
  }

  // Create a booking-specific review
  async createBookingReview(bookingId: string, reviewData: CreateReviewRequest, token: string): Promise<BackendReview> {
    try {
      const response = await axios.post(
        `${adjustedApiUrl}/customer/review/booking/${bookingId}`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create booking review');
      }
    } catch (error: any) {
      console.error('Create booking review error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create booking review'
      );
    }
  }

  // Get all reviews (public endpoint)
  async getAllReviews(): Promise<BackendReview[]> {
    try {
      const response = await axios.get(`${adjustedApiUrl}/customer/review/all`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }
    } catch (error: any) {
      console.error('Get all reviews error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch reviews'
      );
    }
  }

  // Get reviews for a specific vehicle
  async getVehicleReviews(vehicleId: string): Promise<BackendReview[]> {
    try {
      const response = await axios.get(`${adjustedApiUrl}/customer/review/vehicle/${vehicleId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch vehicle reviews');
      }
    } catch (error: any) {
      console.error('Get vehicle reviews error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vehicle reviews'
      );
    }
  }

  // Get current user's reviews
  async getMyReviews(token: string): Promise<BackendReview[]> {
    try {
      const response = await axios.get(
        `${adjustedApiUrl}/customer/review/my-reviews`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch your reviews');
      }
    } catch (error: any) {
      console.error('Get my reviews error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch your reviews'
      );
    }
  }

  // Update a review
  async updateReview(reviewId: string, reviewData: UpdateReviewRequest, token: string): Promise<BackendReview> {
    try {
      const response = await axios.put(
        `${adjustedApiUrl}/customer/review/${reviewId}`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update review');
      }
    } catch (error: any) {
      console.error('Update review error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update review'
      );
    }
  }

  // Delete a review
  async deleteReview(reviewId: string, token: string): Promise<void> {
    try {
      const response = await axios.delete(
        `${adjustedApiUrl}/customer/review/${reviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete review');
      }
    } catch (error: any) {
      console.error('Delete review error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete review'
      );
    }
  }

  // Get vehicle rating and review count
  async getVehicleRating(vehicleId: string): Promise<{ rating: number; reviewCount: number }> {
    try {
      const response = await axios.get(`${adjustedApiUrl}/customer/review/rating/${vehicleId}`);
      
      if (response.data.success) {
        return {
          rating: response.data.data.rating,
          reviewCount: response.data.data.reviewCount,
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch vehicle rating');
      }
    } catch (error: any) {
      console.error('Get vehicle rating error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vehicle rating'
      );
    }
  }
}

export const reviewService = new ReviewService();