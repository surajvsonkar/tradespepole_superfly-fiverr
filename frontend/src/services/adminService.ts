import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
	const token = localStorage.getItem('adminToken'); // Use separate token for admin
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
	// Auth
	async login(credentials: { email: string; password: string }) {
		const response = await axios.post(`${API_URL}/admin/login`, credentials);
		if (response.data.token) {
			localStorage.setItem('adminToken', response.data.token);
		}
		return response.data;
	},

	async forgotPassword(email: string) {
		const response = await axios.post(`${API_URL}/admin/forgot-password`, { email });
		return response.data;
	},

	async resetPassword(data: { email: string; otp: string; newPassword: string }) {
		const response = await axios.post(`${API_URL}/admin/reset-password`, data);
		return response.data;
	},

	async changePassword(data: { currentPassword: string; newPassword: string }) {
		const response = await axios.post(`${API_URL}/admin/change-password`, data, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	logout() {
		localStorage.removeItem('adminToken');
	},

	// Dashboard stats
	async getDashboardStats() {
		const response = await axios.get(`${API_URL}/admin/stats`, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	// Analytics
	async getAnalytics() {
		const response = await axios.get(`${API_URL}/admin/analytics`, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	// Get all homeowners
	async getHomeowners(params?: { search?: string; limit?: number; offset?: number }) {
		const response = await axios.get(`${API_URL}/admin/homeowners`, {
			headers: getAuthHeader(),
			params,
		});
		return response.data;
	},

	// Get all tradespeople
	async getTradespeople(params?: { search?: string; limit?: number; offset?: number }) {
		const response = await axios.get(`${API_URL}/admin/tradespeople`, {
			headers: getAuthHeader(),
			params,
		});
		return response.data;
	},

	// Get transactions
	async getTransactions(params?: { limit?: number; offset?: number; type?: string }) {
		const response = await axios.get(`${API_URL}/admin/transactions`, {
			headers: getAuthHeader(),
			params,
		});
		return response.data;
	},

	// Update user status
	async updateUserStatus(userId: string, data: { accountStatus?: string; verificationStatus?: string }) {
		const response = await axios.patch(
			`${API_URL}/admin/users/${userId}/status`,
			data,
			{
				headers: getAuthHeader(),
			}
		);
		return response.data;
	},

	// Delete user
	async deleteUser(userId: string) {
		const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	// Update pricing
	async updatePricing(data: { defaultLeadPrice: number }) {
		const response = await axios.patch(`${API_URL}/admin/pricing`, data, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	// Get boost plan prices
	async getBoostPlanPrices() {
		const response = await axios.get(`${API_URL}/admin/boost-prices`, {
			headers: getAuthHeader(),
		});
		return response.data;
	},

	// Update boost plan prices
	async updateBoostPlanPrices(prices: Record<string, { name: string; price: number; duration: number }>) {
		const response = await axios.patch(`${API_URL}/admin/boost-prices`, { prices }, {
			headers: getAuthHeader(),
		});
		return response.data;
	},
};
