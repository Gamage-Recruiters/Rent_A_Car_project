export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  type: 'user' | 'owner'|'admin';
  createdAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'hatchback' | 'luxury' | 'sports' | 'van';
  pricePerDay: number;
  pricePerKm?: number;
  location: string;
  images: string[];
  features: string[];
  hasDriver: boolean;
  availability: {
    from: string;
    to: string;
  };
  unavailableDates: string[];
  rating: number;
  reviewCount: number;
  description: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  mileage: number;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export interface SearchFilters {
  location: string;
  startDate: string;
  endDate: string;
  vehicleType: string;
  priceRange: [number, number];
  hasDriver: boolean | null;
  transmission: string;
  fuelType: string;
}

export interface Inquiry {
  id: number;
  profileImage: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}