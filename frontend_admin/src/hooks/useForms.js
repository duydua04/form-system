import { useState, useEffect, useCallback } from 'react';
import { formService } from '../services/form.service';

export const useForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Thêm state quản lý phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 0,
    total: 0
  });

  // Nhận tham số page, mặc định là 1
  const fetchForms = useCallback(async (pageToFetch = 1) => {
    try {
      setLoading(true);
      // Gọi API với page động và limit 6
      const data = await formService.getForms(pageToFetch, 6);
      setForms(data.items || []);

      // Cập nhật thông tin phân trang từ response API
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
  }, []);

  const deleteForm = async (id) => {
    try {
      await formService.deleteForm(id);
      // Gọi lại trang hiện tại sau khi xóa thành công
      await fetchForms(pagination.page);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Xóa form thất bại' };
    }
  };

  useEffect(() => {
    fetchForms(1);
  }, [fetchForms]);

  return {
    forms,
    loading,
    error,
    pagination, // Trả ra thông tin phân trang
    fetchForms,
    deleteForm
  };
};