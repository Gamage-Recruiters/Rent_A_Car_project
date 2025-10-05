import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  Download,
} from "lucide-react";
import { useVehicle } from "../../context/VehicleContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface Booking {
  _id: string;
  vehicle: {
    _id: string;
    vehicleName: string;
    images: string[];
  } | string; // can be ID initially
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
  notes?: string;
}


const Booking_Component: React.FC = () => {
  const { getVehicleById } = useVehicle();
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_URL}/owner/bookings`, {
          withCredentials: true,
        });

        const bookingsData: Booking[] = res.data.bookings || [];   

   
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (b) => {
            let vehicle: Booking["vehicle"];
            try {
              if (typeof b.vehicle === "string") {
                const fetchedVehicle = await getVehicleById(b.vehicle);
                console.log("Fetched vehicle for booking", b._id, fetchedVehicle);
                vehicle =
                  fetchedVehicle && fetchedVehicle._id  
                    ? {
                        _id: fetchedVehicle._id,
                        vehicleName: fetchedVehicle.vehicleName,
                        images: fetchedVehicle.images,
                        
                      }
                    : b.vehicle; // fallback to ID if fetch fails
              } else {
                vehicle = b.vehicle;
                console.log("not fetched")
              }
            } catch (err) {
              console.error("Vehicle fetch error:", err);
              vehicle = b.vehicle; // fallback to original value (should be string or object)
            }
            return { ...b, vehicle };
          })
          
        );

        setBookings(enrichedBookings);
        console.log("Bookings with vehicles:", enrichedBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/owner/bookings/${bookingId}/${newStatus}`,
        {},
        { withCredentials: true }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, bookingStatus: newStatus } : b
        )
      );
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

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
      ? bookings
      : bookings.filter((booking) => booking.bookingStatus === bookingFilter);








  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-xl font-semibold">Booking Requests</h3>
          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No bookings found.</p>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
              <img
                src={
                  booking.vehicle &&
                  typeof booking.vehicle !== "string" &&
                  booking.vehicle.images &&
                  booking.vehicle.images.length > 0
                    ? `${(import.meta.env.VITE_API_URL || "http://localhost:8000").replace(
                        "/api",
                        ""
                      )}${booking.vehicle.images[0]}`
                    : "/placeholder-car.png"
                }
                alt={
                  booking.vehicle && typeof booking.vehicle !== "string"
                    ? booking.vehicle.vehicleName
                    : "Vehicle"
                }
                className="w-20 h-20 rounded-lg object-cover"
              />


                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {booking.customer?.firstName
                          ? `${booking.customer.firstName} ${booking.customer.lastName || ""}`
                          : "Customer"}
                      </h4>
                      <p className="text-gray-600">{booking.customer?.email}</p>
                      <p className="text-sm text-gray-500">
                        {booking.vehicle && typeof booking.vehicle !== "string"
                          ? booking.vehicle.vehicleName
                          : `Vehicle ID: ${booking.vehicle}`}

                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.pickupDate).toLocaleDateString()} to{" "}
                            {new Date(booking.dropoffDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
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

                
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Customer Notes:</strong> No booking notes...
                    </p>
                  </div>
                  
                

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{booking.customer?.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{booking.customer?.email}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {booking.bookingStatus === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(booking._id, "confirmed")
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(booking._id, "cancelled")
                          }
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                    {booking.bookingStatus === "confirmed" && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Contact Customer</span>
                      </button>
                    )}
                    {booking.bookingStatus === "completed" && (
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Download Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking_Component;
