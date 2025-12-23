import { apiClient } from '../lib/apiClient';

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
  location?: string;
  trades?: string[];
  workingArea?: {
    centerLocation: string;
    radius: number;
    coordinates?: { lat: number; lng: number };
  };
}

export interface UpdateMembershipData {
  membershipType: 'none' | 'basic' | 'premium' | 'unlimited_5_year';
}

export interface UpdateCreditsData {
  amount: number;
  operation: 'add' | 'subtract';
}

export const userService = {
  getUserById: async (id: string) => {
    return await apiClient.get(`/users/${id}`);
  },

  getTradespeople: async (params?: {
    trade?: string;
    location?: string;
    verified?: boolean;
    minRating?: number;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.trade) queryParams.append('trade', params.trade);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.verified !== undefined) queryParams.append('verified', String(params.verified));
    if (params?.minRating) queryParams.append('minRating', String(params.minRating));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const query = queryParams.toString();
    return await apiClient.get(`/users/tradespeople${query ? `?${query}` : ''}`);
  },

  updateProfile: async (data: UpdateProfileData) => {
    return await apiClient.put('/users/profile', data);
  },

  updateMembership: async (data: UpdateMembershipData) => {
    return await apiClient.put('/users/membership', data);
  },

  updateCredits: async (data: UpdateCreditsData) => {
    return await apiClient.put('/users/credits', data);
  },

  manageDirectoryListing: async (action: 'cancel' | 'pause' | 'resume') => {
    return await apiClient.post('/users/directory/manage', { action });
  },

  uploadProfilePhoto: async (imageBase64: string) => {
    return await apiClient.post('/users/profile/photo', { image: imageBase64 });
  },
};
