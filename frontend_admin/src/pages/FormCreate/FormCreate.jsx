import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ChevronRight, Plus, GripVertical, Trash2, Edit2, Settings, Type, Hash, Calendar, Palette, List as ListIcon, FileUp, ListChecks } from 'lucide-react';
import { formService } from '../../services/form.service';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import { useConfirmModal } from '../../hooks/useConfirmModal';
import { useFormDetail } from '../../hooks/useFormDetail';
import { useToast } from '../../hooks/useToast';
import './FormCreate.css';

const FieldTypeIcons = {
  text: <Type className="icon" style={{width: 14, height: 14}} />,
  number: <Hash className="icon" style={{width: 14, height: 14}} />,
  date: <Calendar className="icon" style={{width: 14, height: 14}} />,
  color: <Palette className="icon" style={{width: 14, height: 14}} />,
  select: <ListIcon className="icon" style={{width: 14, height: 14}} />,
  multi_select: <ListChecks className="icon" style={{width: 14, height: 14}} />,
  file: <FileUp className="icon" style={{width: 14, height: 14}} />
};

const FieldTypeLabels = {
  text: 'Văn bản',
  number: 'Số',
  date: 'Ngày tháng',
  color: 'Màu sắc',
  select: 'Chọn 1',
  multi_select: 'Chọn nhiều',
  file: 'Tải tệp lên'
};

const FormCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const {
    formData,
    setFormData,
    fields,
    setFields,
    loading,
    setLoading,
    error,
    setError,
    fetchFormDetail
  } = useFormDetail(id);

  // Field Modal State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldData, setFieldData] = useState({
    label: '',
    field_type: 'text',
    display_order: 1,
    is_required: false,
    options: ['']
  });

  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  // Confirm Modal Hook
  const { confirmModal, openConfirm } = useConfirmModal();

  // Toast Hook
  const { toast, showToast, closeToast } = useToast();

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'status_toggle') {
      setFormData(prev => ({ ...prev, status: checked ? 'active' : 'draft' }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.title) {
        setError('Tên form là bắt buộc');
        return;
      }

      if (isEditMode) {
        await formService.updateForm(id, formData);
        showToast('Cập nhật form thành công!', 'success');
        fetchFormDetail();
      } else {
        const newForm = await formService.createForm(formData);
        showToast('Tạo form thành công! Bây giờ bạn có thể thêm các trường (fields).', 'success');
        navigate(`/forms/${newForm.id}/edit`);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    let errMsg = err.message || 'Có lỗi xảy ra';
    if (err.details && err.details.length > 0) {
      errMsg += ' (' + err.details.map(d => `${d.field}: ${d.issue}`).join(', ') + ')';
    }
    setError(errMsg);
  };

  // --- Field Management ---

  const openFieldModal = (field = null) => {
    if (field) {
      setEditingField(field);
      setFieldData({
        label: field.label,
        field_type: field.field_type,
        display_order: field.display_order,
        is_required: field.is_required,
        options: field.options && field.options.length > 0 ? [...field.options] : ['']
      });
    } else {
      setEditingField(null);
      setFieldData({
        label: '',
        field_type: 'text',
        display_order: fields.length > 0 ? Math.max(...fields.map(f => f.display_order)) + 1 : 1,
        is_required: false,
        options: ['']
      });
    }
    setIsFieldModalOpen(true);
  };

  const closeFieldModal = () => {
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFieldData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSaveField = async (swap_if_exists = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!fieldData.label) {
        setError('Vui lòng nhập nhãn (label) cho field.');
        return;
      }

      let optionsList = null;
      const needsOptions = ['select', 'multi_select'].includes(fieldData.field_type);
      if (needsOptions) {
        const opts = fieldData.options.map(o => o.trim()).filter(o => o);
        if (opts.length === 0) {
          setError(`Vui lòng nhập ít nhất 1 option cho loại ${fieldData.field_type === 'select' ? 'Select' : 'Multi Select'}.`);
          return;
        }
        optionsList = opts;
      }

      const payload = {
        label: fieldData.label,
        field_type: fieldData.field_type,
        display_order: fieldData.display_order,
        is_required: fieldData.is_required,
        options: optionsList,
        swap_if_exists: swap_if_exists
      };

      if (editingField) {
        await formService.updateField(id, editingField.id, payload);
      } else {
        await formService.createField(id, payload);
      }

      closeFieldModal();
      fetchFormDetail();
    } catch (err) {
      if (err.code === "DISPLAY_ORDER_CONFLICT") {
         openConfirm({
            title: 'Trùng thứ tự hiển thị',
            message: 'Thứ tự hiển thị này đã bị trùng với một trường khác. Bạn có muốn hoán đổi vị trí của chúng không?',
            confirmText: 'Hoán đổi',
            cancelText: 'Hủy',
            onConfirm: () => {
                handleSaveField(true); // Retry with swap
            },
            onCancel: () => {
                setError("Vui lòng chọn số thứ tự hiển thị khác.");
            }
         });
      } else {
        handleError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = (fieldId) => {
    openConfirm({
        title: 'Xóa trường dữ liệu',
        message: 'Bạn có chắc muốn xóa trường này? Hành động này không thể hoàn tác.',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        onConfirm: async () => {
            try {
              await formService.deleteField(id, fieldId);
              fetchFormDetail();
            } catch (err) {
              handleError(err);
            }
        }
    });
  };

  // --- HTML5 Drag and Drop ---
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverItemIndex(index);
  };

  const onDragEnd = async (e) => {
    e.preventDefault();
    if (draggedItemIndex === null || dragOverItemIndex === null || draggedItemIndex === dragOverItemIndex) {
      setDraggedItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }

    const newFields = [...fields];
    const draggedItem = newFields[draggedItemIndex];
    newFields.splice(draggedItemIndex, 1);
    newFields.splice(dragOverItemIndex, 0, draggedItem);

    setFields(newFields);

    const ordered_field_ids = newFields.map(f => f.id);
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);

    try {
      await formService.reorderFields(id, ordered_field_ids);
      fetchFormDetail();
    } catch (err) {
      handleError(err);
      fetchFormDetail();
    }
  };

  return (
    <div className="page active">
      <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        <a style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => navigate('/forms')}>Danh sách Form</a>
        <ChevronRight className="icon" style={{ width: '12px', height: '12px' }} />
        <span style={{ fontWeight: 500 }}>{isEditMode ? 'Cập nhật form' : 'Tạo form mới'}</span>
      </div>

      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-title">{isEditMode ? 'Quản lý biểu mẫu' : 'Tạo biểu mẫu mới'}</div>
          <div className="page-subtitle">
            {isEditMode ? 'Chỉnh sửa thông tin chung và cấu hình các trường dữ liệu.' : 'Bắt đầu bằng việc nhập thông tin cơ bản cho biểu mẫu của bạn.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/forms')} disabled={loading}>
            Quay lại
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}><X className="icon" /></button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Settings className="icon" style={{ color: 'var(--primary-color)' }} />
              Thông tin cơ bản
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleFormSubmit} disabled={loading}>
              <Save className="icon" style={{ width: '14px', height: '14px' }} />
              {isEditMode ? 'Lưu thay đổi' : 'Tạo Form'}
            </button>
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Tên biểu mẫu <span className="required-star">*</span></label>
              <input
                type="text"
                name="title"
                placeholder="Ví dụ: Đăng ký tham gia sự kiện"
                value={formData.title}
                onChange={handleFormChange}
                style={{ fontSize: '15px', padding: '10px 14px' }}
              />
            </div>

            <div className="form-group full">
              <label>Mô tả / Hướng dẫn điền form</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Nhập mô tả ngắn gọn giúp người dùng hiểu mục đích của biểu mẫu này..."
                value={formData.description}
                onChange={handleFormChange}
                style={{ fontSize: '14px', padding: '10px 14px' }}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Thứ tự hiển thị (Trên danh sách)</label>
              <input
                type="number"
                name="display_order"
                min="0"
                value={formData.display_order}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Trạng thái hoạt động</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleFormChange}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                  />
                  Công khai (Active)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '16px' }}>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleFormChange}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--warning)' }}
                  />
                  Bản nháp (Draft)
                </label>
              </div>
            </div>
          </div>
        </div>

        {isEditMode ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <ListIcon className="icon" style={{ color: 'var(--primary-color)' }} />
                Cấu hình trường dữ liệu (Fields)
                <span className="badge badge-active" style={{ marginLeft: '8px' }}>{fields.length} trường</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => openFieldModal()} disabled={loading}>
                <Plus className="icon" style={{ width: '14px', height: '14px' }} />
                Thêm trường mới
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {fields.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                  <ListIcon style={{ width: '40px', height: '40px', color: '#cbd5e1', marginBottom: '12px' }} />
                  <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>Chưa có trường dữ liệu nào</p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Hãy thêm các trường để người dùng có thể điền thông tin.</p>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => openFieldModal()}>
                    <Plus className="icon" /> Thêm trường đầu tiên
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnter={(e) => onDragEnter(e, index)}
                      onDragEnd={onDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        border: dragOverItemIndex === index ? '2px dashed var(--primary-color)' : '1px solid var(--border-color)',
                        borderRadius: '6px',
                        backgroundColor: draggedItemIndex === index ? '#f8fafc' : 'var(--white)',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        cursor: 'grab'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '16px', color: '#cbd5e1' }}>
                         <GripVertical className="icon" style={{ width: '18px', height: '18px' }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{field.label}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>(Thứ tự: {field.display_order})</span>
                          {field.is_required && <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600, marginLeft: '4px' }}>* Bắt buộc</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                            {FieldTypeIcons[field.field_type]} {FieldTypeLabels[field.field_type]}
                          </span>
                          {['select', 'multi_select'].includes(field.field_type) && field.options && (
                            <span>{field.options.length} lựa chọn</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openFieldModal(field)}>
                          <Edit2 className="icon" style={{ width: '14px', height: '14px' }} />
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: '#fca5a5' }} onClick={() => handleDeleteField(field.id)}>
                          <Trash2 className="icon" style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', borderStyle: 'dashed' }}>
            <Save className="icon" style={{ width: '32px', height: '32px', color: '#cbd5e1', marginBottom: '12px' }} />
            <p>Vui lòng <strong>Lưu form</strong> trước khi cấu hình các trường dữ liệu.</p>
          </div>
        )}
      </div>

      {isFieldModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{editingField ? 'Cập nhật trường dữ liệu' : 'Thêm trường mới'}</h3>
              <button onClick={closeFieldModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X className="icon" />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label>Tên trường (Label) <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="label"
                  placeholder="Ví dụ: Họ và tên, Ngày sinh, v.v."
                  value={fieldData.label}
                  onChange={handleFieldChange}
                />
              </div>

              <div className="form-grid" style={{ padding: 0, gap: '16px' }}>
                <div className="form-group">
                  <label>Loại dữ liệu (Type)</label>
                  <select
                    name="field_type"
                    value={fieldData.field_type}
                    onChange={handleFieldChange}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                  >
                    {Object.entries(FieldTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    name="display_order"
                    min="1"
                    value={fieldData.display_order}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>

              {['select', 'multi_select'].includes(fieldData.field_type) && (
                <div className="form-group">
                  <label>Các lựa chọn (Options) <span className="required-star">*</span></label>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {fieldData.field_type === 'multi_select'
                      ? 'Người dùng có thể chọn nhiều lựa chọn'
                      : 'Người dùng chỉ được chọn 1 lựa chọn'
                    }
                  </p>
                  <div className="options-list">
                    {fieldData.options.map((opt, idx) => (
                      <div key={idx} className="option-row">
                        <span className="option-index">{idx + 1}</span>
                        <input
                          type="text"
                          className="option-input"
                          placeholder={`Lựa chọn ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...fieldData.options];
                            newOpts[idx] = e.target.value;
                            setFieldData(prev => ({ ...prev, options: newOpts }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setFieldData(prev => ({ ...prev, options: [...prev.options, ''] }));
                            }
                          }}
                        />
                        {fieldData.options.length > 1 && (
                          <button
                            type="button"
                            className="option-remove-btn"
                            onClick={() => {
                              const newOpts = fieldData.options.filter((_, i) => i !== idx);
                              setFieldData(prev => ({ ...prev, options: newOpts }));
                            }}
                            title="Xóa lựa chọn"
                          >
                            <X className="icon" style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="option-add-btn"
                    onClick={() => setFieldData(prev => ({ ...prev, options: [...prev.options, ''] }))}
                  >
                    <Plus className="icon" style={{ width: 14, height: 14 }} />
                    Thêm lựa chọn
                  </button>
                </div>
              )}

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="is_required_chk"
                  name="is_required"
                  checked={fieldData.is_required}
                  onChange={handleFieldChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                />
                <label htmlFor="is_required_chk" style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Bắt buộc người dùng phải điền (Required)
                </label>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <button className="btn btn-secondary" onClick={closeFieldModal}>Hủy bỏ</button>
              <button className="btn btn-primary" onClick={() => handleSaveField(false)} disabled={loading}>
                <Save className="icon" style={{ width: '14px', height: '14px' }} />
                {editingField ? 'Cập nhật' : 'Thêm trường'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default FormCreate;