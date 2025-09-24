import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
  fuel: string;
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
  setUser: (user: User | null) => void;
  setUserType: (type: 'user' | 'owner' | null) => void;
  setCars: (cars: Car[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setAllCars: (cars: Car[]) => void;
  addCar: (car: Car) => void;
  updateCar: (carId: string, updates: Partial<Car>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  logout: () => void;
  initializeStore: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userType: null,
  cars: [],
  bookings: [],
  allCars: mockCars,
  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
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
  updateBooking: (bookingId, updates) => {
    const { bookings } = get();
    set({ 
      bookings: bookings.map(booking => 
        booking.id === bookingId ? { ...booking, ...updates } : booking
      )
    });
  },
  logout: () => {
    set({ user: null, userType: null, cars: [], bookings: [] });
    AsyncStorage.multiRemove(['user', 'userType']);
  },
  initializeStore: async () => {
    try {
      const [userData, userTypeData] = await AsyncStorage.multiGet(['user', 'userType']);
      
      if (userData[1]) {
        set({ user: JSON.parse(userData[1]) });
      }
      
      if (userTypeData[1]) {
        set({ userType: userTypeData[1] as 'user' | 'owner' });
      }
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },
}));