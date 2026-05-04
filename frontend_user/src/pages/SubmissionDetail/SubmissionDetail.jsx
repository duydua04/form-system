import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Type,
  Hash as HashIcon,
  CalendarDays,
  Palette,
  List,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { apiCall } from '../../services/api';
import './SubmissionDetail.css';

/* Map field_type → icon + label tiếng Việt */
const FIELD_TYPE_MAP = {
  text:         { icon: Type,          label: 'Văn bản' },
  number:       { icon: HashIcon,      label: 'Số' },
  date:         { icon: CalendarDays,  label: 'Ngày' },
  color:        { icon: Palette,       label: 'Màu sắc' },
  select:       { icon: List,          label: 'Lựa chọn' },
  multi_select: { icon: CheckSquare,   label: 'Nhiều lựa chọn' },
  file:         { icon: Paperclip,     label: 'Tệp đính kèm' },
};

const formatDateTime = (isoString) => {
  if (!isoString) return { date: '—', time: '—' };
  const d = new Date(isoString);
  const date = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
};

const SubmissionDetail = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCall(`/api/submissions/${id}`);
      setSubmission(res);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết bài nộp.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="sd-loading-state">
        <Loader2 className="sd-spinner" size={36} />
        <p>Đang tải chi tiết bài nộp...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="sd-error-state">
        <AlertCircle size={48} className="sd-error-icon" />
        <h3>Đã xảy ra lỗi</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDetail}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!submission) return null;

  const dt = formatDateTime(submission.submitted_at);

  return (
    <div className="sd-container">
      {/* Back link */}
      <Link to="/submissions" className="sd-back-link">
        <ArrowLeft size={16} />
        Quay lại lịch sử nộp
      </Link>

      {/* Header Card */}
      <div className="sd-header-card">
        <div className="sd-header-top">
          <div className="sd-header-icon-wrap">
            <CheckCircle size={24} />
          </div>
          <div className="sd-header-info">
            <h1 className="sd-header-title">{submission.form_title}</h1>
            {submission.form_description && (
              <p className="sd-header-desc">{submission.form_description}</p>
            )}
          </div>
        </div>

        <div className="sd-meta-bar">
          <div className="sd-meta-item">
            <Calendar size={14} />
            <span>{dt.date}</span>
          </div>
          <div className="sd-meta-item">
            <Clock size={14} />
            <span>{dt.time}</span>
          </div>
        </div>
      </div>

      {/* Answers List */}
      <div className="sd-answers-card">
        <div className="sd-answers-header">
          <h2>Câu trả lời</h2>
          <span className="sd-answers-count">{submission.answers.length} trường</span>
        </div>

        {submission.answers.length === 0 ? (
          <div className="sd-empty-answers">
            Không có câu trả lời nào được ghi nhận.
          </div>
        ) : (
          <div className="sd-answers-list">
            {submission.answers.map((ans, index) => {
              const ftMap = FIELD_TYPE_MAP[ans.field_type] || FIELD_TYPE_MAP.text;
              const FieldIcon = ftMap.icon;

              return (
                <div
                  key={ans.id}
                  className="sd-answer-item"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="sd-answer-header">
                    <div className="sd-field-icon-wrap">
                      <FieldIcon size={14} />
                    </div>
                    <div className="sd-answer-label-wrap">
                      <span className="sd-answer-label">{ans.field_label}</span>
                    </div>
                  </div>

                  <div className="sd-answer-value-wrap">
                    {ans.field_type === 'color' && ans.value ? (
                      <div className="sd-color-value">
                        <span
                          className="sd-color-swatch"
                          style={{ backgroundColor: ans.value }}
                        />
                        <span className="sd-answer-value">{ans.value}</span>
                      </div>
                    ) : (
                      <span className={`sd-answer-value ${!ans.value ? 'sd-no-value' : ''}`}>
                        {ans.value || 'Không có giá trị'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;