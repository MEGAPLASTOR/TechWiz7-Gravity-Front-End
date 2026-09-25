import axios from 'axios';
import { getBaseUrl } from './client';

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Tự động gắn Token vào Request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('marketlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý tự động khi Token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('marketlink_token');
      localStorage.removeItem('marketlink_user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
