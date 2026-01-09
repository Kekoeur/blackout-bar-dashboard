// apps/bar-dashboard/src/lib/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3026/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    // Lire le token depuis localStorage à chaque requête
    const token = localStorage.getItem('bar_dashboard_token');
    
    console.log('🔐 [API Interceptor] Token found:', token ? 'YES' : 'NO'); // ⭐ DEBUG
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⭐ Interceptor pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ [API] 401 Unauthorized - Token invalide ou expiré');
      
      // Supprimer le token invalide
      localStorage.removeItem('bar_dashboard_token');
      
      // Rediriger vers login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// =============== BARS API ===============

export const barsApi = {
  getMyBars: () => api.get('/bar-management/bars'),
  
  createBar: (data: { name: string; city: string; address: string }) =>
    api.post('/bar-management/bars', data),
  
  getBarStats: (barId: string) =>
    api.get(`/bar-management/bars/${barId}/stats`),

  activateBar: (barId: string) =>
    api.patch(`/bar-management/bars/${barId}/activate`),
  
  getBarOrders: (barId: string, status?: string) =>
    api.get(`/orders/bar/${barId}`, { params: { status } }),
  
  validateOrder: (orderId: string) =>
    api.post(`/orders/${orderId}/validate`),
  
  cancelOrder: (orderId: string) =>
    api.post(`/orders/${orderId}/cancel`),
};

// =============== PHOTOS API ===============

export const photosApi = {
  getBarPhotos: (barId: string, status?: string) =>
    api.get(`/photos/bar/${barId}`, { params: { status } }),
  
  validatePhoto: (photoId: string) =>
    api.post(`/photos/${photoId}/validate`),
  
  rejectPhoto: (photoId: string) =>
    api.post(`/photos/${photoId}/reject`),
};

// =============== DRINKS API ===============

export const drinksApi = {
  getAllDrinks: (barId: string) =>
    api.get('/drinks/catalog/all', { params: { barId } }),
  
  createDrink: (data: {
    name: string;
    type: 'SHOOTER' | 'COCKTAIL';
    alcoholLevel?: number;
    ingredients?: string[];
    description?: string;
    imageUrl: string;
    barId: string;
    isPublic?: boolean;
  }) => api.post('/drinks/catalog', data),

  updateDrink: (drinkId: string, data: {
    name?: string;
    type?: 'SHOOTER' | 'COCKTAIL';
    alcoholLevel?: number;
    ingredients?: string[];
    description?: string;
    imageUrl?: string;
  }) => api.put(`/drinks/catalog/${drinkId}`, data),
  
  deleteDrink: (drinkId: string) =>
    api.delete(`/drinks/catalog/${drinkId}`),
};

// =============== MENU API ===============

export const menuApi = {
  getBarMenu: (barId: string) =>
    api.get(`/drinks/menu/${barId}`),
  
  addDrinkToMenu: (barId: string, data: { drinkId: string; price: number }) =>
    api.post(`/drinks/menu/${barId}`, data),

  addDrinksToMenuBulk: (barId: string, drinks: Array<{ drinkId: string; price: number }>) =>
    api.post(`/drinks/menu/${barId}/bulk`, { drinks }),
  
  updateMenuItem: (barId: string, drinkId: string, data: { price?: number; available?: boolean }) =>
    api.put(`/drinks/menu/${barId}/${drinkId}`, data),
  
  removeDrinkFromMenu: (barId: string, drinkId: string) =>
    api.delete(`/drinks/menu/${barId}/${drinkId}`),
};

// =============== INVITATIONS API ===============

export const invitationsApi = {
  createInvitation: (barId: string, data: {
    email: string;
    role: 'VIEWER' | 'STAFF' | 'MANAGER';
  }) => api.post(`/bar-management/bars/${barId}/invite`, data),
  
  createUserDirectly: (barId: string, data: {
    email: string;
    name: string;
    password: string;
    role: 'VIEWER' | 'STAFF' | 'MANAGER';
  }) => api.post(`/bar-management/bars/${barId}/users/create`, data),
  
  verifyInvitation: (token: string) =>
    api.get(`/bar-management/invitations/verify/${token}`),
};

// =============== ADMIN API (Super Admin uniquement) ===============

export const adminApi = {
  // Statistiques globales
  getGlobalStats: () =>
    api.get('/admin/stats'),
  
  // Gestion des bars
  getAllBars: () =>
    api.get('/admin/bars'),
  
  toggleBarActive: (barId: string) =>
    api.patch(`/admin/bars/${barId}/toggle-active`),
  
  deleteBar: (barId: string) =>
    api.delete(`/admin/bars/${barId}`),
  
  // Gestion des utilisateurs
  getAllUsers: () =>
    api.get('/admin/users'),
  
  createOwner: (data: {
    email: string;
    name: string;
    password: string;
  }) => api.post('/admin/users/create-owner', data),
  
  updateUser: (userId: string, data: {
    name?: string;
    email?: string;
  }) => api.put(`/admin/users/${userId}`, data),
  
  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),
  
  sendPasswordResetEmail: (userId: string) =>
    api.post(`/admin/users/${userId}/reset-password`),
  
  // Promotion de rôle
  promoteToOwner: (userId: string, barId: string) =>
    api.post(`/admin/users/${userId}/promote-owner`, { barId }),
};

// =============== AUTH API ===============

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/bar-management/auth/login', data),
  
  register: (data: {
    token: string;
    name: string;
    password: string;
  }) => api.post('/bar-management/auth/register', data),
  
  logout: () => {
    localStorage.removeItem('bar_dashboard_token');
    window.location.href = '/login';
  },
};