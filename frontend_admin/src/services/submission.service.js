import { apiCall } from './api';

export const submissionService = {
  /**
   * Lấy TẤT CẢ bài nộp trên hệ thống (Global Log)
   * GET /api/admin/submissions?page=1&limit=10
   */
  getAllSubmissions: async (page = 1, limit = 10) => {
    return await apiCall(`/api/admin/submissions?page=${page}&limit=${limit}`);
  },

  /**
   * Lấy danh sách bài nộp của 1 form cụ thể
   * GET /api/admin/forms/{form_id}/submissions?page=1&limit=10
   */
  getFormSubmissions: async (formId, page = 1, limit = 10) => {
    return await apiCall(`/api/admin/forms/${formId}/submissions?page=${page}&limit=${limit}`);
  },

  /**
   * Xem chi tiết 1 bài nộp
   * GET /api/admin/submissions/{submission_id}
   */
  getSubmissionDetail: async (submissionId) => {
    return await apiCall(`/api/admin/submissions/${submissionId}`);
  },

  getPresignedUrl: async (path) => {
    return await apiCall(`/api/files/presigned-url?path=${encodeURIComponent(path)}`);
  }
};