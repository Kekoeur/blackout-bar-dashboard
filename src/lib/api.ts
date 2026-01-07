// apps/bar-dashboard/src/lib/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3026/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStore = JSON.parse(localStorage.getItem('bar-dashboard-auth') || '{}');
    const token = authStore.state?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bar-dashboard-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Services
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/bar-management/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    api.post('/bar-management/auth/register', { email, password, name }),
};

export const barsApi = {
  getMyBars: () => api.get('/bar-management/bars'),
  
  createBar: (data: { name: string; city: string; address: string }) =>
    api.post('/bar-management/bars', data),
  
  getBarStats: (barId: string) =>
    api.get(`/bar-management/bars/${barId}/stats`),
  
  inviteUser: (barId: string, email: string, role: string) =>
    api.post(`/bar-management/bars/${barId}/invite`, { email, role }),
};