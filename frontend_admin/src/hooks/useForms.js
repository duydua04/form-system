import { useState, useEffect, useCallback } from 'react';
import { formService } from '../services/form.service';

export const useForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 0,
    total: 0
  });

  // 'all' | 'today' | 'this_week'
  const [filter, setFilter] = useState('all');

  const fetchForms = useCallback(async (pageToFetch = 1, activeFilter = filter) => {
    try {
      setLoading(true);
      const data = await formService.getForms(pageToFetch, 6, activeFilter);
      setForms(data.items || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.total_pages,
        total: data.total
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách form');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Đổi filter → reset về trang 1 và fetch lại
  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter);
    fetchForms(1, newFilter);
  }, [fetchForms]);

  const deleteForm = async (id) => {
    try {
      await formService.deleteForm(id);
      await fetchForms(pagination.page, filter);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Xóa form thất bại' };
    }
  };

  useEffect(() => {
    fetchForms(1, 'all');
  }, []);                   // chỉ chạy lần đầu mount

  return {
    forms,
    loading,
    error,
    pagination,
    filter,
    fetchForms,
    changeFilter,
    deleteForm,
  };
};