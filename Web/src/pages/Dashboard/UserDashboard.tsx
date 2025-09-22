import React, { useState } from 'react';
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


const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

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

  const favoriteVehicles = mockVehicles.slice(0, 3);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
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
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Recent Bookings</h3>
                    <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                      <Plus className="w-4 h-4" />
                      <span>Book New Car</span>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {userBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <img
                          src={booking.vehicle.images[0]}
                          alt={booking.vehicle.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{booking.vehicle.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.pickupLocation}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.startDate} to {booking.endDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${booking.totalPrice}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <h3 className="text-xl font-semibold">My Bookings</h3>
                    <div className="flex space-x-2">
                      <select
                        value={bookingFilter}
                        onChange={(e) => setBookingFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Bookings</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={booking.vehicle.images[0]}
                              alt={booking.vehicle.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{booking.vehicle.name}</h4>
                              <p className="text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.pickupLocation}
                              </p>
                              <p className="text-sm text-gray-500">Booking Code: {booking.bookingCode}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{booking.startDate} to {booking.endDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">${booking.totalPrice}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Payment: {booking.paymentStatus}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/vehicle/${booking.vehicleId}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Vehicle
                          </Link>
                          {booking.status === 'completed' && (
                            <Link
                              to={`/write-review/${booking.vehicleId}`} // Navigate to the review page with vehicle ID
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                            >
                              Write Review
                            </Link>
                          )}
                          {booking.status === 'confirmed' && (
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                              Contact Owner
                            </button>
                          )}
                          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold mb-6">Favorite Vehicles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.name}
                        className="w-full h-40 rounded-lg object-cover mb-4"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{vehicle.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vehicle.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">${vehicle.pricePerDay}/day</span>
                        <div className="flex space-x-2">
                          <button className="text-red-600 hover:text-red-700">
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                          <Link
                            to={`/vehicle/${vehicle.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold mb-6">Rental History</h3>
                <div className="space-y-4">
                  {userBookings.filter(b => b.status === 'completed').map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={booking.vehicle.images[0]}
                          alt={booking.vehicle.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{booking.vehicle.name}</h4>
                          <p className="text-sm text-gray-600">{booking.startDate} - {booking.endDate}</p>
                          <p className="text-sm text-gray-500">{booking.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${booking.totalPrice}</p>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          Book Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                          <p className="font-medium">{booking.vehicle.name}</p>
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
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold mb-6">Profile Settings</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driver's License
                      </label>
                      <input
                        type="text"
                        placeholder="License number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        placeholder="Emergency contact number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium mb-4">Preferences</h4>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Email notifications for booking updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">SMS notifications for important updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Marketing emails and promotions</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;