import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formService } from '../../services/form.service';
import ConfirmModal from '../../components/ConfirmModal';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { useForms } from '../../hooks/useForms';
import './FormsList.css';

const FormsList = () => {
  const navigate = useNavigate();
  const { forms, loading, error, fetchForms, deleteForm } = useForms();
  const { confirmModal, openConfirm } = useConfirmModal();

  const handleDelete = (id) => {
    openConfirm({
      title: 'Xóa form',
      message: 'Bạn có chắc muốn xóa form này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        const result = await deleteForm(id);
        if (!result.success) {
          alert(result.error);
        }
      }
    });
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
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Tất cả biểu mẫu</span>
          <input type="text" placeholder="Tìm kiếm form..." style={{ width: '200px', padding: '6px 10px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên form</th>
                  <th>Mô tả</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Thứ tự hiển thị</th>
                  <th style={{ width: '100px' }}>Trạng thái</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Chưa có form nào</td>
                  </tr>
                ) : (
                  forms.map((form) => (
                    <tr key={form.id}>
                      <td style={{ fontWeight: 500 }}>{form.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{form.description || '--'}</td>
                      <td style={{ textAlign: 'center' }}>{form.display_order}</td>
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
                            <Edit className="icon" style={{width: '12px', height: '12px', marginRight: '4px'}} />
                            Sửa
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: '#fca5a5' }}
                            onClick={() => handleDelete(form.id)}
                          >
                            <Trash2 className="icon" style={{width: '12px', height: '12px', marginRight: '4px'}} />
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
    </div>
  );
};

export default FormsList;
