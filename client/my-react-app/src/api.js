import config from '../config';
import useAuthStore from '../store/authStore';

// إنشاء كائن API موحد
const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${config.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${config.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Books endpoints
  getBooks: async () => {
    const response = await fetch(`${config.apiUrl}/books`);
    return response.json();
  },

  getBook: async (id) => {
    const response = await fetch(`${config.apiUrl}/books/${id}`);
    return response.json();
  },

  // Quizzes endpoints
  getQuizzes: async () => {
    const response = await fetch(`${config.apiUrl}/quizzes`);
    return response.json();
  },

  // Chat endpoints
  sendMessage: async (bookId, message) => {
    const response = await fetch(`${config.apiUrl}/ai/chat/${bookId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },

  // Helper function for authenticated requests
  authRequest: async (url, options = {}) => {
    const token = useAuthStore.getState().token;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${config.apiUrl}${url}`, {
      ...options,
      headers,
    });
    return response.json();
  },
};

export default api;