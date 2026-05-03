export const BASE_URL = 'http://localhost:8000';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', 
  });

  if (response.status === 401 && !endpoint.includes('/api/auth/refresh') && !endpoint.includes('/api/auth/login')) {
    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        return apiCall(endpoint, options);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
      });

      if (refreshRes.ok) {
        processQueue(null);
        response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          credentials: 'include',
        });
      } else {
        processQueue(new Error('Session expired'));
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    } catch (err) {
      processQueue(err);
      window.location.href = '/login';
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || 'An error occurred';
    const errorDetails = data.details || null;
    const error = new Error(errorMessage);
    error.code = data?.error_code || response.status;
    error.details = errorDetails;
    throw error;
  }

  return data;
};
