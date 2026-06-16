export type SavedAddress = {
  id: string;
  label: string; // e.g., Home, Work, Aunt's House (Phua)
  address: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

export type PaymentMethod = {
  id: string;
  type: 'upi' | 'card';
  details: string; // e.g., pay@axis, **** **** **** 4111
  isDefault: boolean;
};

export type UserReward = {
  id: string;
  title: string;
  desc: string;
  value: number; // cashback or coupon code
  status: 'unscratched' | 'scratched' | 'redeemed';
  code?: string;
  createdAt: number;
};

export type SupportTicket = {
  id: string;
  customerId: string;
  customerName: string;
  issue: string;
  desc: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  reply?: string;
  createdAt: number;
};

export type User = {
  uid: string;
  name: string;
  mobile: string;
  role: 'customer' | 'admin' | 'rider';
  createdAt: number;
  savedAddresses?: SavedAddress[];
  emergencyContacts?: EmergencyContact[];
  paymentMethods?: PaymentMethod[];
  rewards?: UserReward[];
  currentLanguage?: 'en' | 'hi';
  avatar?: string;
};

export type FareRoute = {
  routeId: string;
  pickupName: string;
  dropName: string;
  fare: number;
  isActive: boolean;
  createdAt: number;
};

export type Booking = {
  bookingId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  bookingType: 'fixed' | 'custom';
  selectedRouteId?: string;
  pickupName: string;
  dropName: string;
  pickupLocation?: { lat: number; lng: number };
  dropLocation?: { lat: number; lng: number };
  distanceKm?: number;
  fare?: number;
  status: 'searching' | 'accepted' | 'arriving' | 'started' | 'completed' | 'cancelled' | 'scheduled';
  assignedRiderId?: string;
  rideOtp: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  scheduledTime?: string;
};

export type Rider = {
  riderId: string;
  name: string;
  mobile: string;
  bikeNumber: string;
  licenseNumber: string;
  photoUrl?: string;
  isVerified: boolean;
  isOnline: boolean;
  currentLocation?: { lat: number; lng: number };
  averageRating: number;
  totalRides: number;
  createdAt: number;
};

export type Rating = {
  ratingId: string;
  bookingId: string;
  customerId: string;
  riderId: string;
  stars: number;
  comment?: string;
  createdAt: number;
};

// Demo mock data
export const DEMO_ROUTES: FareRoute[] = [
  { routeId: 'route-1', pickupName: 'Patna Junction', dropName: 'Gandhi Maidan', fare: 40, isActive: true, createdAt: Date.now() },
  { routeId: 'route-2', pickupName: 'Samastipur Station', dropName: 'Tajpur Road', fare: 30, isActive: true, createdAt: Date.now() },
  { routeId: 'route-3', pickupName: 'Darbhanga Tower', dropName: 'LNMU Campus', fare: 25, isActive: true, createdAt: Date.now() },
  { routeId: 'route-4', pickupName: 'Muzaffarpur Junction', dropName: 'Mithanpura', fare: 35, isActive: true, createdAt: Date.now() },
  { routeId: 'route-5', pickupName: 'Gaya Station', dropName: 'Bodh Gaya', fare: 80, isActive: true, createdAt: Date.now() },
];
