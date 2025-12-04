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

  // Add credits (top-up)
  addCredits: async (amount: number): Promise<PaymentIntent> => {
    return await apiClient.post('/payments/add-credits', { amount });
  },

  // Check directory access (for homeowners)
  checkDirectoryAccess: async (): Promise<{
    hasAccess: boolean;
    expiryDate?: string;
    subscriptionPrice?: string;
    reason?: string;
  }> => {
    return await apiClient.get('/payments/directory-access');
  },

  // Create setup intent for saving cards
  createSetupIntent: async (): Promise<{ clientSecret: string }> => {
    return await apiClient.post('/payments/setup-intent', {});
  },

  // Get saved payment methods
  getPaymentMethods: async (): Promise<{ paymentMethods: PaymentMethod[] }> => {
    return await apiClient.get('/payments/payment-methods');
  }
};

