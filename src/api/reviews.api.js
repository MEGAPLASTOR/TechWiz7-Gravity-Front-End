import { apiClient } from './client';

export const reviewsApi = {
  getProductReviews: async (productId) => {
    const res = await apiClient(`/reviews/product/${productId}`);
    return res?.data || res || [];
  },

  getFarmerReviews: async (farmerId) => {
    const res = await apiClient(`/reviews/farmer/${farmerId}`);
    return res?.data || res || [];
  },

  createReview: async (reviewData) => {
    const res = await apiClient('/customer/reviews', {
      method: 'POST',
      body: reviewData,
    });
    return res?.data || res;
  },

  getCustomerReviews: async () => {
    const res = await apiClient('/customer/reviews');
    return res?.data || res || [];
  },
};
