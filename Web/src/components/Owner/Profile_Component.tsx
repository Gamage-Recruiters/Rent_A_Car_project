import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {

  User,
} from "lucide-react";

const Profile_Component: React.FC = () => {
      const { user } = useAuth();
    
      const [profileImage, setProfileImage] = useState(user?.profileImage || null);

      const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfileImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-2xl font-semibold mb-6">Owner Profile</h3>
                <form className="space-y-8">
                  {/* Profile Picture Section */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">
                      Profile Picture
                    </h4>
                    <div className="flex items-center space-x-6">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile Preview"
                          className="w-28 h-28 rounded-full object-cover border-2 border-green-500"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center border-2 border-green-500">
                          <User className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0 file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload JPG, PNG, or JPEG (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Info Section */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">
                      Business Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          defaultValue={user?.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business License
                        </label>
                        <input
                          type="text"
                          placeholder="License number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID
                        </label>
                        <input
                          type="text"
                          placeholder="Tax identification number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Policy
                        </label>
                        <input
                          type="text"
                          placeholder="Insurance policy number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Address & Description */}
                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter your business address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Description
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Describe your car rental business"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium mb-4">
                      Notification Preferences
                    </h4>
                    <div className="space-y-3">
                      {[
                        "Email notifications for new booking requests",
                        "SMS notifications for urgent matters",
                        "Weekly performance reports",
                        "Marketing tips and best practices",
                      ].map((label, i) => (
                        <label key={i} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked={i < 2}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
    </>
  );
};

export default Profile_Component;


