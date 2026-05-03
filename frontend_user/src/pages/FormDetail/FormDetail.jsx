import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiCall } from '../../services/api';
import './FormDetail.css';

const FormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  // State for answers: { field_id: value }
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
          initialAnswers[field.id] = '';
        });
      }
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.message || 'Lỗi tải chi tiết biểu mẫu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Map answers to the format expected by backend
      const payload = {
        answers: Object.keys(answers).map(fieldId => ({
          field_id: parseInt(fieldId),
          value: answers[fieldId] ? String(answers[fieldId]) : null
        }))
      };

      await apiCall(`/api/forms/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi biểu mẫu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải cấu trúc biểu mẫu...</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--danger)" />
        <h3>Đã xảy ra lỗi</h3>
        <p>{error}</p>
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
              <div key={field.id} className="field-item">
                <label className="field-label">
                  {field.label}
                  {field.is_required && <span className="field-required">*</span>}
                </label>

                {field.field_type === 'select' ? (
                  <select
                    className="form-input"
                    required={field.is_required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  >
                    <option value="">-- Chọn một tùy chọn --</option>
                    {field.options && field.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.field_type === 'file' ? (
                  <input
                    type="file"
                    className="form-input"
                    required={field.is_required}
                    onChange={(e) => handleInputChange(field.id, e.target.files[0]?.name)}
                  />
                ) : (
                  <input
                    type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'color' ? 'color' : 'text'}
                    className="form-input"
                    placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    required={field.is_required}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="empty-fields">Biểu mẫu này hiện chưa có trường thông tin nào.</div>
          )}
        </div>

        {error && (
          <div style={{ padding: '0 32px', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

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
