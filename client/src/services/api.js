import axios from 'axios';
import { useAuthStore } from '../store';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  verify: () => api.get('/auth/verify'),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getAllAdmin: () => api.get('/projects/admin'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  reorder: (projectIds) => api.post('/projects/reorder', { projectIds }),
};

// Skills API
export const skillsAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getGrouped: () => api.get('/skills/grouped'),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  // Skill categories
  getCategories: () => api.get('/skills/categories'),
  createCategory: (data) => api.post('/skills/categories', data),
  updateCategory: (id, data) => api.put(`/skills/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/skills/categories/${id}`),
};

// Chatbot API
export const chatbotAPI = {
  getConfig: () => api.get('/chatbot/config'),
  updateConfig: (data) => api.put('/chatbot/config', data),
  getQA: () => api.get('/chatbot/qa'),
  createQA: (data) => api.post('/chatbot/qa', data),
  updateQA: (id, data) => api.put(`/chatbot/qa/${id}`, data),
  deleteQA: (id) => api.delete(`/chatbot/qa/${id}`),
  chat: (message, visitorId, visitorName) => 
    api.post('/chatbot/chat', { message, visitor_id: visitorId, visitor_name: visitorName }),
  getMessages: (params) => api.get('/chatbot/messages', { params }),
  getStats: () => api.get('/chatbot/stats'),
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  markAsRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Translations API
export const translationsAPI = {
  getLanguages: () => api.get('/translations/languages'),
  getAllLanguages: () => api.get('/translations/languages/all'),
  getDefaultLanguage: () => api.get('/translations/default-language'),
  setDefaultLanguage: (code) => api.put('/translations/default-language', { code }),
  updateLanguage: (code, data) => api.put(`/translations/languages/${code}`, data),
  getTranslations: (lang) => api.get(`/translations/${lang}`),
  getAllTranslations: () => api.get('/translations/admin/all'),
  getByCategory: (category) => api.get(`/translations/admin/category/${category}`),
  updateTranslation: (lang, key, value, category) => 
    api.put(`/translations/${lang}/${encodeURIComponent(key)}`, { value, category }),
  bulkUpdate: (translations) => api.put('/translations/bulk/update', { translations }),
  addKey: (key, category, translations) => 
    api.post('/translations/key', { key, category, translations }),
  deleteKey: (key) => api.delete(`/translations/key/${encodeURIComponent(key)}`),
  getCategories: () => api.get('/translations/categories/list'),
};

// Experiences API
export const experiencesAPI = {
  getAll: () => api.get('/experiences'),
  getAllAdmin: () => api.get('/experiences/admin'),
  getOne: (id) => api.get(`/experiences/${id}`),
  create: (data) => api.post('/experiences', data),
  update: (id, data) => api.put(`/experiences/${id}`, data),
  delete: (id) => api.delete(`/experiences/${id}`),
  reorder: (experienceIds) => api.post('/experiences/reorder', { experienceIds }),
};

// Upload API
export const uploadAPI = {
  upload: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (url) => api.delete('/upload', { data: { url } }),
};

export default api;
