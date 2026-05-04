import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2, X, AlertTriangle, Info } from 'lucide-react';
import { apiCall } from '../../services/api';
import './FormDetail.css';

/* ── Map lỗi backend sang tiếng Việt thân thiện ── */
const ERROR_MAP = [
  { pattern: /is required and cannot be empty/i,        vi: (field) => `Trường "${field}" là bắt buộc, vui lòng nhập giá trị.` },
  { pattern: /must not exceed (\d+) characters/i,       vi: (field, m) => `Trường "${field}" không được vượt quá ${m[1]} ký tự.` },
  { pattern: /must be a value between (\d+) and (\d+)/i,vi: (field, m) => `Trường "${field}" phải có giá trị từ ${m[1]} đến ${m[2]}.` },
  { pattern: /must be a valid number/i,                  vi: (field) => `Trường "${field}" phải là một số hợp lệ.` },
  { pattern: /invalid date/i,                            vi: (field) => `Trường "${field}" chứa ngày không hợp lệ. Định dạng: YYYY-MM-DD.` },
  { pattern: /must be a valid HEX color/i,               vi: (field) => `Trường "${field}" phải là mã màu HEX hợp lệ (VD: #FF5733).` },
  { pattern: /is not a valid option/i,                   vi: (field) => `Giá trị của trường "${field}" không nằm trong danh sách cho phép.` },
  { pattern: /only accepts the following formats/i,      vi: (field) => `Trường "${field}" chỉ chấp nhận các định dạng tệp được cho phép.` },
];

/**
 * Trích xuất tên field từ message backend (dạng "Field 'Tên trường' ...")
 * và chuyển message sang tiếng Việt thân thiện.
 */
const parseBackendError = (error) => {
  const msg = error.message || '';
  const code = error.code || '';
  const details = error.details || null;

  if (details && Array.isArray(details) && details.length > 0) {
    return {
      type: 'validation',
      title: 'Dữ liệu nhập không hợp lệ',
      messages: details.map(d => `Trường "${d.field}": ${d.issue}`),
      fieldName: null,
    };
  }

  const fieldMatch = msg.match(/[Ff]ield\s+'([^']+)'/);
  const fieldName = fieldMatch ? fieldMatch[1] : null;

  if (code === 'VALIDATION_ERROR' && fieldName) {
    for (const rule of ERROR_MAP) {
      const match = msg.match(rule.pattern);
      if (match) {
        return {
          type: 'validation',
          title: 'Lỗi nhập liệu',
          messages: [rule.vi(fieldName, match)],
          fieldName,
        };
      }
    }
    return {
      type: 'validation',
      title: 'Lỗi nhập liệu',
      messages: [`Trường "${fieldName}": ${msg}`],
      fieldName,
    };
  }

  if (code === 'FORM_NOT_FOUND') {
    return {
      type: 'error',
      title: 'Biểu mẫu không tồn tại',
      messages: ['Biểu mẫu đã bị đóng hoặc không tồn tại. Vui lòng quay lại danh sách.'],
      fieldName: null,
    };
  }

  return {
    type: 'error',
    title: 'Đã xảy ra lỗi',
    messages: [msg || 'Có lỗi không xác định xảy ra. Vui lòng thử lại.'],
    fieldName: null,
  };
};

/* ── Error Toast Component ── */
const ErrorToast = ({ errorInfo, onClose }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timerRef.current);
  }, [onClose]);

  if (!errorInfo) return null;

  const isValidation = errorInfo.type === 'validation';
  const IconComponent = isValidation ? AlertTriangle : AlertCircle;

  return (
    <div className={`error-toast ${isValidation ? 'error-toast--warning' : 'error-toast--danger'} error-toast--visible`}>
      <div className="error-toast__icon">
        <IconComponent size={20} />
      </div>
      <div className="error-toast__content">
        <div className="error-toast__title">{errorInfo.title}</div>
        <ul className="error-toast__list">
          {errorInfo.messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
      <button className="error-toast__close" onClick={onClose} aria-label="Đóng">
        <X size={16} />
      </button>
      <div className="error-toast__progress" />
    </div>
  );
};

/* ── Main Component ── */
const FormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [errorFieldName, setErrorFieldName] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // State for answers: { field_id: value (string or array) }
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchFormDetail();
  }, [id]);

  const fetchFormDetail = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/api/user/forms/${id}`);
      setForm(response);

      // Initialize answers state
      const initialAnswers = {};
      if (response && response.fields) {
        response.fields.forEach(field => {
          // Nếu field type là multi_select, khởi tạo giá trị mảng rỗng
          initialAnswers[field.id] = field.field_type === 'multi_select' ? [] : '';
        });
      }
      setAnswers(initialAnswers);
    } catch (err) {
      setLoadError(err.message || 'Lỗi tải chi tiết biểu mẫu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
    if (submitError) {
      setSubmitError(null);
      setErrorFieldName(null);
    }
  };

  const handleMultiSelectChange = (fieldId, optionValue, isChecked) => {
    setAnswers(prev => {
      const currentSelected = prev[fieldId] || [];
      let newSelected;

      if (isChecked) {
        newSelected = [...currentSelected, optionValue];
      } else {
        newSelected = currentSelected.filter(val => val !== optionValue);
      }

      return {
        ...prev,
        [fieldId]: newSelected
      };
    });

    if (submitError) {
      setSubmitError(null);
      setErrorFieldName(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setErrorFieldName(null);

    try {
      // Map answers to the format expected by backend
      const payload = {
        answers: Object.keys(answers).map(fieldId => {
          let value = answers[fieldId];

          // Chuyển mảng từ multi_select thành chuỗi phân cách bởi dấu phẩy
          if (Array.isArray(value)) {
            value = value.length > 0 ? value.join(', ') : null;
          }

          return {
            field_id: parseInt(fieldId),
            value: value ? String(value) : null
          };
        })
      };

      await apiCall(`/api/forms/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSubmitted(true);
    } catch (err) {
      const parsed = parseBackendError(err);
      setSubmitError(parsed);
      setErrorFieldName(parsed.fieldName);

      if (parsed.fieldName && form?.fields) {
        const errorField = form.fields.find(f => f.label === parsed.fieldName);
        if (errorField) {
          const el = document.getElementById(`field-${errorField.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const clearSubmitError = () => {
    setSubmitError(null);
    setErrorFieldName(null);
  };

  const isFieldError = (field) => {
    return errorFieldName && field.label === errorFieldName;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải cấu trúc biểu mẫu...</p>
      </div>
    );
  }

  if (loadError && !form) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--danger)" />
        <h3>Đã xảy ra lỗi</h3>
        <p>{loadError}</p>
        <button className="btn btn-primary" onClick={fetchFormDetail}>Thử lại</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="form-detail-container">
        <div className="success-card slide-up">
          <CheckCircle className="success-icon" size={64} />
          <h2>Gửi thành công!</h2>
          <p>Cảm ơn bạn đã hoàn thành biểu mẫu này. Thông tin của bạn đã được ghi nhận.</p>
          <div style={{ marginTop: '32px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/forms')}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-detail-container">
      <Link to="/forms" className="back-link">
        <ArrowLeft size={16} />
        Quay lại danh sách
      </Link>

      {submitError && (
        <ErrorToast errorInfo={submitError} onClose={clearSubmitError} />
      )}

      <form className="form-fill-card" onSubmit={handleSubmit}>
        <header className="form-fill-header">
          <h1 className="form-fill-title">{form.title}</h1>
          <p className="form-fill-desc">
            {form.description || 'Vui lòng điền đầy đủ các thông tin dưới đây.'}
          </p>
        </header>

        <div className="form-fields-list">
          {form.fields && form.fields.length > 0 ? (
            form.fields.sort((a, b) => a.display_order - b.display_order).map((field) => (
              <div
                key={field.id}
                id={`field-${field.id}`}
                className={`field-item ${isFieldError(field) ? 'field-item--error' : ''}`}
              >
                <label className="field-label">
                  {field.label}
                  {field.is_required && <span className="field-required">*</span>}
                </label>

                {field.field_type === 'select' ? (
                  <select
                    className={`form-input ${isFieldError(field) ? 'form-input--error' : ''}`}
                    required={field.is_required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  >
                    <option value="">-- Chọn một tùy chọn --</option>
                    {field.options && field.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.field_type === 'multi_select' ? (
                  <div className={`multi-select-wrapper ${isFieldError(field) ? 'form-input--error' : ''}`}>
                    {field.options && field.options.map((opt, i) => {
                      const isChecked = (answers[field.id] || []).includes(opt);
                      return (
                        <label key={i} className="checkbox-label">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={isChecked}
                            onChange={(e) => handleMultiSelectChange(field.id, opt, e.target.checked)}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : field.field_type === 'file' ? (
                  <input
                    type="file"
                    className={`form-input ${isFieldError(field) ? 'form-input--error' : ''}`}
                    required={field.is_required}
                    onChange={(e) => handleInputChange(field.id, e.target.files[0]?.name)}
                  />
                ) : (
                  <input
                    type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'color' ? 'color' : 'text'}
                    className={`form-input ${isFieldError(field) ? 'form-input--error' : ''}`}
                    placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    required={field.is_required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                )}

                {isFieldError(field) && submitError && (
                  <div className="field-error-hint">
                    <Info size={13} />
                    <span>{submitError.messages[0]}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-fields">Biểu mẫu này hiện chưa có trường thông tin nào.</div>
          )}
        </div>

        <footer className="form-fill-footer">
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: 8 }} />
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={18} style={{ marginRight: 8 }} />
                Gửi biểu mẫu
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default FormDetail;