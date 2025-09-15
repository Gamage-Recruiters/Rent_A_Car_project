import { Vehicle, Review, Inquiry} from '../types/index';
import { User } from "lucide-react";


export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    _id: '1', // Included for backward compatibility
    name: 'Toyota Camry 2023',
    isAvailable: true,
    isApproved: true,
    vehicleName: 'Toyota Camry 2023',
    vehicleLicenseNumber: 'ABC123',
    brand: 'Toyota',
    model: 'Camry',
    year: '2023',
    type: 'sedan',
    images: [
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Comfortable and reliable sedan perfect for city driving and long trips.',
    seats: 5,
    fuelType: 'petrol',
    transmission: 'automatic',
    isDriverAvailable: false,
    availability: true,
    pricePerDay: 45,
    pricePerKm: 0.5,
    location: 'Downtown',
    ownerId: 'owner1',
    contactInfo: {
      phone: '+1234567890',
      email: 'owner1@example.com',
      address: '123 Main St, Downtown'
    },
    unavailableDates: ['2024-01-15', '2024-01-16'],
    __v: 0,
    rating: 4.8,
    reviewCount: 24,
    features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera'],
    mileage: 15.2,
    status: 'approved'
  },
  {
    id: '2',
    _id: '2',
    name: 'Honda CR-V 2024',
    isAvailable: true,
    isApproved: true,
    vehicleName: 'Honda CR-V 2024',
    vehicleLicenseNumber: 'XYZ789',
    brand: 'Honda',
    model: 'CR-V',
    year: '2024',
    type: 'suv',
    images: [
      'https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Spacious SUV with advanced safety features and excellent fuel economy.',
    seats: 7,
    fuelType: 'petrol',
    transmission: 'automatic',
    isDriverAvailable: true,
    availability: true,
    pricePerDay: 65,
    pricePerKm: 0.7,
    location: 'Airport',
    ownerId: 'owner2',
    contactInfo: {
      phone: '+1234567891',
      email: 'owner2@example.com',
      address: '456 Airport Rd, Airport'
    },
    unavailableDates: [],
    __v: 0,
    rating: 4.9,
    reviewCount: 18,
    features: ['AWD', 'Sunroof', 'Heated Seats', 'Apple CarPlay'],
    mileage: 12.8,
    status: 'approved'
  },
  {
    id: '3',
    _id: '3',
    name: 'BMW X5 2023',
    isAvailable: true,
    isApproved: false,
    vehicleName: 'BMW X5 2023',
    vehicleLicenseNumber: 'BMW456',
    brand: 'BMW',
    model: 'X5',
    year: '2023',
    type: 'suv',
    images: [
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Luxury SUV with premium features and powerful performance.',
    seats: 5,
    fuelType: 'diesel',
    transmission: 'automatic',
    isDriverAvailable: false,
    availability: true,
    pricePerDay: 85,
    pricePerKm: 0.9,
    location: 'City Center',
    ownerId: 'owner1',
    contactInfo: {
      phone: '+1234567890',
      email: 'owner1@example.com',
      address: '789 City Center Blvd, City Center'
    },
    unavailableDates: ['2024-01-20', '2024-01-21'],
    __v: 0,
    rating: 4.7,
    reviewCount: 15,
    features: ['Leather Seats', 'Navigation', 'Heated Seats', 'Parking Sensors'],
    mileage: 10.5,
    status: 'pending'
  },
  {
    id: '4',
    _id: '4',
    name: 'Tesla Model 3 2024',
    isAvailable: true,
    isApproved: true,
    vehicleName: 'Tesla Model 3 2024',
    vehicleLicenseNumber: 'TES789',
    brand: 'Tesla',
    model: 'Model 3',
    year: '2024',
    type: 'sedan',
    images: [
      'https://images.pexels.com/photos/3778260/pexels-photo-3778260.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/168938/pexels-photo-168938.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Electric sedan with cutting-edge technology and eco-friendly performance.',
    seats: 5,
    fuelType: 'electric',
    transmission: 'automatic',
    isDriverAvailable: false,
    availability: true,
    pricePerDay: 75,
    pricePerKm: 0.6,
    location: 'Downtown',
    ownerId: 'owner2',
    contactInfo: {
      phone: '+1234567891',
      email: 'owner2@example.com',
      address: '456 Airport Rd, Airport'
    },
    unavailableDates: [],
    __v: 0,
    rating: 4.9,
    reviewCount: 20,
    features: ['Autopilot', 'Touchscreen Display', 'Fast Charging', 'Bluetooth'],
    mileage: 0, // Electric vehicle
    status: 'approved'
  }
];

// export const mockVehicles: Vehicle[] = [
//   {
//     id: '1',
//     ownerId: 'owner1',     
//     name: 'Toyota Camry 2023',
//     brand: 'Toyota',
//     model: 'Camry',
//     year: 2023,
//     type: 'sedan',
//     pricePerDay: 45,
//     pricePerKm: 0.5,
//     location: 'Downtown',
//     images: [
//       'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
//       'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
//     ],
//     features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera'],
//     hasDriver: false,
//     availability: {
//       from: '2024-01-01',
//       to: '2024-12-31'
//     },
//     unavailableDates: ['2024-01-15', '2024-01-16'],
//     rating: 4.8,
//     reviewCount: 24,
//     description: 'Comfortable and reliable sedan perfect for city driving and long trips.',
//     fuelType: 'petrol',
//     transmission: 'automatic',
//     seats: 5,
//     mileage: 15.2,
//     contactInfo: {
//       phone: '+1234567890',
//       email: 'owner1@example.com',
//       address: '123 Main St, Downtown'
//     }
//   },
//   {
//     id: '2',
//     ownerId: 'owner2',
//     name: 'Honda CR-V 2024',
//     brand: 'Honda',
//     model: 'CR-V',
//     year: 2024,
//     type: 'suv',
//     pricePerDay: 65,
//     pricePerKm: 0.7,
//     location: 'Airport',
//     images: [
//       'https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=800',
//       'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800'
//     ],
//     features: ['AWD', 'Sunroof', 'Heated Seats', 'Apple CarPlay'],
//     hasDriver: true,
//     availability: {
//       from: '2024-01-01',
//       to: '2024-12-31'
//     },
//     unavailableDates: [],
//     rating: 4.9,
//     reviewCount: 18,
//     description: 'Spacious SUV with advanced safety features and excellent fuel economy.',
//     fuelType: 'petrol',
//     transmission: 'automatic',
//     seats: 7,
//     mileage: 12.8,
//     contactInfo: {
//       phone: '+1234567891',
//       email: 'owner2@example.com',
//       address: '456 Airport Rd, Airport'
//     }
//   },
//   {
//     id: '3',
//     ownerId: 'owner3',
//     name: 'BMW X5 2023',
//     brand: 'BMW',
//     model: 'X5',
//     year: 2023,
//     type: 'luxury',
//     pricePerDay: 120,
//     pricePerKm: 1.2,
//     location: 'City Center',
//     images: [
//       'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800',
//       'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
//     ],
//     features: ['Premium Sound', 'Leather Interior', 'Panoramic Roof', 'Adaptive Cruise Control'],
//     hasDriver: true,
//     availability: {
//       from: '2024-01-01',
//       to: '2024-12-31'
//     },
//     unavailableDates: ['2024-01-20', '2024-01-21', '2024-01-22'],
//     rating: 4.9,
//     reviewCount: 32,
//     description: 'Luxury SUV with premium features and exceptional performance.',
//     fuelType: 'petrol',
//     transmission: 'automatic',
//     seats: 5,
//     mileage: 10.5,
//     contactInfo: {
//       phone: '+1234567892',
//       email: 'owner3@example.com',
//       address: '789 Luxury Ave, City Center'
//     }
//   },
//   {
//     id: '4',
//     ownerId: 'owner4',
//     name: 'Tesla Model 3 2024',
//     brand: 'Tesla',
//     model: 'Model 3',
//     year: 2024,
//     type: 'sedan',
//     pricePerDay: 85,
//     pricePerKm: 0.3,
//     location: 'Tech District',
//     images: [
//       'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=800',
//       'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
//     ],
//     features: ['Autopilot', 'Supercharging', 'Premium Connectivity', 'Glass Roof'],
//     hasDriver: false,
//     availability: {
//       from: '2024-01-01',
//       to: '2024-12-31'
//     },
//     unavailableDates: [],
//     rating: 4.7,
//     reviewCount: 15,
//     description: 'Electric sedan with cutting-edge technology and zero emissions.',
//     fuelType: 'electric',
//     transmission: 'automatic',
//     seats: 5,
//     mileage: 0,
//     contactInfo: {
//       phone: '+1234567893',
//       email: 'owner4@example.com',
//       address: '321 Tech Blvd, Tech District'
//     }
//   }
// ];

export const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    vehicleId: '1',
    rating: 5,
    comment: 'Excellent car! Very clean and comfortable. The owner was very responsive.',
    createdAt: '2024-01-10T10:00:00Z',
    userName: 'John Smith'
  },
  {
    id: '2',
    userId: 'user2',
    vehicleId: '1',
    rating: 4,
    comment: 'Good experience overall. The car was as described and pickup was smooth.',
    createdAt: '2024-01-08T14:30:00Z',
    userName: 'Sarah Johnson'
  },
  {
    id: '3',
    userId: 'user3',
    vehicleId: '2',
    rating: 5,
    comment: 'Amazing SUV! Perfect for our family trip. The driver was professional and friendly.',
    createdAt: '2024-01-05T09:15:00Z',
    userName: 'Mike Davis'
  }
];


export const inquiries: Inquiry[] = [
  {
    id: 1,
    profileImage: "/images/user1.jpg",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    subject: "Booking Inquiry",
    message: "I have a question about my order status."
  },
  {
    id: 2,
    profileImage: "/images/user2.jpg",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 987 654 321",
    subject: "Customer Support",
    message: "How can I return an item I purchased?"
  },
  {
    id: 3,
    profileImage: "/images/user2.jpg",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 987 654 321",
    subject: "Become Partner",
    message: "How can I return an item I purchased?"
  },
  {
    id: 4,
    profileImage: "/images/user2.jpg",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 987 654 321",
    subject: "Feedback",
    message: "How can I return an item I purchased?"
  },
  {
    id: 4,
    profileImage: "/images/user2.jpg",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 987 654 321",
    subject: "Other",
    message: "How can I return an item I purchased?"
  }
];
