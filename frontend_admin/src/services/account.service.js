import { apiCall } from './api';

export const accountService = {
  // Lấy danh sách user có phân trang
  getUsers: async (page = 1, limit = 10) => {
    return await apiCall(`/api/admin/accounts/users?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  // Tạo tài khoản mới (Admin/User)
  createAccount: async (payload) => {
    return await apiCall('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};