import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, CalendarDays, Clock, List } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { useToast } from '../../hooks/useToast';
import { useForms } from '../../hooks/useForms';
import './FormsList.css';

const FILTER_OPTIONS = [
  { value: 'all',       label: 'Tất cả',     icon: List },
  { value: 'today',     label: 'Hôm nay',    icon: Clock },
  { value: 'this_week', label: 'Tuần này',   icon: CalendarDays },
];

const FormsList = () => {
  const navigate = useNavigate();
  const { forms, loading, error, pagination, filter, fetchForms, changeFilter, deleteForm } = useForms();
  const { confirmModal, openConfirm } = useConfirmModal();
  const { toast, showToast, closeToast } = useToast();

  const handleDelete = (id) => {
    openConfirm({
      title: 'Xóa form',
      message: 'Bạn có chắc chắn muốn xóa form này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        const result = await deleteForm(id);
        if (!result.success) {
          showToast(result.error, 'error');
        }
      }
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchForms(newPage, filter);
    }
  };

  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Danh sách form</div>
          <div className="page-subtitle">Quản lý tất cả biểu mẫu trong hệ thống</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/forms/create')}>
          <Plus className="icon" />
          Tạo Form mới
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div className="card">
        {/* Toolbar: filter tabs */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  onClick={() => changeFilter(value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    borderRadius: '6px',
                    border: isActive ? '1.5px solid var(--primary-color)' : '1.5px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--primary-color)' : 'var(--white)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  {label}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {loading ? 'Đang tải...' : `${pagination.total} kết quả`}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tên form</th>
                    <th>Mô tả</th>
                    <th style={{ width: '100px' }}>Trạng thái</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                        {filter === 'today'
                          ? 'Không có form nào được tạo hôm nay'
                          : filter === 'this_week'
                          ? 'Không có form nào được tạo trong tuần này'
                          : 'Chưa có form nào'}
                      </td>
                    </tr>
                  ) : (
                    forms.map((form) => (
                      <tr key={form.id}>
                        <td style={{ fontWeight: 500 }}>{form.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{form.description || '--'}</td>
                        <td>
                          {form.status === 'active' ? (
                            <span className="badge badge-active">
                              <div className="status-dot active"></div>
                              Active
                            </span>
                          ) : (
                            <span className="badge badge-draft">
                              <div className="status-dot draft"></div>
                              Draft
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px' }}
                              onClick={() => navigate(`/forms/${form.id}/edit`)}
                            >
                              <Edit className="icon" style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                              Sửa
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: '#fca5a5' }}
                              onClick={() => handleDelete(form.id)}
                            >
                              <Trash2 className="icon" style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} trong số {pagination.total} kết quả
                </span>

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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
};

export default FormsList;