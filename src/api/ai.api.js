import { apiClient } from './client';

export const aiApi = {
  chat: async (message) => {
    const res = await apiClient('/ai/assistant/chat', {
      method: 'POST',
      body: { message },
    });
    return res?.data || res;
  },
};
