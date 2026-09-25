import { apiClient } from './client';

export const favoritesService = {
  getFavorites: async () => {
    const res = await apiClient('/customer/favorites');
    return res?.data || res || [];
  },

  addFavorite: async (targetType, targetId) => {
    const res = await apiClient('/customer/favorites', {
      method: 'POST',
      body: { targetType, targetId },
    });
    return res?.data || res;
  },

  removeFavorite: async (targetType, targetId) => {
    const res = await apiClient(`/customer/favorites?targetType=${targetType}&targetId=${targetId}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  checkFavorite: async (targetType, targetId) => {
    const res = await apiClient(`/customer/favorites/check?targetType=${targetType}&targetId=${targetId}`);
    return res?.data ?? false;
  },
};

export const favoritesApi = favoritesService;
export default favoritesService;
