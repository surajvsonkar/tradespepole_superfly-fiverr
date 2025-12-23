import { apiClient, setAuthToken, removeAuthToken, setRefreshToken, getRefreshToken } from '../lib/apiClient';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  type: 'homeowner' | 'tradesperson';
  location?: string;
  trades?: string[];
  workingArea?: {
    centerLocation: string;
    radius: number;
    coordinates?: { lat: number; lng: number };
  };
  hourlyRate?: number;
  captchaToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Store tokens from response
const handleAuthResponse = (response: any) => {
  if (response.token) {
    setAuthToken(response.token);
  }
  if (response.refreshToken) {
    setRefreshToken(response.refreshToken);
  }
  return response;
};

export const authService = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return handleAuthResponse(response);
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    return handleAuthResponse(response);
  },

  verifyEmail: async (token: string) => {
    return await apiClient.post('/auth/verify-email', { token });
  },

  forgotPassword: async (email: string): Promise<{ message: string; resetUrl?: string; developmentNote?: string }> => {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: any) => {
    return await apiClient.post('/auth/reset-password', data);
  },

  resendVerification: async (email: string) => {
    return await apiClient.post('/auth/resend-verification', { email });
  },

  googleLogin: async (token: string, userType?: string) => {
    const response = await apiClient.post('/auth/google', { token, userType });
    return handleAuthResponse(response);
  },

  facebookLogin: async (accessToken: string, userType?: string) => {
    const response = await apiClient.post('/auth/facebook', { accessToken, userType });
    return handleAuthResponse(response);
  },

  linkedinLogin: async (code: string, redirectUri: string, userType?: string) => {
    const response = await apiClient.post('/auth/linkedin', { code, redirectUri, userType });
    return handleAuthResponse(response);
  },

  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return handleAuthResponse(response);
  },

  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  logout: () => {
    removeAuthToken();
    localStorage.removeItem('refreshToken');
  },
};
