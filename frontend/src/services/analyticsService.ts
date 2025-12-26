import { apiClient } from '../lib/apiClient';

export const analyticsService = {
  trackView: async (type: string, targetId?: string, metadata?: any) => {
    return await apiClient.post('/analytics/track-view', {
      type,
      targetId,
      metadata
    });
  },

  getProfileStats: async () => {
    return await apiClient.get('/analytics/profile-stats');
  },
};
