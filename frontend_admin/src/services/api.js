export const BASE_URL = 'http://localhost:8000'; // Assume backend runs on port 8000 by default

export const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // include auth token or rely on credentials (cookies)
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // include cookies in requests if needed by backend (the backend uses HTTP-only cookies)
    credentials: 'include', 
  });

  const data = await response.json();

  if (!response.ok) {
    // Handling error structure from backend utils/error_helper
    const errorMessage = data.message || 'An error occurred';
    const errorDetails = data.details || null;
    const error = new Error(errorMessage);
    error.code = data.error_code;
    error.details = errorDetails;
    throw error;
  }

  return data;
};
