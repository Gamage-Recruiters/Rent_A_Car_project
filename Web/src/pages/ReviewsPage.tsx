import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Car, ArrowLeft, Loader, AlertCircle, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')?.replace('/api', '');

interface ReviewType {
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

const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'my-reviews'>('all');

  useEffect(() => {
    fetchReviews();
  }, [viewMode]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (viewMode === 'my-reviews' && user) {
        // Fetch the current user's reviews
        response = await axios.get(`${API_URL}/customer/review/my-reviews`, {
          withCredentials: true
        });
      } else {
        // Fetch all reviews
        response = await axios.get(`${API_URL}/customer/review/all`);
      }
      
      if (response.data?.success) {
        // Filter out reviews with invalid data structure
        const validReviews = response.data.data.filter((review: any) => 
          review && review._id && review.customer && review.rating
        );
        
        setReviews(validReviews);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch reviews');
      } else {
        setError('An error occurred while fetching reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle case where we don't have an endpoint for all reviews
  // const fetchAllVehicleReviews = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
      
  //     // First get a list of all vehicles
  //     const vehiclesResponse = await axios.get(`${API_URL}/customer/vehicle`);
  //     const vehicles = vehiclesResponse.data.data;
      
  //     // Then fetch reviews for each vehicle
  //     const reviewPromises = vehicles.map((vehicle: any) => 
  //       axios.get(`${API_URL}/customer/review/vehicle/${vehicle._id}`)
  //     );
      
  //     const reviewResponses = await Promise.all(reviewPromises);
      
  //     // Combine all reviews
  //     const allReviews: ReviewType[] = [];
  //     reviewResponses.forEach(response => {
  //       if (response.data?.success) {
  //         allReviews.push(...response.data.data);
  //       }
  //     });
      
  //     // Remove duplicates (in case a review appears in multiple vehicle responses)
  //     const uniqueReviews = allReviews.filter((review, index, self) =>
  //       index === self.findIndex((r) => r._id === review._id)
  //     );
      
  //     setReviews(uniqueReviews);
  //   } catch (error) {
  //     console.error('Error fetching all vehicle reviews:', error);
  //     setError('Failed to fetch reviews');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const constructImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder-car.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    return `${BASE_URL}/uploads/vehicles/${imagePath}`;
  };

  const filteredReviews = selectedRating 
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    return {
      rating,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    };
  });

  const handleToggleViewMode = () => {
    if (!user && viewMode === 'all') {
      toast.info('Please log in to view your reviews');
      return;
    }
    setViewMode(prev => prev === 'all' ? 'my-reviews' : 'all');
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
        // Remove the deleted review from state
        setReviews(reviews.filter(review => review._id !== reviewId));
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('An error occurred while deleting the review');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Read what our customers say about their experience with RentACar
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* View Mode Toggle */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleToggleViewMode}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {viewMode === 'all' ? (
              <>
                <Car className="w-5 h-5" />
                <span>View My Reviews</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-5 h-5" />
                <span>Back to All Reviews</span>
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reviews</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-semibold mb-4">
                  {viewMode === 'my-reviews' ? 'Your Ratings' : 'Overall Rating'}
                </h3>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600">
                    Based on {reviews.length} {viewMode === 'my-reviews' ? 'of your' : ''} reviews
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-8">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter by Rating
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedRating(null)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedRating === null
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                          selectedRating === rating
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <span>{rating}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {viewMode === 'all' && user && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                      to="/dashboard?tab=reviews"
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage My Reviews
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-600">
                    {viewMode === 'my-reviews'
                      ? "You haven't submitted any reviews yet."
                      : "No reviews match your current filter."}
                  </p>
                  {viewMode === 'my-reviews' && (
                    <Link
                      to="/search"
                      className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Find Cars to Review
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            {review.customer?.photo ? (
                              <img 
                                src={constructImageUrl(review.customer.photo)}
                                alt={`${review.customer?.firstName || ''} ${review.customer?.lastName || ''}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/default-avatar.jpg';
                                }}
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-lg">
                                {review.customer?.firstName 
                                  ? review.customer.firstName.charAt(0) 
                                  : review.customer?.email?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.customer?.firstName || 'Anonymous'} {review.customer?.lastName || ''}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.vehicle && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={review.vehicle.images?.length ? constructImageUrl(review.vehicle.images[0]) : '/placeholder-car.jpg'}
                              alt={review.vehicle.vehicleName || 'Vehicle'}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-car.jpg';
                              }}
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{review.vehicle.vehicleName || 'Unknown Vehicle'}</h5>
                              <p className="text-sm text-gray-600">
                                {review.vehicle.brand || ''} {review.vehicle.model || ''} {review.vehicle.year || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful</span>
                          </button>
                          {review.vehicle && (
                            <Link 
                              to={`/vehicle/${review.vehicle._id}`} 
                              className="flex items-center space-x-1 hover:text-blue-600"
                            >
                              <Car className="w-4 h-4" />
                              <span>View Vehicle</span>
                            </Link>
                          )}
                        </div>
                        
                        {/* Show edit/delete options for user's own reviews */}
                        {user && user.id === review.customer?._id && (
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/write-review/${review.vehicle?._id}`}
                              state={{ 
                                isEdit: true, 
                                reviewId: review._id, 
                                returnTo: '/reviews' 
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;