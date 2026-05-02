import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const mockForms = [
  { id: 1, title: 'Form đăng ký khóa học', desc: 'Thu thập thông tin học viên đăng ký', order: 1, status: 'Active' },
  { id: 2, title: 'Form phản hồi dịch vụ', desc: 'Đánh giá chất lượng sau khóa học', order: 2, status: 'Active' },
  { id: 3, title: 'Form khảo sát nội bộ', desc: 'Khảo sát định kỳ nhân viên', order: 3, status: 'Draft' },
  { id: 4, title: 'Form liên hệ tư vấn', desc: 'Tiếp nhận yêu cầu tư vấn từ khách hàng', order: 4, status: 'Active' },
  { id: 5, title: 'Form đặt lịch hẹn', desc: 'Đặt lịch gặp tư vấn viên', order: 5, status: 'Active' },
  { id: 6, title: 'Form thông tin bổ sung', desc: '--', order: 6, status: 'Draft' },
];

const FormsList = () => {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Danh sách form</div>
          <div className="page-subtitle">Quản lý tất cả biểu mẫu trong hệ thống</div>
        </div>
        <button className="btn btn-primary">
          <Plus className="icon" />
          Tạo Form mới
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Tất cả biểu mẫu</span>
          <input type="text" placeholder="Tìm kiếm form..." style={{ width: '200px', padding: '6px 10px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '36px' }}>STT</th>
                <th>Tên form</th>
                <th>Mô tả</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Thứ tự</th>
                <th style={{ width: '100px' }}>Trạng thái</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockForms.map((form) => (
                <tr key={form.id}>
                  <td style={{ textAlign: 'center' }}>{form.id}</td>
                  <td style={{ fontWeight: 500 }}>{form.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{form.desc}</td>
                  <td style={{ textAlign: 'center' }}>{form.order}</td>
                  <td>
                    {form.status === 'Active' ? (
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
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                        Sửa
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: '#fca5a5' }}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormsList;
