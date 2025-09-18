import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Upload,
  MapPin,
  DollarSign,
  Settings,
  Users,
  Fuel,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useVehicle } from "../context/VehicleContext";

const AddVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerVehicle } = useVehicle();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [vehicleData, setVehicleData] = useState({
    vehicleName: "",
    vehicleLicenseNumber: '',
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    vehicleType: "",
    description: "",
    noSeats: "",
    fuelType: "",
    transmission: "",
    mileage: "",
    isDriverAvailable: false,
    pricePerDay: "",
    pricePerDistance: "",
    location: "",
    contactInfo: {
        phone: user?.phone || "",
        email: user?.email || "",
        address: "",
      },
    features: [] as string[],
    images: [] as File[], 
  });


  const vehicleTypes = ["sedan", "suv", "hatchback", "luxury", "sports", "van"];
  const fuelTypes = ["petrol", "diesel", "electric", "hybrid"];
  const transmissionTypes = ["manual", "automatic"];
  const locations = [
    "Downtown",
    "Airport",
    "City Center",
    "Tech District",
    "Suburbs",
  ];
  const availableFeatures = [
    "AC",
    "GPS",
    "Bluetooth",
    "Backup Camera",
    "Sunroof",
    "Heated Seats",
    "Apple CarPlay",
    "Android Auto",
    "Premium Sound",
    "Leather Interior",
    "Panoramic Roof",
    "Adaptive Cruise Control",
    "Lane Assist",
    "Parking Sensors",
  ];

  const steps = [
    { id: 1, title: "Basic Information", icon: Car },
    { id: 2, title: "Specifications", icon: Settings },
    { id: 3, title: "Pricing & Location", icon: DollarSign },
    { id: 4, title: "Features & Images", icon: Upload },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setVehicleData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setVehicleData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value },
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setVehicleData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep !== 4) return; // only submit at final step
    console.log("handleSubmit called, currentStep:", currentStep);
    
    try {
      const formData = new FormData();

      // append normal fields
      Object.entries(vehicleData).forEach(([key, value]) => {
        if (key === "images" || key === "contactInfo") return; // skip special cases
        formData.append(key, value as string);
      });

      // append contactInfo fields
      formData.append("phoneNumber", vehicleData.contactInfo.phone);
      formData.append("email", vehicleData.contactInfo.email);
      formData.append("pickupAddress", vehicleData.contactInfo.address);

      // append images
      vehicleData.images.forEach((file) => {
        formData.append("files", file); // backend expects req.files
      });

      try{
      const response = await registerVehicle(formData);
      alert(response.data.message);
      navigate("/owner-dashboard");
      }catch(e){
        console.log("error")
      }
      

      
    } catch (error: any) {
      console.error("Register Vehicle Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to register vehicle");
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      console.log("Moving to step:", currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // image upload part in frontend

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setVehicleData((prev) => ({
      ...prev,
      images: [...prev.images, ...files], // store actual files
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add New Vehicle
            </h1>
            <p className="text-gray-600">
              List your vehicle for rent and start earning
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      currentStep >= step.id
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      Step {step.id}
                    </p>
                    <p
                      className={`text-xs ${
                        currentStep >= step.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-4 ${
                        currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="mb-4 text-gray-700">
              Current Step: {currentStep}
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Name *
                    </label>
                    <input
                      type="text"
                      name="vehicleName"
                      required
                      value={vehicleData.vehicleName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Toyota Camry 2023"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      required
                      value={vehicleData.brand}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      required
                      value={vehicleData.model}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Camry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      required
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      value={vehicleData.year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      name="vehicleType"
                      required
                      value={vehicleData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle License Number *
                    </label>
                    <input
                      type="text"
                      name="vehicleLicenseNumber"
                      required
                      value={vehicleData.vehicleLicenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CAR2220"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={vehicleData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your vehicle, its condition, and any special features..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Specifications */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">
                  Vehicle Specifications
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Number of Seats *
                    </label>
                    <input
                      type="number"
                      name="noSeats"
                      required
                      min="2"
                      max="15"
                      value={vehicleData.noSeats}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Fuel className="w-4 h-4 inline mr-1" />
                      Fuel Type *
                    </label>
                    <select
                      name="fuelType"
                      required
                      value={vehicleData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select fuel type</option>
                      {fuelTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Settings className="w-4 h-4 inline mr-1" />
                      Transmission *
                    </label>
                    <select
                      name="transmission"
                      required
                      value={vehicleData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select transmission</option>
                      {transmissionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage (km/l)
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      step="0.1"
                      value={vehicleData.mileage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 15.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isDriverAvailable"
                      checked={vehicleData.isDriverAvailable}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Driver available for this vehicle
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">
                  Pricing & Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Price per Day ($) *
                    </label>
                    <input
                      type="number"
                      name="pricePerDay"
                      required
                      min="1"
                      step="0.01"
                      value={vehicleData.pricePerDay}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 45.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Km ($)
                    </label>
                    <input
                      type="number"
                      name="pricePerDistance"
                      min="0"
                      step="0.01"
                      value={vehicleData.pricePerDistance}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 0.50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location *
                    </label>
                    <select
                      name="location"
                      required
                      value={vehicleData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select location</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={vehicleData.contactInfo.phone}
                        onChange={handleContactChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={vehicleData.contactInfo.email}
                        onChange={handleContactChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={vehicleData.contactInfo.address}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter the address where customers can pick up the vehicle"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Features & Images */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">
                  Features & Images
                </h2>

                <div>
                  <h3 className="text-lg font-medium mb-4">Vehicle Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableFeatures.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={vehicleData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Vehicle Images</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload vehicle images</p>
                    <p className="text-sm text-gray-500">
                      Add at least 3 high-quality photos of your vehicle
                    </p>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      id="vehicleImages"
                      className="hidden"
                    />

                    <label
                      htmlFor="vehicleImages"
                      className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>

                  {/* Show previews */}
                  {vehicleData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {vehicleData.images.map((img, idx) => (
                        <div key={idx} className="relative">

                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Vehicle ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />

                          <button
                            type="button"
                            onClick={() =>
                              setVehicleData((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Vehicle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehiclePage;
