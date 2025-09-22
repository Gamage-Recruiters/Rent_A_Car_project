import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Users, Fuel, Settings, MapPin, Phone, Mail, Calendar, 
  Shield, ArrowLeft, Heart, Share2, Copy, Facebook, Twitter, Check, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Vehicle, Review } from '../types';
import { useVehicle } from '../context/VehicleContext';
import axios from 'axios';
import BookingModal from './BookingModal';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '');

const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getVehicleById } = useVehicle();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // const [bookingDates, setBookingDates] = useState({
  //   startDate: '',
  //   endDate: '',
  //   notes: ''
  // });

  useEffect(() => {
    fetchVehicle();
    fetchVehicleReviews();
  }, [id]);

  useEffect(() => {
    if (user && vehicle) {
      checkIfFavorited();
    }
  }, [user, vehicle]);

  // Add this useEffect to handle clicking outside the share popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSharePopup) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('bg-black')) {
          setShowSharePopup(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSharePopup]);

  const checkIfFavorited = async () => {
    if (!user || !id) return;
  
    try {
      const response = await axios.get(`${API_URL}/customer/favorite/check/${id}`, {
        withCredentials: true
      });
      if (response.data?.success) {
        setIsFavorite(response.data.isFavorited || false); 
        setFavoriteId(response.data.favoriteId); 
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
    toast.error('Please login to add favorites');
    navigate('/login', { state: { from: `/vehicle/${id}` } });
    return;
  }

  if (!id) return;

  setFavoriteLoading(true);
  try {
    if (isFavorite) {
      // Use favoriteId for removal if available, otherwise use vehicle id
      const idToRemove = favoriteId || id;
      
      // Adjust the endpoint based on your backend route setup
      const response = await axios.delete(`${API_URL}/customer/favorite/remove/${idToRemove}`, {
        withCredentials: true
      });
      
      if (response.data?.success) {
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success('Removed from favorites');
      }
    } else {
      // Change payload to match controller expectations
      const response = await axios.post(`${API_URL}/customer/favorite/add`, {
        vehicleId: id  // Changed from 'vehicle' to 'vehicleId'
      }, {
        withCredentials: true
      });
      
      if (response.data?.success) {
        setIsFavorite(true);
        // Store the new favorite ID if available in the response
        if (response.data.favorite && response.data.favorite._id) {
          setFavoriteId(response.data.favorite._id);
        }
        toast.success('Added to favorites');
      }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    } else {
      toast.error('An error occurred while updating favorites');
    }
  } finally {
    setFavoriteLoading(false);
  }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  // Function to copy link to clipboard
  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  // Social sharing functions
  // Wrap social sharing functions with try-catch
  const shareToFacebook = () => {
    try {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this ${vehicleName} for rent!`);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      toast.error('Failed to open Facebook share');
    }
  };

  const shareToTwitter = () => {
    try {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this ${vehicleName} for rent! ${vehicle?.pricePerDay ? `$${vehicle.pricePerDay}/day` : ''}`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      toast.error('Failed to open Twitter share');
    }
  };

  const shareToWhatsApp = () => {
    try {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Check out this ${vehicleName} for rent! ${vehicle?.pricePerDay ? `$${vehicle.pricePerDay}/day` : ''} - ${url}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      toast.error('Failed to open WhatsApp share');
    }
  };
  
  const fetchVehicle = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getVehicleById(id);
      setVehicle(data);
    } catch (err) {
      setError('Failed to load vehicle details');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleReviews = async () => {
    if (!id) return;

    setReviewsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/customer/review/vehicle/${id}`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/customer/review/${reviewId}`, {
        withCredentials: true
      });

      if (response.data?.success) {
        toast.success('Review deleted successfully');
        // Refresh reviews
        fetchVehicleReviews();
      } else {
        toast.error(response.data?.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/vehicle/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  // const calculateTotalPrice = () => {
  //   if (!vehicle || !bookingDates.startDate || !bookingDates.endDate) return 0;
    
  //   const start = new Date(bookingDates.startDate);
  //   const end = new Date(bookingDates.endDate);
  //   const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
  //   return days * vehicle.pricePerDay;
  // };

  const maskPhone = (p?: string | number) => {
    if (!p) return 'N/A';
    const digits = p.toString().replace(/\D/g, '');
    return digits.length > 2 ? `••• •• •• ${digits.slice(-2)}` : '•••';
  };

  const maskEmail = (e?: string) => {
    if (!e) return 'N/A';
    const [name, domain] = e.split('@');
    if (!domain) return '••••@••••';
    const maskedName = name.length <= 2 ? '••' : `${name[0]}••${name[name.length - 1]}`;
    return `${maskedName}@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The vehicle you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const owner = {
    name: vehicle.owner?.firstName && vehicle.owner?.lastName 
      ? `${vehicle.owner.firstName} ${vehicle.owner.lastName}`
      : 'Owner',
    phone: vehicle.contactInfo?.phone || 
         vehicle.phoneNumber?.toString() || 
         vehicle.owner?.phoneNumber?.toString(),
    email: vehicle.owner?.email,
    address: vehicle.pickupAddress,
    verified: true,
  };

  const constructImageUrl = (imagePath?: string) => {
  if (!imagePath) return '/placeholder-car.jpg';
  
  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /uploads, just add the base URL
  if (imagePath.startsWith('/uploads')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Otherwise, construct the path to the vehicles folder
  return `${BASE_URL}/uploads/vehicles/${imagePath}`;
};

// images variable definition
const images = vehicle.images && vehicle.images.length > 0 
  ? vehicle.images.map(img => constructImageUrl(img))
  : ['https://via.placeholder.com/600x400?text=No+Image+Available'];

  
  const vehicleName = vehicle.vehicleName || 'Vehicle';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImage]}
                alt={vehicleName}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favoriteLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  )}
                </button>

                {/* Share Button */}
                <button 
                  onClick={handleShare}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="Share this vehicle"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {showSharePopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Share this vehicle</h3>
                    <button
                      onClick={() => setShowSharePopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
              
                  {/* Copy Link */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Copy Link
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={window.location.href}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                      <button
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded-r-lg border border-l-0 border-gray-300 transition-colors ${
                          copySuccess 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {copySuccess ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Social Media Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Share on Social Media
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={shareToFacebook}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="text-sm">Facebook</span>
                      </button>
                      
                      <button
                        onClick={shareToTwitter}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">Twitter</span>
                      </button>
                      
                      <button
                        onClick={shareToWhatsApp}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowSharePopup(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${vehicleName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {vehicleName}
                </h1>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{vehicle.rating || 0}</span>
                  <span className="text-gray-500">({vehicle.reviewCount || 0} reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.pickupAddress}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {(vehicle.vehicleType || vehicle.type) 
                  ? (vehicle.vehicleType || vehicle.type).charAt(0).toUpperCase() + 
                    (vehicle.vehicleType || vehicle.type).slice(1) 
                  : 'Unspecified Type'}
                </span>
                {vehicle.isDriverAvailable && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Driver Available
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Owner Details</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{owner.name}</span>
                      {owner.verified && (
                        <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs">
                          <Shield className="w-3 h-3 mr-1" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>{(user || showBookingModal) ? (owner.phone || 'N/A') : maskPhone(owner.phone)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>{(user || showBookingModal) ? (owner.email || 'N/A') : maskEmail(owner.email)}</span>
                </div>
                <div className="flex items-center space-x-3 col-span-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{owner.address || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Vehicle Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.noSeats || 'N/A'} Seats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.fuelType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.transmission}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.year}</span>
                </div>
              </div>
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Per Day</span>
                  <span className="text-2xl font-bold text-blue-600">${vehicle.pricePerDay}</span>
                </div>
                {(vehicle.pricePerKm || vehicle.pricePerDistance) && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Per Kilometer</span>
                    <span className="text-lg font-semibold text-blue-600">
                      ${vehicle.pricePerKm || vehicle.pricePerDistance || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleBooking}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              {user ? 'Book Now' : 'Login to Book'}
            </button>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">About This Vehicle</h3>
            <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
          </div>
        )}

        {/* Contact Information */}
        {(user || showBookingModal) && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>{owner.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>{owner.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 col-span-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>{owner.address || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Customer Reviews</h3>
            {user && (
              <button
                onClick={() => navigate(`/write-review/${id}`, { 
                  state: { returnTo: `/vehicle/${id}` } 
                })}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            )}
          </div>
          
          {reviewsLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this vehicle!</p>
              {user ? (
                <button
                  onClick={() => navigate(`/write-review/${id}`, { 
                    state: { returnTo: `/vehicle/${id}` } 
                  })}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login', { 
                    state: { from: `/vehicle/${id}` } 
                  })}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <span>Login to Write a Review</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review._id || `review-${index}`} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {review?.customer?.firstName ? review.customer.firstName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {review?.customer?.firstName || 'Anonymous'} {review?.customer?.lastName || ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review?.createdAt && !isNaN(new Date(review.createdAt).getTime())
                            ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (review?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review?.comment || ''}</p>
                  
                  {/* Edit/delete buttons for own reviews */}
                  {user && review?.customer && 
                  (user.id === review.customer._id || user.id === review.customer.id) && (
                    <div className="flex items-center space-x-3 mt-3">
                      <button
                        onClick={() => navigate(`/write-review/${id}`, { 
                          state: { 
                            isEdit: true, 
                            reviewId: review._id, 
                            returnTo: `/vehicle/${id}` 
                          } 
                        })}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id!)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && vehicle && (
        <BookingModal 
          vehicle={vehicle} 
          onClose={() => setShowBookingModal(false)} 
        />
      )}
    </div>
  );
};



export default VehicleDetailsPage;