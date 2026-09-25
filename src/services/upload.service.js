import { apiClient, getBaseUrl } from './client';

const BASE_URL = getBaseUrl();

export const uploadService = {
  /**
   * Upload a single image
   * @param {File} file
   * @param {'markets' | 'products' | 'avatars' | 'kyc' | 'general'} folder
   * @returns {{ url: string, fullUrl: string, originalFilename: string, size: number }}
   */
  uploadImage: async (file, folder = 'general') => {
    const token = localStorage.getItem('marketlink_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/upload/image?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
    return data?.data || data;
  },

  /**
   * Upload multiple images at once
   * @param {File[]} files
   * @param {'markets' | 'products' | 'avatars' | 'kyc' | 'general'} folder
   */
  uploadImages: async (files, folder = 'general') => {
    const token = localStorage.getItem('marketlink_token');
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const res = await fetch(`${BASE_URL}/upload/images?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
    return data?.data || data || [];
  },
};

export const uploadApi = uploadService;
export default uploadService;
