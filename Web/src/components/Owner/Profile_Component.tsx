import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const BASE_URL = API_URL.replace('/api', ''); 

const Profile_Component: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.image || null);
  const [loading, setLoading] = useState(false);

  // Handle image preview
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      if (profileImage) {
        formData.append("image", profileImage);
      }

      await axios.put(`${API_URL}/owner/profile/`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Refresh context so UI updates with new data
      await refreshUser();

      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto mt-6">
      <h3 className="text-2xl font-semibold mb-6">Owner Profile</h3>
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div>
          <h4 className="text-lg font-medium mb-4">Profile Picture</h4>
          <div className="flex items-center space-x-6">
            {preview ? (
              <img
              src={typeof preview === "string" && preview.startsWith("blob:") ? preview : `${BASE_URL}/uploads/ownerProfileImages/${user?.image ?? ""}`}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center border-2 border-green-500">
              <User className="w-12 h-12 text-gray-500" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block text-sm text-gray-500"
            />
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile_Component;
