import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Box, Lock, ChevronRight, CalendarDays, CalendarRange, List, RefreshCw } from 'lucide-react';
import { apiCall } from '../../services/api';
import './FormsList.css';

const ICONS = [
  <FileText className="form-item-icon" />,
  <Users className="form-item-icon" />,
  <Box className="form-item-icon" />,
  <Lock className="form-item-icon" />
];

const FILTER_OPTIONS = [
  { value: '',          label: 'Tất cả',      icon: List },
  { value: 'today',     label: 'Hôm nay',     icon: CalendarDays },
  { value: 'this_week', label: 'Tuần này',     icon: CalendarRange },
];

const FormsList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('');

  const fetchForms = useCallback(async (filter) => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/forms/active?page=1&limit=50';
      if (filter) {
        url += `&time_filter=${filter}`;
      }
      const response = await apiCall(url);
      const data = response.items || [];
      setForms(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách form');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms(timeFilter);
  }, [timeFilter, fetchForms]);

  const getIcon = (index) => {
    return ICONS[index % ICONS.length];
  };

  const handleFilterChange = (value) => {
    setTimeFilter(value);
  };

  return (
    <div className="forms-list-container">
      {/* Filter Bar */}
      <div className="fl-toolbar">
        <div className="fl-filter-group">
          {FILTER_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = timeFilter === opt.value;
            return (
              <button
                key={opt.value}
                className={`fl-filter-btn ${isActive ? 'fl-filter-btn--active' : ''}`}
                onClick={() => handleFilterChange(opt.value)}
              >
                <Icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </div>
        <button
          className="fl-refresh-btn"
          onClick={() => fetchForms(timeFilter)}
          title="Làm mới"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">Đang tải danh sách biểu mẫu...</div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="empty-state">
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => fetchForms(timeFilter)}>Thử lại</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && forms.length === 0 && (
        <div className="empty-state">
          <p>
            {timeFilter
              ? `Không có biểu mẫu nào ${timeFilter === 'today' ? 'hôm nay' : 'tuần này'}.`
              : 'Chưa có biểu mẫu nào đang hoạt động.'
            }
          </p>
          {timeFilter && (
            <button
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
              onClick={() => setTimeFilter('')}
            >
              Xem tất cả
            </button>
          )}
        </div>
      )}

      {/* List */}
      {!loading && !error && forms.length > 0 && (
        <>
          <div className="fl-result-info">
            Hiển thị <strong>{forms.length}</strong> biểu mẫu
            {timeFilter === 'today' && ' — hôm nay'}
            {timeFilter === 'this_week' && ' — tuần này'}
          </div>
          <div className="forms-stack">
            {forms.map((form, index) => (
              <div 
                key={form.id} 
                className="form-item"
                onClick={() => navigate(`/forms/${form.id}`)}
                style={{ animationDelay: `${index * 40}ms` }}
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
        </>
      )}
    </div>
  );
};

export default FormsList;
