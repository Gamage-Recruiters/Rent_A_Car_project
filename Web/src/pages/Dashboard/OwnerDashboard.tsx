// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Car,
//   Plus,
//   Calendar,
//   DollarSign,
//   Users,
//   Settings,
//   Eye,
//   Edit3,
//   Trash2,
//   MapPin,
//   Star,
//   Clock,
//   CheckCircle,
//   XCircle,
//   TrendingUp,
//   BarChart3,
//   AlertTriangle,
//   MessageCircle,
//   Phone,
//   Mail,
//   Download,
//   Filter,
//   Search,
//   Bell,
//   Activity,
// } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import { mockVehicles } from "../../data/mockData";

// const OwnerDashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState("overview");
//   const [bookingFilter, setBookingFilter] = useState("all");
//   const [vehicleFilter, setVehicleFilter] = useState("all");

//   // Mock owner data with comprehensive information
//   const ownerVehicles = mockVehicles.filter((v) => v.ownerId === "owner1");
// import { Link } from "react-router-dom";
// import {
//   Plus,
//   Bell,

// } from "lucide-react";

// // import { mockVehicles } from "../../data/mockData";
// // import Vehicle_component from "../../components/Owner/Vehicle_component";
// // import Booking_Component from "../../components/Owner/Booking_Component";
// // import Earning_Component from "../../components/Owner/Earning_Component";
// // import Analytics_Component from "../../components/Owner/Analytics_Component";
// // import Message_Component from "../../components/Owner/Message_Component";
// // import Profile_Component from "../../components/Owner/Profile_Component";
// // import Overview_Component from "../../components/Owner/Overview_Component";
// // import Slidebar from "../../components/Owner/Slidebar";

// const OwnerDashboard: React.FC = () => {

//   const [activeTab, setActiveTab] = useState("overview");

//   // Mock owner data with comprehensive information

//   const bookingRequests = [
//     {
//       id: "1",
//       vehicleId: "1",
//       userName: "John Smith",
//       userEmail: "john@example.com",
//       userPhone: "+1234567890",
//       startDate: "2024-01-20",
//       endDate: "2024-01-23",
//       totalPrice: 135,
//       status: "pending",
//       vehicle: mockVehicles[0],
//       requestedAt: "2024-01-15T10:30:00Z",
//       notes: "Need the car for a business trip",
//     },
//     {
//       id: "2",
//       vehicleId: "1",
//       userName: "Sarah Johnson",
//       userEmail: "sarah@example.com",
//       userPhone: "+1234567891",
//       startDate: "2024-01-25",
//       endDate: "2024-01-27",
//       totalPrice: 90,
//       status: "confirmed",
//       vehicle: mockVehicles[0],
//       requestedAt: "2024-01-14T15:20:00Z",
//       notes: "Weekend getaway",
//     },
//     {
//       id: "3",
//       vehicleId: "1",
//       userName: "Mike Davis",
//       userEmail: "mike@example.com",
//       userPhone: "+1234567892",
//       startDate: "2024-01-10",
//       endDate: "2024-01-12",
//       totalPrice: 90,
//       status: "completed",
//       vehicle: mockVehicles[0],
//       requestedAt: "2024-01-05T09:15:00Z",
//       notes: "Airport pickup needed",
//     },
//     {
//       id: "4",
//       vehicleId: "1",
//       userName: "Emily Wilson",
//       userEmail: "emily@example.com",
//       userPhone: "+1234567893",
//       startDate: "2024-01-08",
//       endDate: "2024-01-10",
//       totalPrice: 90,
//       status: "cancelled",
//       vehicle: mockVehicles[0],
//       requestedAt: "2024-01-03T14:45:00Z",
//       notes: "Plans changed",
//     },
//   ];

//   const earnings = {
//     thisMonth: 1250,
//     lastMonth: 980,
//     total: 5430,
//     pending: 225,
//   };

//   const analytics = {
//     totalViews: 1250,
//     bookingRate: 68,
//     averageRating: 4.8,
//     responseTime: "2 hours",
//   };

//   const tabs = [
//     { id: "overview", label: "Overview", icon: Car },
//     { id: "vehicles", label: "My Vehicles", icon: Car },
//     { id: "bookings", label: "Bookings", icon: Calendar },
//     { id: "earnings", label: "Earnings", icon: DollarSign },
//     { id: "analytics", label: "Analytics", icon: BarChart3 },
//     { id: "messages", label: "Messages", icon: MessageCircle },
//     { id: "profile", label: "Profile", icon: Settings },
//   ];

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "confirmed":
//         return "bg-blue-100 text-blue-800";
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "cancelled":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "pending":
//         return <Clock className="w-4 h-4" />;
//       case "confirmed":
//         return <CheckCircle className="w-4 h-4" />;
//       case "completed":
//         return <CheckCircle className="w-4 h-4" />;
//       case "cancelled":
//         return <XCircle className="w-4 h-4" />;
//       default:
//         return <Clock className="w-4 h-4" />;
//     }
//   };

//   const filteredBookings =
//     bookingFilter === "all"
//       ? bookingRequests
//       : bookingRequests.filter((booking) => booking.status === bookingFilter);

//   const filteredVehicles =
//     vehicleFilter === "all"
//       ? ownerVehicles
//       : ownerVehicles.filter((vehicle) => {
//           if (vehicleFilter === "available") return vehicle.availability;
//           if (vehicleFilter === "rented") return !vehicle.availability;
//           return true;
//         });

//   const pendingRequests = bookingRequests.filter(
//     (b) => b.status === "pending"
//   ).length;
//   const activeBookings = bookingRequests.filter(
//     (b) => b.status === "confirmed"
//   ).length;

//   const pendingRequests = bookingRequests.filter(
//     (b) => b.status === "pending"
//   ).length;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 Car Owner Dashboard
//               </h1>
//               <p className="text-gray-600">
//                 Manage your fleet and track your earnings
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button className="relative p-2 text-gray-600 hover:text-gray-900">
//                 <Bell className="w-6 h-6" />
//                 {pendingRequests > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {pendingRequests}
//                   </span>
//                 )}
//               </button>
//               <Link
//                 to="/add-vehicle"
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
//               >
//                 <Plus className="w-5 h-5" />
//                 <span>Add Vehicle</span>
//               </Link>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//               <div className="flex items-center space-x-3 mb-6">
//                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
//                   <Car className="w-8 h-8 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-900">{user?.name}</h3>
//                   <p className="text-sm text-gray-500">Car Owner</p>
//                   <p className="text-xs text-green-600 font-medium">
//                     Verified Partner
//                   </p>
//                 </div>
//               </div>

//               <nav className="space-y-2">
//                 {tabs.map((tab) => (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                       activeTab === tab.id
//                         ? "bg-green-50 text-green-600 border border-green-200 shadow-sm"
//                         : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
//                     }`}
//                   >
//                     <tab.icon className="w-5 h-5" />
//                     <span>{tab.label}</span>
//                     {tab.id === "bookings" && pendingRequests > 0 && (
//                       <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
//                         {pendingRequests}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </nav>
//             </div>

//             {/* Quick Stats */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">This Month</span>
//                   <span className="font-semibold text-green-600">
//                     ${earnings.thisMonth}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Active Bookings</span>
//                   <span className="font-semibold text-blue-600">
//                     {activeBookings}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-600">Avg Rating</span>
//                   <span className="font-semibold text-yellow-600">
//                     {analytics.averageRating}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             {activeTab === "overview" && (
//               <div className="space-y-6">
//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">Total Vehicles</p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {ownerVehicles.length}
//                         </p>
//                         <p className="text-xs text-green-600 flex items-center mt-1">
//                           <TrendingUp className="w-3 h-3 mr-1" />
//                           +1 this month
//                         </p>
//                       </div>
//                       <Car className="w-8 h-8 text-blue-600" />
//                     </div>
//                   </div>

//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">Active Bookings</p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {activeBookings}
//                         </p>
//                         <p className="text-xs text-blue-600">Current rentals</p>
//                       </div>
//                       <Calendar className="w-8 h-8 text-green-600" />
//                     </div>
//                   </div>

//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">
//                           Pending Requests
//                         </p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {pendingRequests}
//                         </p>
//                         <p className="text-xs text-yellow-600">
//                           Needs attention
//                         </p>
//                       </div>
//                       <Clock className="w-8 h-8 text-yellow-600" />
//                     </div>
//                   </div>

//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">
//                           Monthly Earnings
//                         </p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           ${earnings.thisMonth}
//                         </p>
//                         <p className="text-xs text-green-600 flex items-center mt-1">
//                           <TrendingUp className="w-3 h-3 mr-1" />
//                           +27% vs last month
//                         </p>
//                       </div>
//                       <DollarSign className="w-8 h-8 text-purple-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Recent Activity */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-xl font-semibold mb-4 flex items-center">
//                       <Activity className="w-5 h-5 mr-2 text-blue-600" />
//                       Recent Activity
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
//                         <CheckCircle className="w-5 h-5 text-blue-600" />
//                         <div>
//                           <p className="text-sm font-medium">
//                             New booking confirmed
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             Toyota Camry - Sarah Johnson
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
//                         <Clock className="w-5 h-5 text-yellow-600" />
//                         <div>
//                           <p className="text-sm font-medium">
//                             Pending booking request
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             Toyota Camry - John Smith
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
//                         <DollarSign className="w-5 h-5 text-green-600" />
//                         <div>
//                           <p className="text-sm font-medium">
//                             Payment received
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             $90 from Mike Davis
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-xl font-semibold mb-4">
//                       Performance Overview
//                     </h3>
//                     <div className="space-y-4">
//                       <div>
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="text-sm text-gray-600">
//                             Booking Rate
//                           </span>
//                           <span className="text-sm font-semibold">
//                             {analytics.bookingRate}%
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-blue-600 h-2 rounded-full"
//                             style={{ width: `${analytics.bookingRate}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="text-sm text-gray-600">
//                             Customer Rating
//                           </span>
//                           <span className="text-sm font-semibold">
//                             {analytics.averageRating}/5.0
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-yellow-500 h-2 rounded-full"
//                             style={{
//                               width: `${(analytics.averageRating / 5) * 100}%`,
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="text-sm text-gray-600">
//                             Response Time
//                           </span>
//                           <span className="text-sm font-semibold">
//                             {analytics.responseTime}
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-green-600 h-2 rounded-full"
//                             style={{ width: "85%" }}
//                           ></div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Recent Bookings */}
//                 <div className="bg-white rounded-xl shadow-md p-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-xl font-semibold">
//                       Recent Booking Requests
//                     </h3>
//                     <Link
//                       to="#"
//                       onClick={() => setActiveTab("bookings")}
//                       className="text-green-600 hover:text-green-700 font-medium"
//                     >
//                       View All
//                     </Link>
//                   </div>
//                   <div className="space-y-4">
//                     {bookingRequests.slice(0, 3).map((booking) => (
//                       <div
//                         key={booking.id}
//                         className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <img
//                             src={booking.vehicle.images[0]}
//                             alt={booking.vehicle.name}
//                             className="w-16 h-16 rounded-lg object-cover"
//                           />
//                           <div>
//                             <h4 className="font-semibold text-gray-900">
//                               {booking.userName}
//                             </h4>
//                             <p className="text-sm text-gray-600">
//                               {booking.vehicle.name}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               {booking.startDate} to {booking.endDate}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-semibold text-gray-900">
//                             ${booking.totalPrice}
//                           </p>
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
//                               booking.status
//                             )}`}
//                           >
//                             {getStatusIcon(booking.status)}
//                             <span className="ml-1">{booking.status}</span>
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "vehicles" && (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
//                   <h3 className="text-xl font-semibold">My Vehicles</h3>
//                   <div className="flex space-x-4">
//                     <select
//                       value={vehicleFilter}
//                       onChange={(e) => setVehicleFilter(e.target.value)}
//                       className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     >
//                       <option value="all">All Vehicles</option>
//                       <option value="available">Available</option>
//                       <option value="rented">Currently Rented</option>
//                     </select>
//                     <Link
//                       to="/add-vehicle"
//                       className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
//                     >
//                       <Plus className="w-5 h-5" />
//                       <span>Add Vehicle</span>
//                     </Link>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {filteredVehicles.map((vehicle) => (
//                     <div
//                       key={vehicle.id}
//                       className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
//                     >
//                       <div className="relative">
//                         <img
//                           src={vehicle.images[0]}
//                           alt={vehicle.name}
//                           className="w-full h-48 object-cover"
//                         />
//                         <div className="absolute top-4 right-4">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               vehicle.availability
//                                 ? "bg-green-100 text-green-800"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {vehicle.availability ? "Available" : "Rented"}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="p-6">
//                         <div className="flex justify-between items-start mb-4">
//                           <div>
//                             <h4 className="text-lg font-semibold text-gray-900">
//                               {vehicle.name}
//                             </h4>
//                             <p className="text-gray-600 flex items-center">
//                               <MapPin className="w-4 h-4 mr-1" />
//                               {vehicle.location}
//                             </p>
//                           </div>
//                           <div className="flex items-center space-x-1">
//                             <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                             <span className="text-sm font-medium">
//                               {vehicle.rating}
//                             </span>
//                           </div>
//                         </div>

//                         <div className="flex justify-between items-center mb-4">
//                           <span className="text-xl font-bold text-green-600">
//                             ${vehicle.pricePerDay}/day
//                           </span>
//                           <span className="text-sm text-gray-500">
//                             {vehicle.reviewCount} reviews
//                           </span>
//                         </div>

//                         <div className="grid grid-cols-3 gap-2 mb-4">
//                           <div className="text-center p-2 bg-gray-50 rounded">
//                             <p className="text-xs text-gray-500">Views</p>
//                             <p className="font-semibold">245</p>
//                           </div>
//                           <div className="text-center p-2 bg-gray-50 rounded">
//                             <p className="text-xs text-gray-500">Bookings</p>
//                             <p className="font-semibold">12</p>
//                           </div>
//                           <div className="text-center p-2 bg-gray-50 rounded">
//                             <p className="text-xs text-gray-500">Earnings</p>
//                             <p className="font-semibold">$540</p>
//                           </div>
//                         </div>

//                         <div className="flex space-x-2">
//                           <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
//                             <Eye className="w-4 h-4" />
//                             <span>View</span>
//                           </button>
//                           <Link
//                             to="/edit-vehicle"
//                             state={{ vehicle }}
//                             className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
//                           >
//                             <Edit3 className="w-4 h-4" />
//                             <span>Edit</span>
//                           </Link>
//                           <button className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {activeTab === "bookings" && (
//               <div className="space-y-6">
//                 <div className="bg-white rounded-xl shadow-md p-6">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
//                     <h3 className="text-xl font-semibold">Booking Requests</h3>
//                     <select
//                       value={bookingFilter}
//                       onChange={(e) => setBookingFilter(e.target.value)}
//                       className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     >
//                       <option value="all">All Bookings</option>
//                       <option value="pending">Pending</option>
//                       <option value="confirmed">Confirmed</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </select>
//                   </div>

//                   <div className="space-y-6">
//                     {filteredBookings.map((booking) => (
//                       <div
//                         key={booking.id}
//                         className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex items-start justify-between mb-4">
//                           <div className="flex items-center space-x-4">
//                             <img
//                               src={booking.vehicle.images[0]}
//                               alt={booking.vehicle.name}
//                               className="w-20 h-20 rounded-lg object-cover"
//                             />
//                             <div>
//                               <h4 className="text-lg font-semibold text-gray-900">
//                                 {booking.userName}
//                               </h4>
//                               <p className="text-gray-600">
//                                 {booking.userEmail}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {booking.vehicle.name}
//                               </p>
//                               <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
//                                 <div className="flex items-center space-x-1">
//                                   <Calendar className="w-4 h-4" />
//                                   <span>
//                                     {booking.startDate} to {booking.endDate}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center space-x-1">
//                                   <Clock className="w-4 h-4" />
//                                   <span>
//                                     {new Date(
//                                       booking.requestedAt
//                                     ).toLocaleDateString()}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-xl font-bold text-gray-900">
//                               ${booking.totalPrice}
//                             </p>
//                             <span
//                               className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(
//                                 booking.status
//                               )}`}
//                             >
//                               {getStatusIcon(booking.status)}
//                               <span className="ml-1">{booking.status}</span>
//                             </span>
//                           </div>
//                         </div>

//                         {booking.notes && (
//                           <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//                             <p className="text-sm text-gray-600">
//                               <strong>Customer Notes:</strong> {booking.notes}
//                             </p>
//                           </div>
//                         )}

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-4 text-sm text-gray-600">
//                             <div className="flex items-center space-x-1">
//                               <Phone className="w-4 h-4" />
//                               <span>{booking.userPhone}</span>
//                             </div>
//                             <div className="flex items-center space-x-1">
//                               <Mail className="w-4 h-4" />
//                               <span>{booking.userEmail}</span>
//                             </div>
//                           </div>

//                           <div className="flex space-x-2">
//                             {booking.status === "pending" && (
//                               <>
//                                 <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
//                                   <CheckCircle className="w-4 h-4" />
//                                   <span>Accept</span>
//                                 </button>
//                                 <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
//                                   <XCircle className="w-4 h-4" />
//                                   <span>Decline</span>
//                                 </button>
//                               </>
//                             )}
//                             {booking.status === "confirmed" && (
//                               <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
//                                 <MessageCircle className="w-4 h-4" />
//                                 <span>Contact Customer</span>
//                               </button>
//                             )}
//                             {booking.status === "completed" && (
//                               <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
//                                 <Download className="w-4 h-4" />
//                                 <span>Download Receipt</span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "earnings" && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-lg font-semibold mb-2">This Month</h3>
//                     <p className="text-3xl font-bold text-green-600">
//                       ${earnings.thisMonth}
//                     </p>
//                     <p className="text-sm text-green-600 flex items-center mt-1">
//                       <TrendingUp className="w-4 h-4 mr-1" />
//                       +27% vs last month
//                     </p>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-lg font-semibold mb-2">Last Month</h3>
//                     <p className="text-3xl font-bold text-gray-900">
//                       ${earnings.lastMonth}
//                     </p>
//                     <p className="text-sm text-gray-500">Previous period</p>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-lg font-semibold mb-2">
//                       Total Earnings
//                     </h3>
//                     <p className="text-3xl font-bold text-blue-600">
//                       ${earnings.total}
//                     </p>
//                     <p className="text-sm text-gray-500">All time</p>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md p-6">
//                   <h3 className="text-lg font-semibold mb-4">
//                     Recent Transactions
//                   </h3>
//                   <div className="space-y-4">
//                     {bookingRequests
//                       .filter((b) => b.status === "completed")
//                       .map((booking) => (
//                         <div
//                           key={booking.id}
//                           className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
//                         >
//                           <div className="flex items-center space-x-4">
//                             <img
//                               src={booking.vehicle.images[0]}
//                               alt={booking.vehicle.name}
//                               className="w-12 h-12 rounded-lg object-cover"
//                             />
//                             <div>
//                               <h4 className="font-medium text-gray-900">
//                                 {booking.userName}
//                               </h4>
//                               <p className="text-sm text-gray-600">
//                                 {booking.vehicle.name}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {booking.startDate}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-semibold text-green-600">
//                               +${booking.totalPrice}
//                             </p>
//                             <p className="text-sm text-gray-500">Completed</p>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md p-6">
//                   <h3 className="text-lg font-semibold mb-4">
//                     Pending Payments
//                   </h3>
//                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-yellow-800">
//                           Pending Payout
//                         </p>
//                         <p className="text-sm text-yellow-600">
//                           Will be processed on next payout date
//                         </p>
//                       </div>
//                       <p className="text-xl font-bold text-yellow-800">
//                         ${earnings.pending}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "analytics" && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-sm text-gray-600 mb-2">Total Views</h3>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {analytics.totalViews}
//                     </p>
//                     <p className="text-sm text-green-600 flex items-center mt-1">
//                       <TrendingUp className="w-4 h-4 mr-1" />
//                       +15% this week
//                     </p>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-sm text-gray-600 mb-2">Booking Rate</h3>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {analytics.bookingRate}%
//                     </p>
//                     <p className="text-sm text-blue-600">Above average</p>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-sm text-gray-600 mb-2">Avg Rating</h3>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {analytics.averageRating}
//                     </p>
//                     <p className="text-sm text-yellow-600">Excellent</p>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <h3 className="text-sm text-gray-600 mb-2">
//                       Response Time
//                     </h3>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {analytics.responseTime}
//                     </p>
//                     <p className="text-sm text-green-600">Fast response</p>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md p-6">
//                   <h3 className="text-lg font-semibold mb-4">
//                     Vehicle Performance
//                   </h3>
//                   <div className="space-y-4">
//                     {ownerVehicles.map((vehicle) => (
//                       <div
//                         key={vehicle.id}
//                         className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <img
//                             src={vehicle.images[0]}
//                             alt={vehicle.name}
//                             className="w-12 h-12 rounded-lg object-cover"
//                           />
//                           <div>
//                             <h4 className="font-medium text-gray-900">
//                               {vehicle.name}
//                             </h4>
//                             <p className="text-sm text-gray-600">
//                               {vehicle.location}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-semibold text-gray-900">
//                             85% booking rate
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             245 views this month
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "messages" && (
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h3 className="text-xl font-semibold mb-6">Messages</h3>
//                 <div className="space-y-4">
//                   <div className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <h4 className="font-medium text-gray-900">John Smith</h4>
//                       <span className="text-sm text-gray-500">2 hours ago</span>
//                     </div>
//                     <p className="text-gray-600 mb-2">
//                       Hi, I'm interested in booking your Toyota Camry for next
//                       weekend. Is it available?
//                     </p>
//                     <button className="text-blue-600 hover:text-blue-700 text-sm">
//                       Reply
//                     </button>
//                   </div>
//                   <div className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <h4 className="font-medium text-gray-900">
//                         Sarah Johnson
//                       </h4>
//                       <span className="text-sm text-gray-500">1 day ago</span>
//                     </div>
//                     <p className="text-gray-600 mb-2">
//                       Thank you for the great car! Everything went smoothly.
//                     </p>
//                     <button className="text-blue-600 hover:text-blue-700 text-sm">
//                       Reply
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "profile" && (
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h3 className="text-xl font-semibold mb-6">Owner Profile</h3>
//                 <form className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Business Name
//                       </label>
//                       <input
//                         type="text"
//                         defaultValue={user?.name}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Contact Email
//                       </label>
//                       <input
//                         type="email"
//                         defaultValue={user?.email}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phone Number
//                       </label>
//                       <input
//                         type="tel"
//                         defaultValue={user?.phone}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Business License
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="License number"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Tax ID
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="Tax identification number"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Insurance Policy
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="Insurance policy number"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Business Address
//                     </label>
//                     <textarea
//                       rows={3}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="Enter your business address"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Business Description
//                     </label>
//                     <textarea
//                       rows={4}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="Describe your car rental business"
//                     />
//                   </div>

//                   <div className="border-t pt-6">
//                     <h4 className="text-lg font-medium mb-4">
//                       Notification Preferences
//                     </h4>
//                     <div className="space-y-4">
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//                           defaultChecked
//                         />
//                         <span className="ml-2 text-sm text-gray-700">
//                           Email notifications for new booking requests
//                         </span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//                           defaultChecked
//                         />
//                         <span className="ml-2 text-sm text-gray-700">
//                           SMS notifications for urgent matters
//                         </span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-700">
//                           Weekly performance reports
//                         </span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-700">
//                           Marketing tips and best practices
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
//                   >
//                     Save Changes
//                   </button>
//                 </form>
//               </div>
//             )}
//           </div>
//           <Slidebar activeTab={activeTab} setActiveTab={setActiveTab}/>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//           {activeTab === "overview" && <Overview_Component />}
//           {activeTab === "vehicles" && <Vehicle_component />}
//           {activeTab === "bookings" && <Booking_Component />}
//           {activeTab === "earnings" && <Earning_Component />}
//           {activeTab === "analytics" && <Analytics_Component />}
//           {activeTab === "messages" && <Message_Component />}
//           {activeTab === "profile" && <Profile_Component />}
//         </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OwnerDashboard;

// ...existing code...
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Plus,
  Calendar,
  DollarSign,
  Users,
  Settings,
  Eye,
  Edit3,
  Trash2,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  MessageCircle,
  Phone,
  Mail,
  Download,
  Filter,
  Search,
  Bell,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  // Mock owner data with comprehensive information
  const ownerVehicles = mockVehicles.filter((v) => v.ownerId === "owner1");

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

  const tabs = [
    { id: "overview", label: "Overview", icon: Car },
    { id: "vehicles", label: "My Vehicles", icon: Car },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings =
    bookingFilter === "all"
      ? bookingRequests
      : bookingRequests.filter((booking) => booking.status === bookingFilter);

  const filteredVehicles =
    vehicleFilter === "all"
      ? ownerVehicles
      : ownerVehicles.filter((vehicle) => {
          if (vehicleFilter === "available") return vehicle.availability;
          if (vehicleFilter === "rented") return !vehicle.availability;
          return true;
        });

  const pendingRequests = bookingRequests.filter(
    (b) => b.status === "pending"
  ).length;
  const activeBookings = bookingRequests.filter(
    (b) => b.status === "confirmed"
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">Car Owner</p>
                  <p className="text-xs text-green-600 font-medium">
                    Verified Partner
                  </p>
                </div>
              </div>

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

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Vehicles</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {ownerVehicles.length}
                        </p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +1 this month
                        </p>
                      </div>
                      <Car className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {activeBookings}
                        </p>
                        <p className="text-xs text-blue-600">Current rentals</p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Pending Requests
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {pendingRequests}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Needs attention
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Monthly Earnings
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${earnings.thisMonth}
                        </p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +27% vs last month
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* (rest of overview UI unchanged) */}
                <Overview_Component />
              </div>
            )}

            {activeTab === "vehicles" && <Vehicle_component />}

            {activeTab === "bookings" && <Booking_Component />}

            {activeTab === "earnings" && <Earning_Component />}

            {activeTab === "analytics" && <Analytics_Component />}

            {activeTab === "messages" && <Message_Component />}

            {activeTab === "profile" && <Profile_Component />}
          </div>

          {/* Slidebar (optional secondary sidebar) */}
          <div className="hidden lg:block">
            <Slidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
