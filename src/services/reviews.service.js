import { apiClient } from './client';

export const reviewsService = {
  getProductReviews: async (productId) => {
    const res = await apiClient(`/reviews/product/${productId}`);
    return res?.data || res || [];
  },

  getFarmerReviews: async (farmerId) => {
    const res = await apiClient(`/reviews/farmer/${farmerId}`);
    return res?.data || res || [];
  },

  createReview: async (reviewData) => {
    if (reviewData?.orderId) {
      try {
        const res = await apiClient(`/customer/orders/${reviewData.orderId}/reviews`, {
          method: 'POST',
          body: reviewData,
        });
        return res?.data || res;
      } catch (err) {
        if (err.status === 404) {
          const res = await apiClient('/customer/reviews', {
            method: 'POST',
            body: reviewData,
          });
          return res?.data || res;
        }
        throw err;
      }
    }
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

export const reviewsApi = reviewsService;
export default reviewsService;
