import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, SortAsc } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import VehicleCard from '../components/VehicleCard';
import { SearchFilters, Vehicle } from '../types';
import { useVehicle } from '../context/VehicleContext';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { getAllVehicles } = useVehicle();

  const initialFilters = location.state?.filters || {};

  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    startDate: '',
    endDate: '',
    vehicleType: '',
    priceRange: [0, 10000],
    hasDriver: null,
    transmission: '',
    fuelType: '',
    ...initialFilters,
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [vehicles, filters, sortBy, sortOrder]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const isVehicleAvailableForDates = (vehicle: Vehicle, startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true;
    if (!vehicle.unavailableDates || vehicle.unavailableDates.length === 0) {
      return true;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return !vehicle.unavailableDates.some(unavailableDate => {
      const unavailable = new Date(unavailableDate);
      return unavailable >= start && unavailable <= end;
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...vehicles];

    console.log('Total vehicles:', vehicles.length);
    console.log('Current filters:', filters);

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(vehicle => 
        vehicle.pickupAddress?.toLowerCase().includes(filters.location.toLowerCase())
      );
      console.log('After location filter:', filtered.length);
    }

    // Vehicle Type
    if (filters.vehicleType) {
      filtered = filtered.filter(vehicle => 
        vehicle.vehicleType?.toLowerCase() === filters.vehicleType.toLowerCase()
      );
      console.log('After vehicle type filter:', filtered.length);
    }

    // Fuel Type
    if (filters.fuelType) {
      filtered = filtered.filter(vehicle => 
        vehicle.fuelType?.toLowerCase() === filters.fuelType.toLowerCase()
      );
      console.log('After fuel type filter:', filtered.length);
    }

    // Auto OR Manual
    if (filters.transmission) {
      filtered = filtered.filter(vehicle => 
        vehicle.transmission?.toLowerCase() === filters.transmission.toLowerCase()
      );
      console.log('After transmission filter:', filtered.length);
    }

    // isDriverAvailable
    if (filters.hasDriver !== null) {
      filtered = filtered.filter(vehicle => 
        vehicle.isDriverAvailable === filters.hasDriver
      );
      console.log('After driver filter:', filtered.length);
    }

    // Price Range
    filtered = filtered.filter(vehicle => 
      vehicle.pricePerDay >= filters.priceRange[0] && 
      vehicle.pricePerDay <= filters.priceRange[1]
    );
    console.log('After price filter:', filtered.length);

    // Date availability filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(vehicle => 
        isVehicleAvailableForDates(vehicle, filters.startDate, filters.endDate)
      );
      console.log('After date filter:', filtered.length);
    }

    // Sort ---> extended
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'price':
          aValue = a.pricePerDay;
          bValue = b.pricePerDay;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'name':
          aValue = a.vehicleName || ''; 
          bValue = b.vehicleName || ''; 
          break;
        default:
          aValue = a.pricePerDay;
          bValue = b.pricePerDay;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    console.log('Final filtered vehicles:', filtered);
    setFilteredVehicles(filtered);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      startDate: '',
      endDate: '',
      vehicleType: '',
      priceRange: [0, 10000],
      hasDriver: null,
      transmission: '',
      fuelType: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Vehicles</h1>
          <SearchForm onSearch={handleSearch} initialFilters={filters} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mb-4"
            >
              <Filter className="w-5 h-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="price"
                      checked={sortBy === 'price'}
                      onChange={(e) => setSortBy(e.target.value as 'price')}
                      className="mr-2"
                    />
                    Price
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="rating"
                      checked={sortBy === 'rating'}
                      onChange={(e) => setSortBy(e.target.value as 'rating')}
                      className="mr-2"
                    />
                    Rating
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="name"
                      checked={sortBy === 'name'}
                      onChange={(e) => setSortBy(e.target.value as 'name')}
                      className="mr-2"
                    />
                    Name
                  </label>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <SortAsc className={`w-4 h-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                    <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Active Filters</h4>
                <div className="space-y-1 text-sm">
                  {filters.location && (
                    <div className="text-gray-600">
                      <strong>Location:</strong> {filters.location}
                    </div>
                  )}
                  {filters.vehicleType && (
                    <div className="text-gray-600">
                      <strong>Type:</strong> {filters.vehicleType}
                    </div>
                  )}
                  {filters.fuelType && (
                    <div className="text-gray-600">
                      <strong>Fuel:</strong> {filters.fuelType}
                    </div>
                  )}
                  {filters.transmission && (
                    <div className="text-gray-600">
                      <strong>Transmission:</strong> {filters.transmission}
                    </div>
                  )}
                  {filters.hasDriver !== null && (
                    <div className="text-gray-600">
                      <strong>Driver:</strong> {filters.hasDriver ? 'With Driver' : 'Self Drive'}
                    </div>
                  )}
                  <div className="text-gray-600">
                    <strong>Price:</strong> ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </div>
                  {filters.startDate && filters.endDate && (
                    <div className="text-gray-600">
                      <strong>Dates:</strong> {filters.startDate} to {filters.endDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading vehicles...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchVehicles}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredVehicles.length} Vehicle
                    {filteredVehicles.length !== 1 ? 's' : ''} Found
                  </h2>
                  
                  {filteredVehicles.length > 0 && (
                    <div className="text-sm text-gray-500">
                      Sorted by {sortBy} ({sortOrder})
                    </div>
                  )}
                </div>

                {filteredVehicles.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-gray-500 text-lg mb-2">
                      No vehicles found matching your criteria
                    </div>
                    <p className="text-gray-400 mb-4">
                      Try adjusting your filters to see more results
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle._id} vehicle={vehicle} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;