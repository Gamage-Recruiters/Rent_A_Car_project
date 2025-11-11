// import React, { useState, useEffect } from "react";
// import { useVehicle } from "../../context/VehicleContext";
// import { Vehicle, Booking } from "../../types";
// import { getOwnerBookings } from "../../services/bookingService";
// import {
//   Car,
//   Calendar,
//   DollarSign,
//   Clock,
//   CheckCircle,
//   XCircle,
//   TrendingUp,
//   Activity,
// } from "lucide-react";

// const Overview_Component: React.FC = () => {

//   const [vehicles, setVehicles] = useState<Vehicle[]>([]);
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { getVehiclesByOwner } = useVehicle();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [vehicleData, bookingData] = await Promise.all([
//           getVehiclesByOwner(),
//           getOwnerBookings(),
//         ]);
//         setVehicles(vehicleData);
//         setBookings(bookingData);
//       } catch (error) {
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [getVehiclesByOwner]);

//   const monthlyEarnings = bookings
//     .filter((b) => b.status === "completed")
//     .reduce((acc, b) => acc + b.totalPrice, 0);

//   const totalViews = vehicles.reduce((acc, v) => acc + (v.views || 0), 0);
//   const bookingRate = totalViews > 0 ? (bookings.length / totalViews) * 100 : 0;
//   const averageRating = vehicles.length > 0 ? vehicles.reduce((acc, v) => acc + (v.rating || 0), 0) / vehicles.length : 0;

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

//   const pendingRequests = bookings.filter(
//     (b) => b.status === "pending"
//   ).length;

//   const activeBookings = bookings.filter(
//     (b) => b.status === "confirmed"
//   ).length;

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Owner Dashboard</h2>
//       <div className="space-y-6">
//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">Total Vehicles</p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {vehicles.length}
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
//                           ${monthlyEarnings}
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
//                       {bookings
//                         .filter((b) => b.status === "confirmed")
//                         .slice(0, 1)
//                         .map((booking) => (
//                           <div
//                             key={booking.id}
//                             className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
//                           >
//                             <CheckCircle className="w-5 h-5 text-blue-600" />
//                             <div>
//                               <p className="text-sm font-medium">
//                                 New booking confirmed
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 {vehicles.find((v) => v._id === booking.vehicleId)?.name} -{" "}
//                                 {booking.userName}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       {bookings
//                         .filter((b) => b.status === "pending")
//                         .slice(0, 1)
//                         .map((booking) => (
//                           <div
//                             key={booking.id}
//                             className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg"
//                           >
//                             <Clock className="w-5 h-5 text-yellow-600" />
//                             <div>
//                               <p className="text-sm font-medium">
//                                 Pending booking request
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 {vehicles.find((v) => v._id === booking.vehicleId)?.name} -{" "}
//                                 {booking.userName}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       {bookings
//                         .filter((b) => b.status === "completed")
//                         .slice(0, 1)
//                         .map((booking) => (
//                           <div
//                             key={booking.id}
//                             className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
//                           >
//                             <DollarSign className="w-5 h-5 text-green-600" />
//                             <div>
//                               <p className="text-sm font-medium">
//                                 Payment received
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 ${booking.totalPrice} from {booking.userName}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
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
//                             {bookingRate.toFixed(2)}%
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-blue-600 h-2 rounded-full"
//                             style={{ width: `${bookingRate.toFixed(2)}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="text-sm text-gray-600">
//                             Customer Rating
//                           </span>
//                           <span className="text-sm font-semibold">
//                             {averageRating.toFixed(1)}/5.0
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-yellow-500 h-2 rounded-full"
//                             style={{
//                               width: `${(averageRating / 5) * 100}%`,
//                             }}
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
//                     <button
//                       onClick={() => {}}
//                       className="text-green-600 hover:text-green-700 font-medium"
//                     >
//                       View All
//                     </button>
//                   </div>
//                   <div className="space-y-4">
//                     {bookings.slice(0, 3).map((booking) => {
//                       const vehicle = vehicles.find((v) => v._id === booking.vehicleId);
//                       return (
//                         <div
//                           key={booking.id}
//                           className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
//                         >
//                           <div className="flex items-center space-x-4">
//                             {vehicle && (
//                               <img
//                                 src={vehicle.images[0]}
//                                 alt={vehicle.name}
//                                 className="w-16 h-16 rounded-lg object-cover"
//                               />
//                             )}
//                             <div>
//                               <h4 className="font-semibold text-gray-900">
//                                 {booking.userName}
//                               </h4>
//                               {vehicle && (
//                                 <p className="text-sm text-gray-600">
//                                   {vehicle.name}
//                                 </p>
//                               )}
//                               <p className="text-sm text-gray-500">
//                                 {booking.startDate} to {booking.endDate}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-semibold text-gray-900">
//                               ${booking.totalPrice}
//                             </p>
//                             <span
//                               className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
//                                 booking.status
//                               )}`}
//                             >
//                               {getStatusIcon(booking.status)}
//                               <span className="ml-1">{booking.status}</span>
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//     </>
//   );
// };

// export default Overview_Component;


import React, { useState, useEffect } from "react";
import { useVehicle } from "../../context/VehicleContext";
import { Vehicle } from "../../types";
import axios from "axios";
import {
  Car,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface Booking {
  _id: string;
  vehicle: string | {
    _id: string;
    vehicleName: string;
    images: string[];
  };
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  bookingStatus: string;
  createdAt: string;
}

const Overview_Component: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { getVehiclesByOwner, getVehicleById } = useVehicle();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleData, bookingRes] = await Promise.all([
          getVehiclesByOwner(),
          axios.get(`${API_URL}/owner/bookings`, { withCredentials: true }),
        ]);

        // Enrich booking data with vehicle details
        const bookingsData: Booking[] = bookingRes.data.bookings || [];
        const enriched = (
          await Promise.all(
            bookingsData.map(async (b) => {
              if (typeof b.vehicle === "string") {
                const v = await getVehicleById(b.vehicle);
                if (v && v._id) {
                  return {
                    ...b,
                    vehicle: {
                      _id: v._id as string,
                      vehicleName: v.vehicleName,
                      images: v.images,
                    },
                  };
                } else {
                  // Skip bookings with missing vehicle details
                  return null;
                }
              }
              return b;
            })
          )
        ).filter((b): b is Booking => b !== null);

        setVehicles(vehicleData);
        setBookings(enriched);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getVehiclesByOwner, getVehicleById]);

  // ✅ Metrics
  const monthlyEarnings = bookings
    .filter((b) => b.bookingStatus === "completed")
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  const totalViews = vehicles.reduce((acc, v) => acc + (v.views || 0), 0);
  const bookingRate = totalViews > 0 ? (bookings.length / totalViews) * 100 : 0;
  const averageRating =
    vehicles.length > 0
      ? vehicles.reduce((acc, v) => acc + (v.rating || 0), 0) / vehicles.length
      : 0;

  const pendingRequests = bookings.filter(
    (b) => b.bookingStatus === "pending"
  ).length;
  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === "confirmed"
  ).length;

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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Owner Dashboard</h2>

      <div className="space-y-6">
        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.length}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +1 this month
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
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingRequests}
                </p>
                <p className="text-xs text-yellow-600">Needs attention</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${monthlyEarnings}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +27% vs last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* ✅ Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Booking Requests</h3>
          </div>
          <div className="space-y-4">
            {bookings.slice(0, 3).map((booking) => {
              const vehicle =
                typeof booking.vehicle !== "string" ? booking.vehicle : null;
              return (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {vehicle && vehicle.images && (
                      <img
                        src={`${API_URL.replace("/api", "")}${vehicle.images[0]}`}
                        alt={vehicle.vehicleName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {booking.customer?.firstName || "Customer"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {vehicle?.vehicleName || "Vehicle"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.pickupDate).toLocaleDateString()} -{" "}
                        {new Date(booking.dropoffDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${booking.totalAmount}
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(
                        booking.bookingStatus
                      )}`}
                    >
                      {getStatusIcon(booking.bookingStatus)}
                      <span className="ml-1 capitalize">
                        {booking.bookingStatus}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview_Component;
