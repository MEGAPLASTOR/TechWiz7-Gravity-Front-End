import { apiClient } from './client';

export const productsService = {
  getAllProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page);
    if (params.size !== undefined) query.set('size', params.size);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.search) query.set('keyword', params.search);
    if (params.status) query.set('status', params.status);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient(`/products${queryString}`);
    return res?.data || res || [];
  },

  getProductById: async (id) => {
    const res = await apiClient(`/products/${id}`);
    return res?.data || res;
  },

  getCategories: async () => {
    const res = await apiClient('/categories');
    return res?.data || res || [];
  },

  getCategoryById: async (id) => {
    const res = await apiClient(`/categories/${id}`);
    return res?.data || res;
  },
};

export const productsApi = productsService;
export default productsService;
