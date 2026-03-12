import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // تعيين المستخدم والتوكن
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  // التحقق من حالة المصادقة
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await authService.getProfile();
      if (response.data.success) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      }
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },

  // تحديث بيانات المستخدم
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // تعيين الأخطاء
  setError: (error) => set({ error }),

  // تعيين حالة التحميل
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
