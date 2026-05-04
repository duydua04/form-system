import React from 'react';
import {
  FileText, Calendar, Clock, ChevronRight,
  ArrowLeft, AlertCircle, Type, Hash,
  CheckSquare, List, ToggleLeft, Mail,
  AlignLeft, Palette, HelpCircle,
} from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';
import './Submissions.css';

/* ─── Helpers ─── */
const formatDate = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDateTime = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* Field type → icon + color */
const FIELD_META = {
  text:      { icon: Type,        color: '#6366f1', bg: '#eef2ff', label: 'Văn bản' },
  textarea:  { icon: AlignLeft,   color: '#8b5cf6', bg: '#f5f3ff', label: 'Đoạn văn' },
  email:     { icon: Mail,        color: '#0ea5e9', bg: '#e0f2fe', label: 'Email' },
  number:    { icon: Hash,        color: '#f59e0b', bg: '#fef3c7', label: 'Số' },
  date:      { icon: Calendar,    color: '#10b981', bg: '#d1fae5', label: 'Ngày' },
  select:    { icon: List,        color: '#3b82f6', bg: '#dbeafe', label: 'Lựa chọn' },
  checkbox:  { icon: CheckSquare, color: '#14b8a6', bg: '#ccfbf1', label: 'Nhiều lựa chọn' },
  radio:     { icon: ToggleLeft,  color: '#f97316', bg: '#ffedd5', label: 'Lựa chọn' },
  color:     { icon: Palette,     color: '#ec4899', bg: '#fce7f3', label: 'Màu sắc' },
};

const getFieldMeta = (type) => FIELD_META[type] || { icon: HelpCircle, color: '#6b7280', bg: '#f3f4f6', label: type };

/* ─── Pagination helper ─── */
const getPageNumbers = (page, totalPages) => {
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

/* ─── Detail View ─── */
const DetailView = ({ submission, loading, error, onBack }) => (
  <div className="detail-view">
    {/* Back button */}
    <button className="back-btn" onClick={onBack}>
      <ArrowLeft size={16} />
      Quay lại lịch sử nộp
    </button>

    {loading && (
      <div className="detail-loading">
        <div className="submissions-spinner" />
        Đang tải chi tiết...
      </div>
    )}

    {error && !loading && (
      <div className="submissions-error-banner">
        <AlertCircle size={14} /> {error}
      </div>
    )}

    {!loading && !error && submission && (
      <>
        {/* Hero card */}
        <div className="detail-hero">
          <div className="hero-icon-wrap">
            <FileText size={22} color="#fff" />
          </div>
          <div className="hero-text">
            <div className="hero-title">{submission.form_title}</div>
            <div className="hero-meta">
              <span className="hero-meta-item">
                <Calendar size={13} />
                {formatDate(submission.submitted_at)}
              </span>
              <span className="hero-meta-dot" />
              <span className="hero-meta-item">
                <Clock size={13} />
                {formatTime(submission.submitted_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Submitter info strip */}
        <div className="submitter-strip">
          <span className="submitter-name">{submission.username}</span>
          <span className="submitter-sep">·</span>
          <span className="submitter-email">{submission.email}</span>
        </div>

        {/* Answers */}
        <div className="answers-card">
          <div className="answers-card-header">
            <span className="answers-card-title">Câu trả lời</span>
            <span className="answers-field-badge">{submission.answers?.length || 0} trường</span>
          </div>

          {submission.answers?.length === 0 && (
            <div className="answers-empty">Bài nộp không có câu trả lời nào.</div>
          )}

          <div className="answers-list">
            {submission.answers?.map((ans, idx) => {
              const meta = getFieldMeta(ans.field_type);
              const Icon = meta.icon;
              const isLast = idx === (submission.answers.length - 1);

              return (
                <div key={ans.id} className={`answer-row ${isLast ? 'last' : ''}`}>
                  {/* Left: icon + labels */}
                  <div className="answer-row-left">
                    <div
                      className="answer-field-icon"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="answer-field-info">
                      <div className="answer-field-label">{ans.field_label}</div>
                    </div>
                  </div>

                  {/* Right: value */}
                  <div className="answer-row-value">
                    {ans.field_type === 'color' && ans.value ? (
                      <span className="color-value">
                        <span
                          className="color-swatch"
                          style={{ background: ans.value }}
                        />
                        {ans.value}
                      </span>
                    ) : ans.value !== null && ans.value !== undefined && ans.value !== '' ? (
                      ans.value
                    ) : (
                      <span className="answer-row-empty">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>
);

/* ─── List View ─── */
const ListView = ({ submissions, loading, error, pagination, onRowClick, onPageChange }) => (
  <>
    <div className="page-header">
      <div>
        <div className="page-title">Dữ liệu nộp</div>
        <div className="page-subtitle">Tổng hợp tất cả bài nộp trên hệ thống</div>
      </div>
    </div>

    {error && (
      <div className="submissions-error-banner">
        <AlertCircle size={14} /> {error}
      </div>
    )}

    <div className="card">
      <div className="submissions-toolbar">
        <div className="toolbar-left">
          <FileText size={15} className="toolbar-icon" />
          <span className="toolbar-label">Tất cả bài nộp</span>
        </div>
        <span className="toolbar-count">
          {loading ? 'Đang tải...' : `${pagination.total} bài nộp`}
        </span>
      </div>

      {loading ? (
        <div className="submissions-loading">
          <div className="submissions-spinner" />
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Biểu mẫu</th>
                  <th>Người nộp</th>
                  <th>Email</th>
                  <th style={{ width: '160px' }}>Thời gian nộp</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty">
                      Chưa có bài nộp nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="submission-row" onClick={() => onRowClick(sub.id)}>
                      <td>
                        <div className="form-title-cell">
                          <FileText size={13} className="form-title-icon" />
                          {sub.form_title}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{sub.username}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{sub.email}</td>
                      <td className="datetime-cell">
                        <Calendar size={12} className="datetime-icon" />
                        {formatDateTime(sub.submitted_at)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <ChevronRight size={15} className="row-chevron" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} kết quả
              </span>
              <div className="pagination-controls">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  style={{ padding: '4px 10px', opacity: pagination.page <= 1 ? 0.5 : 1, cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer' }}
                >Trước</button>

                {getPageNumbers(pagination.page, pagination.totalPages).map((item, index) =>
                  item === '...'
                    ? <span key={index} className="pagination-dots">...</span>
                    : (
                      <button
                        key={index}
                        className={`btn ${pagination.page === item ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => onPageChange(item)}
                        style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: pagination.page === item ? 600 : 400, pointerEvents: pagination.page === item ? 'none' : 'auto' }}
                      >{item}</button>
                    )
                )}

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  style={{ padding: '4px 10px', opacity: pagination.page >= pagination.totalPages ? 0.5 : 1, cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
                >Sau</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </>
);

/* ─── Main Page ─── */
const Submissions = () => {
  const {
    submissions, loading, error, pagination, fetchSubmissions,
    selectedSubmission, detailLoading, detailError, fetchDetail, closeDetail,
  } = useSubmissions();

  const showDetail = detailLoading || !!selectedSubmission || !!detailError;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSubmissions(newPage, pagination.limit);
    }
  };

  return (
    <div className="page active">
      {showDetail ? (
        <DetailView
          submission={selectedSubmission}
          loading={detailLoading}
          error={detailError}
          onBack={closeDetail}
        />
      ) : (
        <ListView
          submissions={submissions}
          loading={loading}
          error={error}
          pagination={pagination}
          onRowClick={fetchDetail}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Submissions;