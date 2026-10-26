import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default configuration:
// 192.168.209.29 for physical mobile device via Expo Go on the same Wi-Fi
// 10.0.2.2 for Android emulator
// localhost for iOS simulator or web
const getDefaultBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  return 'http://10.127.158.223:5000/api';
};

export const API_STORAGE_KEY = '@tms_api_base_url';
export const TOKEN_STORAGE_KEY = '@tms_auth_token';
export const USER_STORAGE_KEY = '@tms_auth_user';

let currentBaseUrl = getDefaultBaseUrl();

export const setBaseUrl = async (url) => {
  let cleaned = url.trim();
  if (!cleaned.endsWith('/api')) {
    cleaned = cleaned.replace(/\/+$/, '') + '/api';
  }
  currentBaseUrl = cleaned;
  await AsyncStorage.setItem(API_STORAGE_KEY, cleaned);
  api.defaults.baseURL = cleaned;
  return cleaned;
};

export const getBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem(API_STORAGE_KEY);
    if (saved) {
      currentBaseUrl = saved;
      api.defaults.baseURL = saved;
      return saved;
    }
  } catch (e) {
    // fallback
  }
  return currentBaseUrl;
};

export const getFileUrl = (relativeOrAbsolute) => {
  if (!relativeOrAbsolute) return null;
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  const root = currentBaseUrl.replace(/\/api\/?$/, '');
  const path = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
  return `${root}${path}`;
};

const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response) {
      message = error.response.data?.message || `Server Error (${error.response.status})`;
    } else if (error.request) {
      message = 'Cannot connect to server. Check server IP in Settings.';
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

// Department Service
export const departmentService = {
  getAll: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};

// Programme Service
export const programmeService = {
  getAll: async (params) => {
    const res = await api.get('/programmes', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/programmes/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/programmes', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/programmes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/programmes/${id}`);
    return res.data;
  },
};

// Block Service
export const blockService = {
  getAll: async (params) => {
    const res = await api.get('/blocks', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/blocks/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/blocks', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/blocks/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/blocks/${id}`);
    return res.data;
  },
};

// Room Service
export const roomService = {
  getAll: async (params) => {
    const res = await api.get('/rooms', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/rooms/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/rooms', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/rooms/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },
};

// Role Service
export const roleService = {
  getAll: async () => {
    const res = await api.get('/roles');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/roles/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/roles', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/roles/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  },
};

// User Service
export const userService = {
  getAll: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

// Complaint Service
export const complaintService = {
  create: async (formData) => {
    const res = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getAll: async (params) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/complaints/stats');
    return res.data;
  },
  assign: async (id, assignedTo) => {
    const res = await api.patch(`/complaints/${id}/assign`, { assignedTo });
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/complaints/${id}/status`, { status });
    return res.data;
  },
  report: async (params) => {
    const res = await api.get('/complaints/report', { params });
    return res.data;
  },
};

export default api;
