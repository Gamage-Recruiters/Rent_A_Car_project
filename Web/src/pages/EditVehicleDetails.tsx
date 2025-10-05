
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useVehicle } from "../context/VehicleContext";
import { Vehicle } from "../types";
import {
  Car,
  Upload,
  MapPin,
  DollarSign,
  Settings,
  Users,
  Fuel,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:8000";

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
  "AC", "GPS", "Bluetooth", "Backup Camera", "Sunroof", "Heated Seats",
  "Apple CarPlay", "Android Auto", "Premium Sound", "Leather Interior",
  "Panoramic Roof", "Adaptive Cruise Control", "Lane Assist", "Parking Sensors",
];

const steps = [
  { id: 1, title: "Basic Information", icon: Car },
  { id: 2, title: "Specifications", icon: Settings },
  { id: 3, title: "Pricing & Location", icon: DollarSign },
  { id: 4, title: "Features & Images", icon: Upload },
];

const EditVehicleDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getOwnerVehicleById, updateVehicle } = useVehicle();

  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleData, setVehicleData] = useState<Partial<Vehicle>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Vehicle ID is missing.");
      setLoading(false);
      return;
    }
    const fetchVehicle = async () => {
      try {
        const data = await getOwnerVehicleById(id);
        if (data) {
          setVehicleData({
            ...data,
            contactInfo: data.contactInfo || { 
              phone: data.phoneNumber?.toString() || '', 
              email: data.owner?.email || '', 
              address: data.pickupAddress || '' 
            },
            features: data.features || [],
            images: data.images || [],
          });
          console.log("Fetched vehicle data:", data);

        } else {
          setError("Vehicle not found.");
        }
      } catch (err) {
        setError("Failed to fetch vehicle details.");
        toast.error("Failed to fetch vehicle details.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
   
  }, [id, getOwnerVehicleById]);

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
      contactInfo: {
        phone: name === "phone" ? value : prev.contactInfo?.phone ?? "",
        email: name === "email" ? value : prev.contactInfo?.email ?? "",
        address: name === "address" ? value : prev.contactInfo?.address ?? "",
      },
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setVehicleData((prev) => {
      const currentFeatures = prev.features || [];
      return {
        ...prev,
        features: currentFeatures.includes(feature)
          ? currentFeatures.filter((f) => f !== feature)
          : [...currentFeatures, feature],
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImages((prev) => [...prev, ...files]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    const imageToRemove = vehicleData.images?.[index];
    if (!imageToRemove) return;
    setVehicleData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
    toast.info("Image marked for deletion. Save changes to confirm.");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(vehicleData).forEach(([key, value]) => {
        if (key === 'images' || key === 'features' || key === 'contactInfo' || key === 'owner') return;
        if (value !== null && value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });

      if (vehicleData.features) {
        vehicleData.features.forEach(feature => formData.append('features', feature));
      }

      if (vehicleData.contactInfo) {
        formData.append('phoneNumber', vehicleData.contactInfo.phone);
        formData.append('email', vehicleData.contactInfo.email);
        formData.append('pickupAddress', vehicleData.contactInfo.address);
      }

      newImages.forEach(file => {
        formData.append("vehicleImages", file);
      });

      // Append existing images that are not marked for deletion
      if (vehicleData.images) {
        vehicleData.images.forEach(image => {
          formData.append('existingImages', image);
        });
      }

      await updateVehicle(id, formData);
      toast.success("Vehicle updated successfully!");
      navigate("/owner-dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const constructImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("blob:")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><AlertCircle className="w-8 h-8 text-red-500 mr-2" /> {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Vehicle Details</h1>
            <p className="text-gray-600">Update your vehicle information</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"}`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>Step {step.id}</p>
                      <p className={`text-xs ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>{step.title}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name *</label>
                    <input type="text" name="name" required value={vehicleData.vehicleName || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Toyota Camry 2023"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                    <input type="text" name="brand" required value={vehicleData.brand || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Toyota"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                    <input type="text" name="model" required value={vehicleData.model || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Camry"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <input type="number" name="year" required min="2000" max={new Date().getFullYear() + 1} value={vehicleData.year || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                    <select name="type" required value={vehicleData.vehicleType || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select type</option>
                        {vehicleTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" rows={4} value={vehicleData.description || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe your vehicle..."/>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Vehicle Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><Users className="w-4 h-4 inline mr-1"/>Number of Seats *</label>
                        <input type="number" name="seats" required min="2" max="15" value={vehicleData.noSeats || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><Fuel className="w-4 h-4 inline mr-1"/>Fuel Type *</label>
                        <select name="fuelType" required value={vehicleData.fuelType || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Select fuel type</option>
                            {fuelTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><Settings className="w-4 h-4 inline mr-1"/>Transmission *</label>
                        <select name="transmission" required value={vehicleData.transmission || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Select transmission</option>
                            {transmissionTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km/l)</label>
                        <input type="number" name="mileage" step="0.1" value={vehicleData.mileage || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 15.5"/>
                    </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="isDriverAvailable" checked={vehicleData.isDriverAvailable || false} onChange={handleInputChange} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <span className="text-sm font-medium text-gray-700">Driver available for this vehicle</span>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 3 && (
               <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Pricing & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><DollarSign className="w-4 h-4 inline mr-1"/>Price per Day ($) *</label>
                    <input type="number" name="pricePerDay" required min="1" step="0.01" value={vehicleData.pricePerDay || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 45.00"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Km ($)</label>
                    <input type="number" name="pricePerKm" min="0" step="0.01" value={vehicleData.pricePerDistance || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 0.50"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><MapPin className="w-4 h-4 inline mr-1"/>Location *</label>
                    <select name="location" required value={vehicleData.location || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select location</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input type="tel" name="phone" required value={vehicleData.contactInfo?.phone || ''} onChange={handleContactChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input type="email" name="email" required value={vehicleData.email || ''} onChange={handleContactChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                      <textarea name="address" required rows={3} value={vehicleData.contactInfo?.address || ''} onChange={handleContactChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter the full pickup address"/>
                    </div>
                </div>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Features & Images</h2>
                 <div>
                  <h3 className="text-lg font-medium mb-4">Vehicle Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableFeatures.map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={vehicleData.features?.includes(feature) || false} onChange={() => handleFeatureToggle(feature)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Vehicle Images</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <p className="text-gray-600 mb-2">Upload new vehicle images</p>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden"/>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Choose Files</button>
                  </div>
                   <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicleData.images?.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative">
                        <img src={constructImageUrl(img)} alt={`Existing ${idx + 1}`} className="w-full h-32 object-cover rounded-lg"/>
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"><X size={14}/></button>
                      </div>
                    ))}
                    {newImages.map((file, idx) => (
                       <div key={`new-${idx}`} className="relative">
                        <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="w-full h-32 object-cover rounded-lg"/>
                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={prevStep} disabled={currentStep === 1 || isSubmitting} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Next
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Saving...</> : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVehicleDetails;