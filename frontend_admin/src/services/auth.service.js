import { apiCall } from './api';

export const authService = {
  loginAdmin: async (email, password) => {
    return await apiCall('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return await apiCall('/api/auth/logout', {
      method: 'POST',
    });
  },

  getAdminMe: async () => {
    return await apiCall('/api/auth/admin/me', {
      method: 'GET',
    });
  }
};
