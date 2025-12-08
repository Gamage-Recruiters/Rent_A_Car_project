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
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useVehicle } from "../context/VehicleContext";

type ContactInfo = {
  phone: string;
  email: string;
  address: string;
};

const AddVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerVehicle } = useVehicle();

  const [currentStep, setCurrentStep] = useState(1);

  const [vehicleData, setVehicleData] = useState({
    vehicleName: "",
    vehicleLicenseNumber: "",
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
    } as ContactInfo,
    features: [] as string[],
    images: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const vehicleTypes = ["sedan", "suv", "hatchback", "luxury", "sports", "van"];
  const fuelTypes = ["petrol", "diesel", "electric", "hybrid"];
  const transmissionTypes = ["manual", "automatic"];
  const locations = ["Downtown", "Airport", "City Center", "Tech District", "Suburbs"];
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

  useEffect(() => {
    // ensure contact info sync if user changes
    setVehicleData((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, phone: user?.phone || "", email: user?.email || "" },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phone, user?.email]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setVehicleData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setVehicleData((prev) => ({ ...prev, [name]: value }));
    }
    // clear field error on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value },
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFeatureToggle = (feature: string) => {
    setVehicleData((prev) => ({
      ...prev,
      features: prev.features.includes(feature) ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
    }));
  };

  // Basic client-side validators
  const validators = {
    required: (val: any) => (val === undefined || val === null || String(val).trim() === "" ? false : true),
    year: (val: any) => {
      const y = Number(val);
      const min = 2000;
      const max = new Date().getFullYear() + 1;
      return Number.isInteger(y) && y >= min && y <= max;
    },
    licenseFormat: (val: string) => {
      // reasonable license regex: letters/numbers and hyphen, 4-12 chars
      return /^[A-Za-z0-9-]{4,12}$/.test(val);
    },
    seats: (val: any) => {
      const n = Number(val);
      return Number.isInteger(n) && n >= 2 && n <= 15;
    },
    phone: (val: string) => {
      // allow + and digits, 7-15 digits
      return /^\+?[0-9]{7,15}$/.test(val);
    },
    email: (val: string) => {
      return /^\S+@\S+\.\S+$/.test(val);
    },
    imageCount: (files: File[]) => files.length >= 3 && files.length <= 5,
    imageSize: (files: File[]) => files.every((f) => f.size <= 5 * 1024 * 1024),
    imageType: (files: File[]) => files.every((f) => f.type.startsWith("image/")),
  };

  // optional server-side check for duplicate license - backend must implement endpoint
  const checkLicenseExists = async (license: string) => {
    try {
      const res = await fetch(`/api/vehicles/check-license?license=${encodeURIComponent(license)}`);
      if (!res.ok) return false; // if endpoint missing or error treat as not-existing
      const data = await res.json();
      return Boolean(data.exists);
    } catch (err) {
      // don't block the user if server-check fails; log and continue
      console.warn("License check failed:", err);
      return false;
    }
  };

  const validateStep = async (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!validators.required(vehicleData.vehicleName)) newErrors.vehicleName = "Vehicle name is required";
      if (!validators.required(vehicleData.brand)) newErrors.brand = "Brand is required";
      if (!validators.required(vehicleData.model)) newErrors.model = "Model is required";
      if (!validators.year(vehicleData.year)) newErrors.year = "Enter a valid year (2000 - next year)";
      if (!validators.required(vehicleData.vehicleLicenseNumber)) newErrors.vehicleLicenseNumber = "License number is required";
      else if (!validators.licenseFormat(vehicleData.vehicleLicenseNumber)) newErrors.vehicleLicenseNumber = "Invalid license format (4-12 letters/numbers)";

      // server-side duplicate check (best-effort)
      if (!newErrors.vehicleLicenseNumber) {
        const exists = await checkLicenseExists(vehicleData.vehicleLicenseNumber);
        if (exists) newErrors.vehicleLicenseNumber = "License number already registered";
      }
    }

    if (step === 2) {
      if (!validators.seats(vehicleData.noSeats)) newErrors.noSeats = "Enter a valid number of seats (2-15)";
      if (!validators.required(vehicleData.fuelType)) newErrors.fuelType = "Fuel type is required";
      if (!validators.required(vehicleData.transmission)) newErrors.transmission = "Transmission is required";
    }

    if (step === 3) {
      if (!validators.required(vehicleData.pricePerDay) || Number(vehicleData.pricePerDay) <= 0) newErrors.pricePerDay = "Enter a valid price per day";
      if (!validators.required(vehicleData.location)) newErrors.location = "Location is required";
      if (!validators.phone(vehicleData.contactInfo.phone)) newErrors.phone = "Enter a valid phone number";
      if (!validators.email(vehicleData.contactInfo.email)) newErrors.email = "Enter a valid email address";
      if (!validators.required(vehicleData.contactInfo.address)) newErrors.address = "Pickup address is required";
    }

    if (step === 4) {
      const files = vehicleData.images;
      if (!validators.imageCount(files)) newErrors.images = "Upload 3 to 5 images";
      else if (!validators.imageType(files)) newErrors.images = "Only image files are allowed";
      else if (!validators.imageSize(files)) newErrors.images = "Each image must be <= 5MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // final validation (step 4)
    const ok = await validateStep(4);
    if (!ok) {
      toast.error("Please fix errors before submitting");
      return;
    }

    try {
      const formData = new FormData();

      // append normal fields (skip objects & images)
      const skipKeys = ["images", "contactInfo", "features"];
      Object.entries(vehicleData).forEach(([key, value]) => {
        if (skipKeys.includes(key)) return;
        formData.append(key, String(value));
      });

      // append arrays and objects
      formData.append("features", JSON.stringify(vehicleData.features));
      formData.append("phoneNumber", vehicleData.contactInfo.phone);
      formData.append("email", vehicleData.contactInfo.email);
      formData.append("pickupAddress", vehicleData.contactInfo.address);

      vehicleData.images.forEach((file) => formData.append("vehicleImages", file));

      const response = await registerVehicle(formData);
      toast.success(response.data?.message || "Vehicle added successfully");
      navigate("/owner-dashboard");
    } catch (error: any) {
      console.error("Register Vehicle Error:", error);
      toast.error(error?.response?.data?.message || "Failed to register vehicle");
    }
  };

  const nextStep = async () => {
    if (currentStep < 4) {
      const valid = await validateStep(currentStep);
      if (valid) setCurrentStep((prev) => prev + 1);
      else {
        toast.error("Please fix highlighted errors before continuing");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // validate type & size client-side and limit count
    const all = [...vehicleData.images, ...files];
    if (all.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const invalidType = files.some((f) => !f.type.startsWith("image/"));
    if (invalidType) {
      toast.error("Only image files are allowed");
      return;
    }

    const tooLarge = files.some((f) => f.size > 5 * 1024 * 1024);
    if (tooLarge) {
      toast.error("Each image must be 5MB or smaller");
      return;
    }

    setVehicleData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (idx: number) => {
    setVehicleData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Vehicle</h1>
            <p className="text-gray-600">List your vehicle for rent and start earning</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center justify-between min-w-max">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <p
  className={`text-xs ${
    currentStep >= step.id ? "text-blue-600" : "text-gray-500"
  }`}
>
  {step.title}
</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-1 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-4 text-gray-700">Current Step: {currentStep}</div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name *</label>
                    <input
                      type="text"
                      name="vehicleName"
                      required
                      value={vehicleData.vehicleName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vehicleName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Toyota Camry 2023"
                    />
                    {errors.vehicleName && <p className="text-xs text-red-600 mt-1">{errors.vehicleName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      required
                      value={vehicleData.brand}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.brand ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Toyota"
                    />
                    {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                    <input
                      type="text"
                      name="model"
                      required
                      value={vehicleData.model}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.model ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Camry"
                    />
                    {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <input
                      type="number"
                      name="year"
                      required
                      min={2000}
                      max={new Date().getFullYear() + 1}
                      value={vehicleData.year}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.year ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.year && <p className="text-xs text-red-600 mt-1">{errors.year}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle License Number *</label>
                    <input
                      type="text"
                      name="vehicleLicenseNumber"
                      required
                      value={vehicleData.vehicleLicenseNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vehicleLicenseNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="CAR2220"
                    />
                    {errors.vehicleLicenseNumber && <p className="text-xs text-red-600 mt-1">{errors.vehicleLicenseNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Vehicle Specifications</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" /> Number of Seats *
                    </label>
                    <input
                      type="number"
                      name="noSeats"
                      required
                      min={2}
                      max={15}
                      value={vehicleData.noSeats}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.noSeats ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.noSeats && <p className="text-xs text-red-600 mt-1">{errors.noSeats}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Fuel className="w-4 h-4 inline mr-1" /> Fuel Type *
                    </label>
                    <select
                      name="fuelType"
                      required
                      value={vehicleData.fuelType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.fuelType ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select fuel type</option>
                      {fuelTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.fuelType && <p className="text-xs text-red-600 mt-1">{errors.fuelType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Settings className="w-4 h-4 inline mr-1" /> Transmission *
                    </label>
                    <select
                      name="transmission"
                      required
                      value={vehicleData.transmission}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.transmission ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select transmission</option>
                      {transmissionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.transmission && <p className="text-xs text-red-600 mt-1">{errors.transmission}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km/l)</label>
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
                    <span className="text-sm font-medium text-gray-700">Driver available for this vehicle</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Pricing & Location</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" /> Price per Day ($) *
                    </label>
                    <input
                      type="number"
                      name="pricePerDay"
                      required
                      min="1"
                      step="0.01"
                      value={vehicleData.pricePerDay}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.pricePerDay ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 45.00"
                    />
                    {errors.pricePerDay && <p className="text-xs text-red-600 mt-1">{errors.pricePerDay}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Km ($)</label>
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
                      <MapPin className="w-4 h-4 inline mr-1" /> Location *
                    </label>
                    <select
                      name="location"
                      required
                      value={vehicleData.location}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select location</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={vehicleData.contactInfo.phone}
                        onChange={handleContactChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={vehicleData.contactInfo.email}
                        onChange={handleContactChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={vehicleData.contactInfo.address}
                      onChange={handleContactChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter the address where customers can pick up the vehicle"
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Features & Images</h2>

                <div>
                  <h3 className="text-lg font-medium mb-4">Vehicle Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableFeatures.map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
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
                    <p className="text-sm text-gray-500">Add at least 3 high-quality photos of your vehicle (max 5)</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} id="vehicleImages" className="hidden" />
                    <label htmlFor="vehicleImages" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      Choose Files
                    </label>
                  </div>

                  {errors.images && <p className="text-xs text-red-600 mt-2">{errors.images}</p>}

                  {vehicleData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {vehicleData.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={URL.createObjectURL(img)} alt={`Vehicle ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons inside form for accessibility */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>

              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Next
                </button>
              ) : (
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Add Vehicle
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehiclePage;
