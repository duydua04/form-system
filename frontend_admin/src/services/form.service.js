import { apiCall } from './api';

export const formService = {
  // filter: 'all' | 'today' | 'this_week'
  getForms: async (page = 1, limit = 10, filter = 'all') => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(filter !== 'all' && { time_filter: filter }),
    });
    return await apiCall(`/api/forms?${params.toString()}`, {
      method: 'GET',
    });
  },

  getFormDetail: async (formId) => {
    return await apiCall(`/api/forms/${formId}`, {
      method: 'GET',
    });
  },

  createForm: async (data) => {
    return await apiCall('/api/forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateForm: async (formId, data) => {
    return await apiCall(`/api/forms/${formId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteForm: async (formId) => {
    return await apiCall(`/api/forms/${formId}`, {
      method: 'DELETE',
    });
  },

  // Field APIs
  createField: async (formId, data) => {
    return await apiCall(`/api/forms/${formId}/fields`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateField: async (formId, fieldId, data) => {
    return await apiCall(`/api/forms/${formId}/fields/${fieldId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteField: async (formId, fieldId) => {
    return await apiCall(`/api/forms/${formId}/fields/${fieldId}`, {
      method: 'DELETE',
    });
  },

  reorderFields: async (formId, ordered_field_ids) => {
    return await apiCall(`/api/forms/${formId}/fields/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ ordered_field_ids }),
    });
  }
};