export interface User {
  id: string;
  name: string;
  email: string;
  type: 'homeowner' | 'tradesperson';
  avatar?: string;
  location?: string;
  trades?: string[];
  rating?: number;
  reviews?: number;
  verified?: boolean;
  credits?: number;
  membershipType?: 'none' | 'basic' | 'premium' | 'unlimited_5_year';
  membershipExpiry?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verificationData?: any;
  accountStatus?: 'active' | 'parked' | 'deleted';
  parkedDate?: string;
  reactivatedDate?: string;
  workingArea?: {
    centerLocation: string;
    radius: number;
    coordinates?: { lat: number; lng: number };
  };
  // Tradesperson-specific fields
  phone?: string;
  businessName?: string;
  companyDescription?: string;
  portfolio?: PortfolioItem[];
}

export interface JobLead {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  urgency: 'Low' | 'Medium' | 'High';
  postedBy: string;
  postedDate: string;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  purchasedBy: string[];
  purchasedByDetails?: User[]; // Full user details for purchasers
  maxPurchases: number;
  price: number;
  interests: Interest[];
  isActive?: boolean;
  hiredTradesperson?: string;
  dismissedBy?: string[];
  cancelledAt?: string;
}

export interface Interest {
  id: string;
  tradespersonId: string;
  tradespersonName: string;
  tradespersonDetails?: User; // Full user details for the tradesperson
  message: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  price: number;
}

export interface QuoteRequest {
  id: string;
  homeownerId: string;
  homeownerName: string;
  projectTitle: string;
  projectDescription: string;
  category: string;
  location: string;
  budget: string;
  urgency: 'Low' | 'Medium' | 'High';
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  responses: QuoteResponse[];
  maxResponses: number;
  createdAt: string;
}

export interface QuoteResponse {
  id: string;
  tradespersonId: string;
  tradespersonName: string;
  quotedPrice: number;
  description: string;
  timeline: string;
  paidAmount: number;
  membershipDiscount: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Review {
  id: string;
  jobId: string;
  tradespersonId: string;
  homeownerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  homeowner?: { name: string; location?: string; avatar?: string };
  tradesperson?: { name: string; trades?: string[]; avatar?: string };
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  jobId: string;
  jobTitle: string;
  homeownerId: string;
  tradespersonId: string;
  otherUserId?: string;
  messages: Message[];
  createdAt: string;
  unreadCount: number;
  lastMessage?: Message;
}

export interface PortfolioItem {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  currentView: string;
  serviceFilter: string | null;
  quoteRequests: QuoteRequest[];
  jobLeads: JobLead[];
  users: User[];
  reviews: Review[];
  conversations: Conversation[];
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  userType: 'homeowner' | 'tradesperson';
  isLoading: boolean;
}