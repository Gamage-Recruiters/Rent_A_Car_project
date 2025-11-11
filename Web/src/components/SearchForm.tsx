import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Calendar, Car } from "lucide-react";
import { SearchFilters } from "../types";

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialFilters,
  className = "",
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    location: initialFilters?.location || "",
    startDate: initialFilters?.startDate || "",
    endDate: initialFilters?.endDate || "",
    vehicleType: initialFilters?.vehicleType || "",
    priceRange: initialFilters?.priceRange || [0, 200],
    hasDriver: initialFilters?.hasDriver || null,
    transmission: initialFilters?.transmission || "",
    fuelType: initialFilters?.fuelType || "",
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/customer/vehicle/locations`
        );

        if (response.ok) {
          const data = await response.json();
          // API already returns an array of strings
          setLocations(data);
        } else {
          console.error("Failed to fetch customer locations");
          setLocations([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleLocationSelect = (location: string) => {
    setFilters((prev) => ({ ...prev, location }));
    setShowDropdown(false);
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, location: e.target.value }));
    setShowDropdown(true);
  };

  const handleLocationInputFocus = () => {
    setShowDropdown(true);
  };

  const filteredLocations = locations.filter((loc) =>
    filters.location
      ? loc.toLowerCase().includes(filters.location.toLowerCase())
      : true
  );

  const vehicleTypes = ["sedan", "suv", "hatchback", "luxury", "sports", "van"];
  const transmissions = ["manual", "automatic"];
  const fuelTypes = ["petrol", "diesel", "electric", "hybrid"];
  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location with Searchable Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>

          <div className="relative" ref={dropdownRef}>
            {/* Search Input */}
            <input
              type="text"
              value={filters.location}
              onChange={handleLocationInputChange}
              onFocus={handleLocationInputFocus}
              placeholder={loadingLocations ? "Loading locations..." : "Search location"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingLocations}
            />

            {/* Dropdown list */}
            {showDropdown && locations.length > 0 && filteredLocations.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {filteredLocations.map((loc) => (
                  <li
                    key={loc}
                    onClick={() => handleLocationSelect(loc)}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            min={today}
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            min={today}
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Car className="w-4 h-4 inline mr-1" />
            Vehicle Type
          </label>
          <select
            value={filters.vehicleType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, vehicleType: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Price Range (per day)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min={0}
              value={filters.priceRange[0]}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: [
                    Math.max(0, parseInt(e.target.value) || 0),
                    prev.priceRange[1],
                  ],
                }))
              }
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Min"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min={0}
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: [
                    prev.priceRange[0],
                    Math.max(0, parseInt(e.target.value) || 200),
                  ],
                }))
              }
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Driver Option */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Driver
          </label>
          <select
            value={
              filters.hasDriver === null ? "" : filters.hasDriver.toString()
            }
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                hasDriver:
                  e.target.value === "" ? null : e.target.value === "true",
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="true">With Driver</option>
            <option value="false">Self Drive</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Transmission
          </label>
          <select
            value={filters.transmission}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, transmission: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            {transmissions.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fuel Type
          </label>
          <select
            value={filters.fuelType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fuelType: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            {fuelTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
        >
          <Search className="w-5 h-5" />
          <span>Search Vehicles</span>
        </button>
      </div>
    </form>
  );
};

export default SearchForm;