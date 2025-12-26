import { apiClient } from '../lib/apiClient';

export const settingsService = {
  getPublicSettings: async () => {
    return await apiClient.get('/settings/public');
  },
};
