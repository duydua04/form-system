import { apiCall } from './api';

export const authService = {
  loginUser: async (email, password) => {
    return await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return await apiCall('/api/auth/logout', {
      method: 'POST',
    });
  },

  getUserMe: async () => {
    return await apiCall('/api/auth/me', {
      method: 'GET',
    });
  }
};
