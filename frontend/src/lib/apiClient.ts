const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const getAuthToken = (): string | null => {
	return localStorage.getItem('token');
};

const setAuthToken = (token: string): void => {
	localStorage.setItem('token', token);
	// Dispatch custom event for socket reconnection
	window.dispatchEvent(new CustomEvent('user-logged-in'));
};

const removeAuthToken = (): void => {
	localStorage.removeItem('token');
	localStorage.removeItem('refreshToken');
	// Dispatch custom event for socket disconnection
	window.dispatchEvent(new CustomEvent('user-logged-out'));
};

const getRefreshToken = (): string | null => {
	return localStorage.getItem('refreshToken');
};

const setRefreshToken = (token: string): void => {
	localStorage.setItem('refreshToken', token);
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Token refresh logic
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
	refreshSubscribers.forEach(callback => callback(token));
	refreshSubscribers = [];
};

const attemptTokenRefresh = async (): Promise<string | null> => {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return null;

	try {
		const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			removeAuthToken();
			return null;
		}

		const data = await response.json();
		if (data.token) {
			setAuthToken(data.token);
			if (data.refreshToken) {
				setRefreshToken(data.refreshToken);
			}
			return data.token;
		}
		return null;
	} catch (error) {
		removeAuthToken();
		return null;
	}
};

const makeRequest = async (
	method: string,
	endpoint: string,
	data?: any,
	retried = false
): Promise<any> => {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers: getAuthHeaders(),
		body: data ? JSON.stringify(data) : undefined,
	});

	// Handle token expiration
	if (response.status === 401 && !retried && getRefreshToken()) {
		if (!isRefreshing) {
			isRefreshing = true;
			const newToken = await attemptTokenRefresh();
			isRefreshing = false;

			if (newToken) {
				onTokenRefreshed(newToken);
				return makeRequest(method, endpoint, data, true);
			}
		} else {
			// Wait for the ongoing refresh
			return new Promise((resolve) => {
				subscribeTokenRefresh(async () => {
					resolve(makeRequest(method, endpoint, data, true));
				});
			});
		}
	}

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }));
		throw new Error(error.error || `HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const apiClient = {
  get: async (endpoint: string) => {
    return makeRequest('GET', endpoint);
  },

  post: async (endpoint: string, data?: any) => {
    return makeRequest('POST', endpoint, data);
  },

  put: async (endpoint: string, data?: any) => {
    return makeRequest('PUT', endpoint, data);
  },

  delete: async (endpoint: string) => {
    return makeRequest('DELETE', endpoint);
  },
};

export { getAuthToken, setAuthToken, removeAuthToken, getRefreshToken, setRefreshToken };
