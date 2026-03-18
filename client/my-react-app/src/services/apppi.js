import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.apiUrl;

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن للطلبات
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالج الأخطاء
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';
    // ignore auth failures on login/register endpoints themselves
    if (status === 401 && !reqUrl.includes('/auth/login') && !reqUrl.includes('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // navigate using history to avoid hard reload unless already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
