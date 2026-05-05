import { useState, useCallback } from 'react';
import { accountService } from '../services/account.service';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchAccounts = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountService.getUsers(page, limit);
      setAccounts(data.items || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.total_pages || 0
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = async (payload) => {
    try {
      const res = await accountService.createAccount(payload);
      // Tạo xong thì tự động load lại trang hiện tại
      await fetchAccounts(pagination.page, pagination.limit);
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err.message || 'Lỗi khi tạo tài khoản.' };
    }
  };

  return {
    accounts,
    loading,
    error,
    pagination,
    fetchAccounts,
    createAccount
  };
};