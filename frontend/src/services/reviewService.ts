import { apiClient } from '../lib/apiClient';

export interface CreateReviewData {
  jobId: string;
  tradespersonId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  getUserReviews: async (userId: string, params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const query = queryParams.toString();
    return await apiClient.get(`/reviews/user/${userId}${query ? `?${query}` : ''}`);
  },

  getReviewById: async (id: string) => {
    return await apiClient.get(`/reviews/${id}`);
  },

  createReview: async (data: CreateReviewData) => {
    return await apiClient.post('/reviews', data);
  },
};
