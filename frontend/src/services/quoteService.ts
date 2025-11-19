import { apiClient } from '../lib/apiClient';

export interface CreateQuoteRequestData {
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
  maxResponses?: number;
}

export interface SubmitQuoteResponseData {
  quotedPrice: number;
  description: string;
  timeline: string;
  paidAmount?: number;
  membershipDiscount?: number;
}

export const quoteService = {
  getQuoteRequests: async (params?: {
    category?: string;
    location?: string;
    urgency?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.urgency) queryParams.append('urgency', params.urgency);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const query = queryParams.toString();
    return await apiClient.get(`/quotes${query ? `?${query}` : ''}`);
  },

  getQuoteRequestById: async (id: string) => {
    return await apiClient.get(`/quotes/${id}`);
  },

  createQuoteRequest: async (data: CreateQuoteRequestData) => {
    return await apiClient.post('/quotes', data);
  },

  getMyQuoteRequests: async () => {
    return await apiClient.get('/quotes/my/requests');
  },

  deleteQuoteRequest: async (id: string) => {
    return await apiClient.delete(`/quotes/${id}`);
  },

  submitQuoteResponse: async (id: string, data: SubmitQuoteResponseData) => {
    return await apiClient.post(`/quotes/${id}/respond`, data);
  },

  updateQuoteResponseStatus: async (
    quoteId: string,
    responseId: string,
    status: 'accepted' | 'declined'
  ) => {
    return await apiClient.put(`/quotes/${quoteId}/responses/${responseId}/status`, { status });
  },
};
