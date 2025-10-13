export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneNumber?: string;
  type: 'user' | 'owner' | 'admin';
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
  image?: {
    public_id?: string;
    url?: string;
  };
}

export interface Vehicle {
  id: string;
  _id?: string; // Keep for backward compatibility
  name: string;
  isAvailable: boolean;
  isApproved: boolean;
  vehicleName: string;
  vehicleLicenseNumber: string;
  vehicleType?: string; // Keep for backward compatibility
  brand: string;
  model: string;
  year: string;
  type: string; // Changed from vehicleType
  images: string[];
  description: string;
  seats: number; // Changed from noSeats
  fuelType: string;
  transmission: string;
  isDriverAvailable: boolean;
  availability: boolean;
  pickupAddress?: string;
  pricePerDay: number;
  pricePerDistance?: number;
  pricePerKm?: number; // Changed from pricePerDistance
  location: string;
  phoneNumber?: string | number;
  email: string;
  ownerId?: string;
  owner?: {
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string | number;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  unavailableDates: string[];
  __v?: number;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  noSeats?: number; // Keep for backward compatibility
  mileage?: number;
  status?: 'pending' | 'approved' | 'rejected';
  views?: number;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  ownerId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
  requestedAt: string;
  confirmationCode?: string;
  notes?: string;
}

export interface Review {
   _id?: string;
  id?: string;  // Support both formats
  customer?: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    photo?: string;
  };
  vehicle?: {
    _id?: string;
    id?: string;
    vehicleName?: string;
    vehicleLicenseNumber?: string;
    brand?: string;
    model?: string;
    year?: string;
    images?: string[];
    vehicleType?: string;
  };
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
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



// export interface User {
//   id: string;
//   email: string;
//   name?: string;
//   firstName?: string;
//   lastName?: string;
//   phone?: string;
//   phoneNumber?: string; // Add this to match backend model
//   type: 'user' | 'owner'|'admin';
//   createdAt: string;
//   profileImage?: string;
//   photo?: string;
//   image?: { 
//     public_id?: string;
//     url?: string;
//   };
//   googleId?: string; 
//   dateOfBirth?: string;
//   driversLicense?: string;
//   emergencyContact?: string;
//   address?: string;
//   isNewsletterSubscribed?: boolean;
//   newsletterSubscribedAt?: string;
//   newsletterUnsubscribedAt?: string;
//   userRole?: string; 
// }



// export interface Vehicle {
//   _id: string;
//   name:string;
//   isAvailable: boolean;
//   isApproved: boolean;
//   vehicleName: string; 
//   vehicleLicenseNumber: string;
//   brand: string;
//   model: string;
//   year: string;
//   vehicleType: string; 
//   images: string[];
//   description: string;
//   noSeats: number; 
//   fuelType: string; 
//   transmission: string; 
//   isDriverAvailable: boolean;
//   availability:boolean
//   pricePerDay: number;
//   pricePerDistance: number; 
//   phoneNumber: number; 
//   //pickupAddress: string; 
//   location: string;
//   owner: {
//     _id: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//   };
//   unavailableDates: string[];
//   __v: number;
  
//   // Optional 
//   rating?: number;
//   reviewCount?: number;
//   features?: string[];
//   mileage?: number;
//   status?: string;
// }

// export interface Booking {
//   id: string;
//   userId: string;
//   vehicleId: string;
//   ownerId: string;
//   startDate: string;
//   endDate: string;
//   totalDays: number;
//   totalPrice: number;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   pickupLocation: string;
//   dropoffLocation: string;
//   createdAt: string;
//   notes?: string;
// }

// export interface Review {
//   id: string;
//   userId: string;
//   vehicleId: string;
//   rating: number;
//   comment: string;
//   createdAt: string;
//   userName: string;
// }

// export interface SearchFilters {
//   location: string;
//   startDate: string;
//   endDate: string;
//   vehicleType: string;
//   priceRange: [number, number];
//   hasDriver: boolean | null;
//   transmission: string;
//   fuelType: string;
// }

// export interface Inquiry {
//   id: number;
//   profileImage: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   subject: string;
//   message: string;
// }




// export interface Vehicle {
//   _id: string;
//   ownerId: string;
//   name: string;
//   brand: string;
//   model: string;
//   year: number;
//   type: 'sedan' | 'suv' | 'hatchback' | 'luxury' | 'sports' | 'van';
//   pricePerDay: number;
//   pricePerKm?: number;
//   location: string;
//   images: string[];
//   features: string[];
//   hasDriver: boolean;
//   availability: {
//     from: string;
//     to: string;
//   };
//   unavailableDates: string[];
//   rating: number;
//   reviewCount: number;
//   description: string;
//   fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
//   transmission: 'manual' | 'automatic';
//   seats: number;
//   mileage: number;
//   contactInfo: {
//     phone: string;
//     email: string;
//     address: string;
//   };
//   status?: 'pending' | 'approved' | 'rejected';
// }