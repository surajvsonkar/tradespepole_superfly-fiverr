import { apiClient, setAuthToken, removeAuthToken } from '../lib/apiClient';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  type: 'homeowner' | 'tradesperson';
  location?: string;
  trades?: string[];
  workingArea?: {
    centerLocation: string;
    radius: number;
    coordinates?: { lat: number; lng: number };
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  logout: () => {
    removeAuthToken();
  },
};
