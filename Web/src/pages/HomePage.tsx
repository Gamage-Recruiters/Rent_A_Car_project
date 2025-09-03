import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, ThumbsUp, Search, ArrowRight } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import VehicleCard from '../components/VehicleCard';
import { SearchFilters } from '../types';
import { mockVehicles } from '../data/mockData';

import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState(mockVehicles.slice(0, 3));

  const handleSearch = (filters: SearchFilters) => {
    // Navigate to search page with filters
    navigate('/search', { state: { filters } });
  };

  const features = [
    {
      icon: Car,
      title: 'Wide Selection',
      description: 'Choose from hundreds of vehicles across all categories'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All vehicles are verified and insured for your safety'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs'
    },
    {
      icon: ThumbsUp,
      title: 'Best Rates',
      description: 'Competitive pricing with no hidden fees'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div 
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=1600)',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                Find Your Perfect
                <span className="block text-yellow-400">Rental Car</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
                Discover the freedom to explore with our premium vehicle rental service. 
                From economy to luxury, we have the perfect car for every journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/search"
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Start Your Search</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Search Available Vehicles</h2>
          <SearchForm onSearch={handleSearch} className="max-w-6xl mx-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose RentACar?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best car rental experience with top-quality vehicles and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Vehicles</h2>
            <Link
              to="/search"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Vehicles Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-blue-200">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-yellow-400">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Hit the Road?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust RentACar for their transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup?type=user"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Rent a Car
            </Link>
            <Link
              to="/signup?type=owner"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;