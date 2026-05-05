import React, { useEffect, useState } from 'react';
import { Plus, Shield, User, X } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { useAccounts } from '../../hooks/useAccounts';

const AccountsList = () => {
  const { accounts, loading, error, pagination, fetchAccounts, createAccount } = useAccounts();
  const { toast, showToast, closeToast } = useToast();

  // State quản lý Modal tạo user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'user', password: '' });

  // Gọi API lần đầu khi vào trang
  useEffect(() => {
    fetchAccounts(1, 10);
  }, [fetchAccounts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAccounts(newPage, pagination.limit);
    }
  };

  // Logic tạo mảng phân trang (..., 1, 2, 3) tương tự FormList
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await createAccount(formData);
    setIsSubmitting(false);

    if (result.success) {
      showToast(result.data.message || 'Tạo tài khoản thành công!', 'success');
      setIsModalOpen(false);
      setFormData({ email: '', role: 'user', password: '' }); // Reset form
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý nhân viên</div>
          <div className="page-subtitle">Quản lý danh sách tài khoản User và Admin</div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="icon" />
          Tạo tài khoản
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {loading ? 'Đang tải...' : `Tổng số: ${pagination.total} tài khoản`}
          </span>
        </div>

        {loading && accounts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                        Chưa có tài khoản nào trong hệ thống
                      </td>
                    </tr>
                  ) : (
                    accounts.map((acc) => (
                      <tr key={acc.id}>
                        <td style={{ fontWeight: 500 }}>{acc.email}</td>
                        <td>
                          {acc.role === 'admin' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                              <Shield style={{ width: 12, height: 12 }} /> Admin
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                              <User style={{ width: 12, height: 12 }} /> Nhân viên
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {new Date(acc.created_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
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
                        style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: isActive ? 600 : 400, pointerEvents: isActive ? 'none' : 'auto' }}
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

      {/* --- MODAL TẠO TÀI KHOẢN --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '20px', position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Tạo tài khoản mới</h3>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Email đăng nhập</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="nhanvien@congty.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                >
                  <option value="user">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Mật khẩu cấp phát</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box' }}
                  placeholder="Nhập mật khẩu (Ít nhất 6 ký tự)"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
};

export default AccountsList;