import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { apiCall } from '../../services/api';
import './Submissions.css';

const PAGE_SIZE = 10;

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
};

const Submissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSubmissions = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCall(`/api/submissions?page=${currentPage}&limit=${PAGE_SIZE}`);
      setSubmissions(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử nộp form.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions(page);
  }, [page, fetchSubmissions]);

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="sub-loading-state">
        <Loader2 className="sub-spinner" size={36} />
        <p>Đang tải lịch sử nộp form...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="sub-error-state">
        <AlertCircle size={48} className="sub-error-icon" />
        <h3>Đã xảy ra lỗi</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => fetchSubmissions(page)}>
          <RefreshCw size={15} />
          Thử lại
        </button>
      </div>
    );
  }

  /* ── Empty ── */
  if (submissions.length === 0) {
    return (
      <div className="sub-empty-state">
        <ClipboardList size={56} className="sub-empty-icon" />
        <h3>Chưa có lịch sử nộp form</h3>
        <p>Bạn chưa nộp biểu mẫu nào. Hãy khám phá và điền form ngay!</p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/forms')}>
          <FileText size={15} />
          Xem danh sách form
        </button>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="sub-container">
      {/* Header */}
      <div className="sub-header">
        <div className="sub-header-left">
          <div className="sub-header-icon-wrap">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="sub-title">Lịch sử nộp form</h1>
            <p className="sub-subtitle">
              Tổng cộng <strong>{total}</strong> lần nộp
            </p>
          </div>
        </div>
        <button
          className="sub-refresh-btn"
          onClick={() => fetchSubmissions(page)}
          title="Làm mới"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="sub-card">
        <table className="sub-table">
          <thead>
            <tr>
              <th className="col-id">
                <Hash size={13} />
                ID
              </th>
              <th className="col-form">Form ID</th>
              <th className="col-date">Ngày nộp</th>
              <th className="col-time">Giờ nộp</th>
              <th className="col-action"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, index) => {
              const dt = formatDateTime(sub.submitted_at);
              return (
                <tr
                  key={sub.id}
                  className="sub-row"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Submission ID */}
                  <td className="col-id">
                    <span className="sub-id-badge">#{sub.id}</span>
                  </td>

                  {/* Form info */}
                  <td className="col-form">
                    <div className="sub-form-cell">
                      <div className="sub-form-icon-wrap">
                        <FileText size={14} />
                      </div>
                      <div>
                        <div className="sub-form-label">Biểu mẫu</div>
                        <div className="sub-form-id">ID #{sub.form_id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="col-date">
                    <div className="sub-date-cell">
                      <Calendar size={14} className="sub-date-icon" />
                      <span>{dt.date}</span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="col-time">
                    <span className="sub-time-badge">{dt.time}</span>
                  </td>

                  {/* Action */}
                  <td className="col-action">
                    <button
                      className="sub-view-btn"
                      onClick={() => navigate(`/forms/${sub.form_id}`)}
                      title="Xem lại biểu mẫu"
                    >
                      <ExternalLink size={14} />
                      Xem form
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="sub-pagination">
          <span className="sub-page-info">
            Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
          </span>
          <div className="sub-page-btns">
            <button
              className="sub-page-btn"
              onClick={handlePrevPage}
              disabled={page === 1}
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`dots-${i}`} className="sub-page-dots">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`sub-page-btn ${item === page ? 'active' : ''}`}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              className="sub-page-btn"
              onClick={handleNextPage}
              disabled={page === totalPages}
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
