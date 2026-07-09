// Shared types between main app and rider app
export interface Rider {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: 'motorcycle' | 'bicycle' | 'car' | 'van';
  vehicle_plate: string;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  current_location?: {
    lat: number;
    lng: number;
  };
  created_at: string;
  updated_at: string;
}

export interface RiderBooking {
  id: string;
  booking_id: string;
  rider_id: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_location: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff_location: {
    address: string;
    lat: number;
    lng: number;
  };
  estimated_time: number; // in minutes
  distance: number; // in km
  earnings: number;
  created_at: string;
  updated_at: string;
}

// API endpoints for rider app integration
export const RIDER_API_ENDPOINTS = {
  base: '/api/rider',
  acceptBooking: '/api/rider/bookings/accept',
  updateLocation: '/api/rider/location',
  getAssignedBookings: '/api/rider/bookings',
  updateBookingStatus: '/api/rider/bookings/status',
  getEarnings: '/api/rider/earnings',
};