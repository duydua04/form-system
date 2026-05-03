import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Box, Lock, ChevronRight } from 'lucide-react';
import { apiCall } from '../../services/api';
import './FormsList.css';

const ICONS = [
  <FileText className="form-item-icon" />,
  <Users className="form-item-icon" />,
  <Box className="form-item-icon" />,
  <Lock className="form-item-icon" />
];

const FormsList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/forms/active?page=1&limit=50');
      const data = response.items || [];
      setForms(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách form');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (index) => {
    return ICONS[index % ICONS.length];
  };

  if (loading) {
    return <div className="loading-state">Đang tải danh sách biểu mẫu...</div>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={fetchForms}>Thử lại</button>
      </div>
    );
  }

  if (forms.length === 0) {
    return <div className="empty-state">Chưa có biểu mẫu nào đang hoạt động.</div>;
  }

  return (
    <div className="forms-list-container">
      <div className="forms-stack">
        {forms.map((form, index) => (
          <div 
            key={form.id} 
            className="form-item"
            onClick={() => navigate(`/forms/${form.id}`)}
          >
            <div className="form-item-icon-wrap">
              {getIcon(index)}
            </div>
            
            <div className="form-item-content">
              <h3 className="form-item-title">{form.title}</h3>
              <p className="form-item-desc">
                {form.description || 'Vui lòng chọn để xem chi tiết và điền thông tin.'}
              </p>
            </div>
            
            <div className="form-item-action">
              <span>Điền ngay</span>
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormsList;
