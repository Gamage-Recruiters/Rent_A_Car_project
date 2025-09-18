import React, { useState, useEffect } from "react";
import {
  User,
  Car,
  Calendar,
  DollarSign,
  BarChart3,
  MessageCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SlidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

const Slidebar: React.FC<SlidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(`${BASE_URL}/${user.profileImage}`);
    }
  }, [user]);

  const tabs = [
    { id: "overview", label: "Overview", icon: Car },
    { id: "vehicles", label: "My Vehicles", icon: Car },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  const earnings = {
    thisMonth: 1250,
    lastMonth: 980,
    total: 5430,
    pending: 225,
  };

  const analytics = {
    totalViews: 1250,
    bookingRate: 68,
    averageRating: 4.8,
    responseTime: "2 hours",
  };

  const bookingRequests = [
    { id: "1", status: "pending" },
    { id: "2", status: "confirmed" },
    { id: "3", status: "completed" },
    { id: "4", status: "cancelled" },
  ];

  const pendingRequests = bookingRequests.filter(
    (b) => b.status === "pending"
  ).length;
  const activeBookings = bookingRequests.filter(
    (b) => b.status === "confirmed"
  ).length;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        {/* Profile section */}
        <div className="flex items-center space-x-3 mb-6">
          <img
              src={typeof preview === "string" && preview.startsWith("blob:") ? preview : `${BASE_URL}${user?.image ?? ""}`}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-2 border-green-500"
              />
          <div>
            <h3 className="font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">Car Owner</p>
            <p className="text-xs text-green-600 font-medium">
              Verified Partner
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-green-50 text-green-600 border border-green-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.id === "bookings" && pendingRequests > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                  {pendingRequests}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">This Month</span>
            <span className="font-semibold text-green-600">
              ${earnings.thisMonth}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Active Bookings</span>
            <span className="font-semibold text-blue-600">
              {activeBookings}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Avg Rating</span>
            <span className="font-semibold text-yellow-600">
              {analytics.averageRating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slidebar;
