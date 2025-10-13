import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Bell,

} from "lucide-react";

import { mockVehicles } from "../../data/mockData";
import Vehicle_component from "../../components/Owner/Vehicle_component";
import Booking_Component from "../../components/Owner/Booking_Component";
import Earning_Component from "../../components/Owner/Earning_Component";
import Analytics_Component from "../../components/Owner/Analytics_Component";
import Message_Component from "../../components/Owner/Message_Component";
import Profile_Component from "../../components/Owner/Profile_Component";
import Overview_Component from "../../components/Owner/Overview_Component";
import Slidebar from "../../components/Owner/Slidebar";


const OwnerDashboard: React.FC = () => {

  const [activeTab, setActiveTab] = useState("overview");

  // Mock owner data with comprehensive information

  const bookingRequests = [
    {
      id: "1",
      vehicleId: "1",
      userName: "John Smith",
      userEmail: "john@example.com",
      userPhone: "+1234567890",
      startDate: "2024-01-20",
      endDate: "2024-01-23",
      totalPrice: 135,
      status: "pending",
      vehicle: mockVehicles[0],
      requestedAt: "2024-01-15T10:30:00Z",
      notes: "Need the car for a business trip",
    },
    {
      id: "2",
      vehicleId: "1",
      userName: "Sarah Johnson",
      userEmail: "sarah@example.com",
      userPhone: "+1234567891",
      startDate: "2024-01-25",
      endDate: "2024-01-27",
      totalPrice: 90,
      status: "confirmed",
      vehicle: mockVehicles[0],
      requestedAt: "2024-01-14T15:20:00Z",
      notes: "Weekend getaway",
    },
    {
      id: "3",
      vehicleId: "1",
      userName: "Mike Davis",
      userEmail: "mike@example.com",
      userPhone: "+1234567892",
      startDate: "2024-01-10",
      endDate: "2024-01-12",
      totalPrice: 90,
      status: "completed",
      vehicle: mockVehicles[0],
      requestedAt: "2024-01-05T09:15:00Z",
      notes: "Airport pickup needed",
    },
    {
      id: "4",
      vehicleId: "1",
      userName: "Emily Wilson",
      userEmail: "emily@example.com",
      userPhone: "+1234567893",
      startDate: "2024-01-08",
      endDate: "2024-01-10",
      totalPrice: 90,
      status: "cancelled",
      vehicle: mockVehicles[0],
      requestedAt: "2024-01-03T14:45:00Z",
      notes: "Plans changed",
    },
  ];


  const pendingRequests = bookingRequests.filter(
    (b) => b.status === "pending"
  ).length;



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Car Owner Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your fleet and track your earnings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                {pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests}
                  </span>
                )}
              </button>
              <Link
                to="/add-vehicle"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Vehicle</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <Slidebar activeTab={activeTab} setActiveTab={setActiveTab}/>

          {/* Main Content */}
          <div className="lg:col-span-3">
          {activeTab === "overview" && <Overview_Component />}
          {activeTab === "vehicles" && <Vehicle_component />}
          {activeTab === "bookings" && <Booking_Component />}
          {activeTab === "earnings" && <Earning_Component />}
          {activeTab === "analytics" && <Analytics_Component />}
          {activeTab === "messages" && <Message_Component />}
          {activeTab === "profile" && <Profile_Component />}
        </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;