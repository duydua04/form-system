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

  // Khởi tạo state phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 0,
    total: 0
  });

  const fetchForms = useCallback(async (filter, pageToFetch = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API với page động và limit = 6
      let url = `/api/forms/active?page=${pageToFetch}&limit=6`;
      if (filter) {
        url += `&time_filter=${filter}`;
      }

      const response = await apiCall(url);
      setForms(response.items || []);

      // Cập nhật state phân trang từ API
      setPagination({
        page: response.page,
        limit: response.limit,
        totalPages: response.total_pages,
        total: response.total
      });
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách form');
    } finally {
      setLoading(false);
    }
  }, []);

  // Luôn fetch trang 1 khi load lần đầu hoặc khi đổi timeFilter
  useEffect(() => {
    fetchForms(timeFilter, 1);
  }, [timeFilter, fetchForms]);

  const getIcon = (index) => {
    return ICONS[index % ICONS.length];
  };

  const handleFilterChange = (value) => {
    setTimeFilter(value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchForms(timeFilter, newPage);
    }
  };

  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
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
          onClick={() => fetchForms(timeFilter, pagination.page)}
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
          <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => fetchForms(timeFilter, pagination.page)}>Thử lại</button>
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
            Hiển thị <strong>{(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}</strong> trong số <strong>{pagination.total}</strong> biểu mẫu
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

          {/* Giao diện Phân trang (Sẽ hiện ra khi có nhiều hơn 1 trang) */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', paddingBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  style={{ padding: '4px 10px', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', opacity: pagination.page <= 1 ? 0.5 : 1 }}
                >
                  Trước
                </button>

                {getPageNumbers().map((item, index) => {
                  if (item === '...') {
                    return <span key={index} style={{ padding: '0 4px', color: 'var(--text-secondary)' }}>...</span>;
                  }

                  const isActive = pagination.page === item;
                  return (
                    <button
                      key={index}
                      className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => handlePageChange(item)}
                      style={{
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: isActive ? 600 : 400,
                        pointerEvents: isActive ? 'none' : 'auto'
                      }}
                    >
                      {item}
                    </button>
                  );
                })}

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  style={{ padding: '4px 10px', cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormsList;