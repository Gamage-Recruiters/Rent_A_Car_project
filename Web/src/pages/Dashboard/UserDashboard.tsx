import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  User, Calendar, Car, Heart, Settings, CreditCard,
  MapPin, Clock, Star, Phone, Mail, Edit3, Plus,
  Download, Eye, MessageCircle, Filter, Search,
  CheckCircle, XCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockVehicles } from '../../data/mockData';
import PaymentModal from './PaymentModal';
import ProfileTab from './User/ProfileTab';
import BookingTab from './User/BookingTab';
import FavoriteTab from './User/FavoriteTab';
import RentalHistoryTab from './User/RentalHistoryTab';
import RecentBookingsTab from './User/RecentBookingsTab';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteVehicles, setFavoriteVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
  if (user) {
    fetchFavorites();
  } else {
    setLoading(false);
  }
}, [user]);

const fetchFavorites = async () => {
  try {
    setLoading(true);
    
    const response = await axios.get(`${API_URL}/customer/favorite/list`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      setFavoriteVehicles(response.data.favorites || []);
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    setFavoriteVehicles([]);
  } finally {
    setLoading(false);
  }
};

  const handleOpenModal = () => {
    setPaymentModalOpen(true);
  };

  const handleCloseModal = () => {
    setPaymentModalOpen(false);
  };


  // Mock user data with more comprehensive information
  const userBookings = [
    {
      id: '1',
      vehicleId: '1',
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      status: 'confirmed',
      totalPrice: 135,
      vehicle: mockVehicles[0],
      pickupLocation: 'Downtown Office',
      bookingCode: 'RC-ABC123',
      paymentStatus: 'paid'
    },
    {
      id: '2',
      vehicleId: '2',
      startDate: '2024-01-10',
      endDate: '2024-01-12',
      status: 'completed',
      totalPrice: 130,
      vehicle: mockVehicles[1],
      pickupLocation: 'Airport Terminal',
      bookingCode: 'RC-DEF456',
      paymentStatus: 'paid'
    },
    {
      id: '3',
      vehicleId: '3',
      startDate: '2024-02-01',
      endDate: '2024-02-03',
      status: 'pending',
      totalPrice: 240,
      vehicle: mockVehicles[2],
      pickupLocation: 'City Center',
      bookingCode: 'RC-GHI789',
      paymentStatus: 'pending'
    },
    {
      id: '4',
      vehicleId: '1',
      startDate: '2024-01-05',
      endDate: '2024-01-07',
      status: 'cancelled',
      totalPrice: 90,
      vehicle: mockVehicles[0],
      pickupLocation: 'Downtown Office',
      bookingCode: 'RC-JKL012',
      paymentStatus: 'refunded'
    }
  ];

  const recentSearches = [
    { location: 'Downtown', date: '2024-01-20', vehicleType: 'sedan' },
    { location: 'Airport', date: '2024-01-18', vehicleType: 'suv' },
    { location: 'City Center', date: '2024-01-15', vehicleType: 'luxury' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'history', label: 'Rental History', icon: Clock },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookingFilter === 'all'
    ? userBookings
    : userBookings.filter(booking => booking.status === bookingFilter);

  const totalSpent = userBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  const upcomingBookings = userBookings.filter(b =>
    b.status === 'confirmed' && new Date(b.startDate) > new Date()
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
          <p className="text-gray-600">Manage your bookings and explore new vehicles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 font-medium">Premium Member</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/search"
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Find a Car</span>
                </Link>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Support</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{userBookings.length}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +2 this month
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">${totalSpent}</p>
                        <p className="text-xs text-blue-600">Lifetime</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Upcoming Trips</p>
                        <p className="text-2xl font-bold text-gray-900">{upcomingBookings}</p>
                        <p className="text-xs text-orange-600">Next: Jan 15</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Favorite Cars</p>
                        <p className="text-2xl font-bold text-gray-900">{favoriteVehicles.length}</p>
                        <p className="text-xs text-red-600">Saved</p>
                      </div>
                      <Heart className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <RecentBookingsTab />

                {/* Recent Searches */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentSearches.map((search, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{search.location}</h4>
                          <span className="text-xs text-gray-500">{search.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{search.vehicleType}</p>
                        <button className="text-blue-600 text-sm hover:text-blue-700 mt-2">
                          Search Again
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <BookingTab />
            )}

            {activeTab === 'favorites' && (
              <FavoriteTab />
            )}

            {activeTab === 'history' && (
              <RentalHistoryTab />
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-6">Payment Methods</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium">**** **** **** 1234</p>
                          <p className="text-sm text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Primary</span>
                    </div>
                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 
                    text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                      onClick={handleOpenModal}>
                      + Add New Payment Method
                    </button>

                    <PaymentModal open={isPaymentModalOpen} onClose={handleCloseModal} />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-6">Transaction History</h3>
                  <div className="space-y-4">
                    {userBookings.filter(b => b.paymentStatus === 'paid').map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{booking.vehicle.vehicleName}</p>
                          <p className="text-sm text-gray-500">{booking.startDate}</p>
                          <p className="text-xs text-gray-400">ID: {booking.bookingCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${booking.totalPrice}</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;