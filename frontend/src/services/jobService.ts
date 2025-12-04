import { apiClient } from '../lib/apiClient';

export interface CreateJobLeadData {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  urgency: 'Low' | 'Medium' | 'High';
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  maxPurchases?: number;
  price?: number;
  latitude?: number;
  longitude?: number;
}

export interface ExpressInterestData {
  message: string;
  price: number;
}

export interface UpdateJobLeadData {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  budget?: string;
  urgency?: 'Low' | 'Medium' | 'High';
  contactDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  isActive?: boolean;
  hiredTradesperson?: string;
}

export const jobService = {
  getJobLeads: async (params?: {
    category?: string;
    location?: string;
    urgency?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.urgency) queryParams.append('urgency', params.urgency);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const query = queryParams.toString();
    return await apiClient.get(`/jobs${query ? `?${query}` : ''}`);
  },

  getJobLeadById: async (id: string) => {
    return await apiClient.get(`/jobs/${id}`);
  },

  createJobLead: async (data: CreateJobLeadData) => {
    return await apiClient.post('/jobs', data);
  },

  getMyJobs: async () => {
    return await apiClient.get('/jobs/my/jobs');
  },

  updateJobLead: async (id: string, data: UpdateJobLeadData) => {
    return await apiClient.put(`/jobs/${id}`, data);
  },

  deleteJobLead: async (id: string) => {
    return await apiClient.delete(`/jobs/${id}`);
  },

  purchaseJobLead: async (id: string) => {
    return await apiClient.post(`/jobs/${id}/purchase`);
  },

  expressInterest: async (id: string, data: ExpressInterestData) => {
    return await apiClient.post(`/jobs/${id}/interest`, data);
  },

  updateInterestStatus: async (jobId: string, interestId: string, status: 'accepted' | 'rejected') => {
    return await apiClient.put(`/jobs/${jobId}/interests/${interestId}/status`, { status });
  },
};
