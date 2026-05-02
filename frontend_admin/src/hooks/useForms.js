import { useState, useEffect, useCallback } from 'react';
import { formService } from '../services/form.service';

export const useForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await formService.getForms(1, 100);
      setForms(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách form');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteForm = async (id) => {
    try {
      await formService.deleteForm(id);
      await fetchForms();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Xóa form thất bại' };
    }
  };

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return {
    forms,
    loading,
    error,
    fetchForms,
    deleteForm
  };
};
