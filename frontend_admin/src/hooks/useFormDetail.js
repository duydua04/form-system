import { useState, useEffect, useCallback } from 'react';
import { formService } from '../services/form.service';

export const useFormDetail = (id) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    display_order: 1,
    status: 'active'
  });
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFormDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await formService.getFormDetail(id);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        display_order: data.display_order || 1,
        status: data.status || 'active'
      });
      const sortedFields = (data.fields || []).sort((a, b) => a.display_order - b.display_order);
      setFields(sortedFields);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thông tin form');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFormDetail();
  }, [fetchFormDetail]);

  return {
    formData,
    setFormData,
    fields,
    setFields,
    loading,
    setLoading,
    error,
    setError,
    fetchFormDetail
  };
};
