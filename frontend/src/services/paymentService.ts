import { apiClient } from '../lib/apiClient';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface Subscription {
  subscriptionId: string;
  clientSecret: string;
  status: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export const paymentService = {
  // Create payment intent for one-time payments
  createPaymentIntent: async (amount: number, type: string, metadata?: any): Promise<PaymentIntent> => {
    return await apiClient.post('/payments/create-payment-intent', {
      amount,
      type,
      metadata
    });
  },

  // Create subscription (directory access £1/month or memberships)
  createSubscription: async (type: string, priceId?: string): Promise<Subscription> => {
    return await apiClient.post('/payments/create-subscription', {
      type,
      priceId
    });
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string): Promise<{ message: string }> => {
    return await apiClient.delete(`/payments/subscriptions/${subscriptionId}`);
  },

  // Get payment history
  getPaymentHistory: async (params?: { limit?: number; offset?: number; type?: string }): Promise<{
    payments: Payment[];
    pagination: { total: number; limit: number; offset: number };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);
    
    const query = queryParams.toString();
    return await apiClient.get(`/payments/history${query ? `?${query}` : ''}`);
  },

  // Get active subscriptions
  getSubscriptions: async (): Promise<{ subscriptions: any[] }> => {
    return await apiClient.get('/payments/subscriptions');
  },

  // Process refund
  processRefund: async (paymentId: string, amount?: number, reason?: string): Promise<{ message: string; refundId: string }> => {
    return await apiClient.post('/payments/refund', {
      paymentId,
      amount,
      reason
    });
  },

  // Purchase job lead with Stripe
  purchaseJobLead: async (jobLeadId: string, paymentMethodId?: string): Promise<{
    message: string;
    price: number;
    remainingCredits?: number;
    clientSecret?: string;
  }> => {
    return await apiClient.post('/payments/purchase-job-lead', {
      jobLeadId,
      paymentMethodId
    });
  },

  // Add credits (top-up) - For tradespeople balance
  // Min: €10, Max: €1000
  addCredits: async (amount: number): Promise<PaymentIntent & { amount: number; currency: string }> => {
    return await apiClient.post('/payments/add-credits', { amount });
  },

  // Confirm top-up after successful Stripe payment
  confirmTopUp: async (paymentIntentId: string): Promise<{
    message: string;
    amount: number;
    newBalance: number;
    currency: string;
  }> => {
    return await apiClient.post('/payments/confirm-topup', { paymentIntentId });
  },

  // Check directory access (for homeowners - now always free)
  checkDirectoryAccess: async (): Promise<{
    hasAccess: boolean;
    expiryDate?: string;
    subscriptionPrice?: string;
    reason?: string;
  }> => {
    return await apiClient.get('/payments/directory-access');
  },

  // Check directory listing status (for tradespeople)
  checkDirectoryListing: async (): Promise<{
    isListed: boolean;
    expiryDate?: string;
    subscriptionPrice?: string;
    benefits?: string[];
  }> => {
    return await apiClient.get('/payments/directory-listing');
  },

  // Create setup intent for saving cards
  createSetupIntent: async (): Promise<{ clientSecret: string }> => {
    return await apiClient.post('/payments/setup-intent', {});
  },

  // Get saved payment methods
  getPaymentMethods: async (): Promise<{ paymentMethods: PaymentMethod[] }> => {
    return await apiClient.get('/payments/payment-methods');
  },

  // ============= BOOST PLAN METHODS =============

  // Get available boost plans
  getBoostPlans: async (): Promise<{
    plans: Array<{
      id: string;
      name: string;
      price: number;
      duration: number;
      features: string[];
      savings?: string | null;
    }>;
  }> => {
    return await apiClient.get('/payments/boost-plans');
  },

  // Purchase boost plan
  purchaseBoostPlan: async (planId: string): Promise<PaymentIntent & { plan: any }> => {
    return await apiClient.post('/payments/purchase-boost', { planId });
  },

  // Confirm boost purchase after successful payment
  confirmBoostPurchase: async (paymentIntentId: string): Promise<{
    message: string;
    user: {
      membershipType: string;
      membershipExpiry: string;
    };
  }> => {
    return await apiClient.post('/payments/confirm-boost', { paymentIntentId });
  },

  // Get current membership status
  getMembershipStatus: async (): Promise<{
    membershipType: string | null;
    membershipExpiry: string | null;
    isActive: boolean;
    daysRemaining: number;
    verified: boolean;
  }> => {
    return await apiClient.get('/payments/membership-status');
  },

  // Get current balance from database
  getBalance: async (): Promise<{
    balance: number;
    currency: string;
  }> => {
    return await apiClient.get('/payments/balance');
  }
};

