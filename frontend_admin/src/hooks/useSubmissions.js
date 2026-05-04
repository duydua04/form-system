import { useState, useEffect, useCallback } from 'react';
import { submissionService } from '../services/submission.service';

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Detail panel state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const fetchSubmissions = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await submissionService.getAllSubmissions(page, limit);
      setSubmissions(data.items || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.total_pages,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bài nộp.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (submissionId) => {
    setDetailLoading(true);
    setDetailError(null);
    setSelectedSubmission(null);
    try {
      const data = await submissionService.getSubmissionDetail(submissionId);
      setSelectedSubmission(data);
    } catch (err) {
      setDetailError(err.message || 'Không thể tải chi tiết bài nộp.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedSubmission(null);
    setDetailError(null);
  }, []);

  useEffect(() => {
    fetchSubmissions(1);
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    pagination,
    fetchSubmissions,
    selectedSubmission,
    detailLoading,
    detailError,
    fetchDetail,
    closeDetail,
  };
};