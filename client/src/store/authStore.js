import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('packcraft_token') || null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  error: null,

  loadUser: async () => {
    const token = localStorage.getItem('packcraft_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, loading: false });
      return;
    }
    try {
      set({ loading: true });
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        set({
          user: res.data,
          token,
          isAuthenticated: true,
          isAdmin: res.data.role === 'admin',
          loading: false,
          error: null,
        });
      }
    } catch {
      localStorage.removeItem('packcraft_token');
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await authAPI.login({ email, password });
      if (res.success && res.data) {
        const { token, ...userData } = res.data;
        localStorage.setItem('packcraft_token', token);
        set({
          user: userData,
          token,
          isAuthenticated: true,
          isAdmin: userData.role === 'admin',
          loading: false,
          error: null,
        });
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  register: async (formData) => {
    try {
      set({ loading: true, error: null });
      const res = await authAPI.register(formData);
      if (res.success && res.data) {
        const { token, ...userData } = res.data;
        localStorage.setItem('packcraft_token', token);
        set({
          user: userData,
          token,
          isAuthenticated: true,
          isAdmin: userData.role === 'admin',
          loading: false,
          error: null,
        });
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('packcraft_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
      error: null,
    });
  },
}));
