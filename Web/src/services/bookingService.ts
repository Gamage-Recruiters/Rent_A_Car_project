
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/owner/booking';

const getOwnerBookings = async () => {
  try {
    const token = localStorage.getItem('ownerToken');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.bookings;
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    throw error;
  }
};

const changeBookingStatus = async (bookingId: string, status: string) => {
    try {
        const token = localStorage.getItem('ownerToken');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.put(`${API_URL}/${bookingId}/${status}`, {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        return response.data;
    } catch (error) {
        console.error('Error changing booking status:', error);
        throw error;
    }
};

export { getOwnerBookings, changeBookingStatus };
