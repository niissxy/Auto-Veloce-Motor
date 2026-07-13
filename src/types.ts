export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  year: number;
  price: number;
  promoPrice?: number;
  condition: 'New' | 'Used';
  transmission: 'Automatic' | 'CVT' | 'PDK' | 'Manual';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  km: number;
  badge: 'Certified' | 'New Arrival' | 'Hot Deal' | 'Low KM' | 'Luxury Collection' | 'Electric Vehicle';
  badges: string[];
  installmentFrom: number;
  dpMin: number;
  description: string;
  images: string[];
  specs: {
    dimensions: string;
    engine: string;
    acceleration: string;
    topSpeed: string;
  };
  warranty: string;
  branchName: string;
}

export interface RentalVehicle {
  id: string;
  name: string;
  type: 'Luxury' | 'SUV' | 'VIP' | 'Group';
  dailyPrice: number;
  withDriverPrice: number;
  deposit: number;
  image: string;
  branchName: string;
  specs: string[];
}

export interface DetailingService {
  id: string;
  name: string;
  category: 'Clean' | 'Coating' | 'Polishing';
  description: string;
  duration: string;
  priceSmall: number;
  priceLarge: number;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  expiryDate: string;
  bannerImage: string;
}

export interface LeasingPartner {
  id: string;
  name: string;
  interestRate: string;
  logoUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  body: string;
  imageUrl: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  profession: string;
  rating: number;
  feedback: string;
}

export interface Lead {
  id: string;
  name: string;
  whatsApp: string;
  email: string;
  type: 'Test Drive' | 'Trade-In' | 'Rental' | 'Detailing' | 'General';
  status: 'New' | 'Contacted' | 'Closed Won' | 'Closed Lost';
  assignedTo: string;
  createdAt: string;
  details?: {
    vehicleId?: string;
    vehicleName?: string;
    oldVehicleName?: string;
    oldVehicleYear?: number;
    oldVehicleKM?: number;
    customerExpectedPrice?: number;
    targetVehicleId?: string;
    targetVehicleName?: string;
    targetVehiclePrice?: number;
    expectedPrice?: number;
    netDue?: number;
    detailingServiceId?: string;
    detailingServiceName?: string;
    message?: string;
    comment?: string;
  };
  notes: Array<{
    id: string;
    date: string;
    author: string;
    text: string;
  }>;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: 'Test Drive' | 'Rental' | 'Detailing';
  itemId: string;
  itemName: string;
  branchName: string;
  date: string;
  time?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Rescheduled';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  details: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  isAdmin: boolean;
}

